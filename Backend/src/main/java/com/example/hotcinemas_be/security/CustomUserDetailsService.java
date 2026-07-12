package com.example.hotcinemas_be.security;

import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.models.Permission;
import com.example.hotcinemas_be.models.Role;
import com.example.hotcinemas_be.models.User;
import com.example.hotcinemas_be.models.UserRole;
import com.example.hotcinemas_be.repositorys.UserRepository;
import com.example.hotcinemas_be.repositorys.UserRoleRepository;
import com.example.hotcinemas_be.services.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PermissionService permissionService;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException("User not found by email: " + email, ErrorCode.USER_NOT_FOUND));

        Set<GrantedAuthority> authorities = new HashSet<>();

        Set<UserRole> userRoles = userRoleRepository.findUserRoleByUser_Id(user.getId());
        if (userRoles == null || userRoles.isEmpty()) {
            throw new AppException(ErrorCode.USER_ROLE_NOT_FOUND);
        }

        for (UserRole userRole : userRoles) {
            Role role = userRole.getRole();
            if (role == null) {
                continue;
            }
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));

            List<Permission> permissions = permissionService.getPermissionsByRoleId(role.getId());
            if (permissions != null) {
                permissions.forEach(p -> authorities.add(new SimpleGrantedAuthority(p.getName())));
            }
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword() != null ? user.getPassword() : "")
                .authorities(authorities)
                .build();
    }
}
