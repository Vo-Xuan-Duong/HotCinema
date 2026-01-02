package com.example.hotcinemas_be.jwts;

import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.models.Permission;
import com.example.hotcinemas_be.models.Role;
import com.example.hotcinemas_be.models.User;
import com.example.hotcinemas_be.repositorys.RolePermissionRepository;
import com.example.hotcinemas_be.repositorys.UserRepository;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final PermissionService permissionService;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException("User not found by email: " + email, ErrorCode.USER_NOT_FOUND));

        Set<GrantedAuthority> authorities = new HashSet<>();

        Role role = user.getRole();

        List<Permission> permissions = permissionService.getPermissionsByRoleId(role.getId());

        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));

        permissions.forEach(rolePermission -> authorities.add(new SimpleGrantedAuthority(rolePermission.getName())));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(authorities)
                .build();
    }
}
