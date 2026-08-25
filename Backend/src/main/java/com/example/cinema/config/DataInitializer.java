package com.example.cinema.config;

import com.example.cinema.entity.Role;
import com.example.cinema.entity.User;
import com.example.cinema.entity.enums.Gender;
import com.example.cinema.entity.enums.UserStatus;
import com.example.cinema.repository.RoleRepository;
import com.example.cinema.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String DEFAULT_ADMIN_EMAIL = "admin@hotcinema.vn";
    private static final String DEFAULT_ADMIN_PASSWORD = "Admin@123456";

    @Override
    @Transactional
    public void run(String... args) {
        Role adminRole = createRoleIfMissing(
                "admin",
                "Quản trị viên",
                "Toàn quyền quản trị hệ thống"
        );
        createRoleIfMissing("manager", "Quản lý", "Quản lý vận hành rạp phim");
        createRoleIfMissing("staff", "Nhân viên", "Nhân viên vận hành");
        createRoleIfMissing("user", "Khách hàng", "Tài khoản khách hàng thông thường");
        createRoleIfMissing("moderator", "Kiểm duyệt viên", "Kiểm duyệt nội dung và đánh giá");

        createAdminIfMissing(adminRole);
    }

    private Role createRoleIfMissing(String code, String name, String description) {
        return roleRepository.findRoleByCode(code)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .code(code)
                        .name(name)
                        .description(description)
                        .createdAt(ZonedDateTime.now())
                        .build()));
    }

    private void createAdminIfMissing(Role adminRole) {
        if (userRepository.existsByEmailIgnoreCase(DEFAULT_ADMIN_EMAIL)) {
            return;
        }

        User admin = User.builder()
                .email(DEFAULT_ADMIN_EMAIL)
                .phone("0900000000")
                .passwordHash(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD))
                .fullName("System Administrator")
                .gender(Gender.OTHER)
                .avatarUrl("")
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .phoneVerified(true)
                .lastLoginAt(null)
                .roles(new HashSet<>(Set.of(adminRole)))
                .build();

        userRepository.save(admin);
    }
}
