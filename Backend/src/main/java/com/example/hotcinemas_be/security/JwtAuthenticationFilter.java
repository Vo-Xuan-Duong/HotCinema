package com.example.hotcinemas_be.jwts;

import com.example.hotcinemas_be.enums.TokenType;
import com.example.hotcinemas_be.services.BlackListService;
import io.micrometer.common.util.StringUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Service
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final BlackListService blackListService;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   UserDetailsService userDetailsService ,
                                   BlackListService blackListService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.blackListService = blackListService;
    }

    @Override
    protected void doFilterInternal(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response, @NotNull FilterChain filterChain) throws ServletException, IOException {
        log.info("------------------------------------JWT_Filter_Internal----------------------------");
        String authorizationHeader = request.getHeader("Authorization");
        try {
            log.info("Authorization Header: {}", authorizationHeader);
            if (StringUtils.isBlank(authorizationHeader) || !authorizationHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }
            String tokenJwt = authorizationHeader.substring(7);

            if(blackListService.isTokenBlacklisted(tokenJwt)) {
                log.error("JWT Token is blacklisted");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT Token is blacklisted");
            }

            String userName = jwtService.extractUsername(tokenJwt, TokenType.ACCESS);
            log.info("Username extracted from JWT: {}", userName);

            if (userName == null) {
                log.error("JWT Token is not valid");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT Token is not valid");
            }

            if(SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails = userDetailsService.loadUserByUsername(userName);

                log.info("UserDetails loaded for username: {}", userName);

                if (jwtService.validateToken(tokenJwt, userDetails, TokenType.ACCESS)) {

                    String token = jwtService.extractId(tokenJwt, TokenType.ACCESS);

                    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                    authenticationToken.setDetails(token);

                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);

                    log.info("SecurityContextHolder updated with authentication for user: {}", userName);

                    filterChain.doFilter(request, response);
                } else {
                    log.error("JWT Token is not valid for user: {}", userName);

                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT Token is not valid");
                }

            } else {
                log.info("User is already authenticated: {}", userName);
            }

        } catch (Exception e) {
            log.error("JWT Token is not valid: {}", e.getMessage());
        }


    }
}
