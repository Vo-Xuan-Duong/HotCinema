package com.example.cinema.config;


import com.example.cinema.security.RestAccessDeniedHandler;
import com.example.cinema.security.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
public class SecurityConfig {


    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider(userDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(daoAuthenticationProvider);
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName("roles");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return authenticationConverter;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   RestAccessDeniedHandler restAccessDeniedHandler,
                                                   RestAuthenticationEntryPoint restAuthenticationEntryPoint
    ) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                    .requestMatchers(
                            "/v3/api-docs/**",
                            "/swagger-ui/**",
                            "/swagger-ui.html"
                    ).permitAll()

                    .requestMatchers(HttpMethod.GET,
                            "/api/v1/movies/**",
                            "/api/v1/cinemas/**",
                            "/api/v1/genres/**",
                            "/api/v1/showtimes/**",
                            "/api/v1/auditoriums/**",
                            "/api/v1/seats/**",
                            "/api/v1/seattypes/**",
                            "/api/v1/showtimeseats/**",
                            "/api/v1/showtimeprices/**",
                            "/api/v1/moviemedias/**",
                            "/api/v1/promotions/**",
                            "/api/v1/products/**",
                            "/api/v1/productcategories/**",
                            "/api/v1/cinemaproducts/**"
                    ).permitAll()

                    .requestMatchers(
                            "/api/v1/roles/**",
                            "/api/v1/users/**",
                            "/api/v1/auditlogs/**",
                            "/api/v1/employeecinemas/**",
                            "/api/v1/refreshtokens/**",
                            "/api/v1/paymentwebhooks/**"
                    ).hasRole("ADMIN")
                    .requestMatchers(
                            "/api/v1/auths/login",
                            "/api/v1/auths/register",
                            "/api/v1/auths/refresh",
                            "/api/v1/auths/verify-otp",
                            "/api/v1/auths/resend-otp",
                            "/api/v1/auths/forgot-password",
                            "/api/v1/auths/verify-password-otp",
                            "/api/v1/auths/reset-password"
                    ).permitAll()

                    .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")

                    .anyRequest()
                    .authenticated()
                )

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(restAuthenticationEntryPoint)
                        .accessDeniedHandler(restAccessDeniedHandler)
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt ->
                        jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())
                ));

        return http.build();
    }
}
