package com.example.hotcinemas_be.config;

import com.example.hotcinemas_be.models.Role;
import com.example.hotcinemas_be.models.User;
import com.example.hotcinemas_be.repositorys.RoleRepository;
import com.example.hotcinemas_be.repositorys.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableAsync
@EnableScheduling
public class AppInitConfig {
    private final PasswordEncoder passwordEncoder;

    public AppInitConfig() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // Tạm thời comment để tránh lỗi khi database chưa có bảng
    @Bean
    public ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository,
            com.example.hotcinemas_be.repositorys.PermissionRepository permissionRepository) {
        return args -> {
            Role adminRole;
            if (roleRepository.findByName("Admin").isEmpty()) {
                adminRole = new Role();
                adminRole.setName("Admin");
                adminRole.setDescription("Admin");
                roleRepository.save(adminRole);
                System.out.println("ROLE 'admin' has been created");
            } else {
                adminRole = roleRepository.findByName("Admin").get();
            }
            if (roleRepository.findByName("User").isEmpty()) {
                adminRole = new Role();
                adminRole.setName("User");
                adminRole.setDescription("User");
                roleRepository.save(adminRole);
                System.out.println("ROLE 'user' has been created");
            }
            if (roleRepository.findByName("Staff").isEmpty()) {
                adminRole = new Role();
                adminRole.setName("Staff");
                adminRole.setDescription("Staff");
                roleRepository.save(adminRole);
                System.out.println("ROLE 'Staff' has been created");
            }

            // Init Permissions
            java.util.Map<String, java.util.List<String[]>> permissionsMap = new java.util.HashMap<>();
            permissionsMap.put("User", java.util.Arrays.asList(
                    new String[] { "USER_CREATE", "Tạo người dùng mới" },
                    new String[] { "USER_READ", "Xem thông tin người dùng" },
                    new String[] { "USER_LIST", "Xem danh sách người dùng" },
                    new String[] { "USER_UPDATE", "Cập nhật thông tin người dùng" },
                    new String[] { "USER_DELETE", "Xóa người dùng" },
                    new String[] { "USER_CHANGE_PASSWORD", "Đổi mật khẩu người dùng" },
                    new String[] { "USER_CHANGE_AVATAR", "Đổi ảnh đại diện" },
                    new String[] { "USER_CHANGE_ROLE", "Thay đổi vai trò người dùng" },
                    new String[] { "USER_ACTIVATE", "Kích hoạt tài khoản" },
                    new String[] { "USER_DEACTIVATE", "Vô hiệu hóa tài khoản" },
                    new String[] { "USER_SEARCH", "Tìm kiếm người dùng" },
                    new String[] { "USER_PROFILE_VIEW", "Xem profile cá nhân" },
                    new String[] { "USER_PROFILE_UPDATE", "Cập nhật profile cá nhân" }));

            permissionsMap.put("Role", java.util.Arrays.asList(
                    new String[] { "ROLE_CREATE", "Tạo vai trò mới" },
                    new String[] { "ROLE_READ", "Xem thông tin vai trò" },
                    new String[] { "ROLE_LIST", "Xem danh sách vai trò" },
                    new String[] { "ROLE_UPDATE", "Cập nhật vai trò" },
                    new String[] { "ROLE_DELETE", "Xóa vai trò" },
                    new String[] { "ROLE_ACTIVATE", "Kích hoạt vai trò" },
                    new String[] { "ROLE_DEACTIVATE", "Vô hiệu hóa vai trò" },
                    new String[] { "ROLE_ADD_PERMISSION", "Thêm quyền vào vai trò" },
                    new String[] { "ROLE_REMOVE_PERMISSION", "Xóa quyền khỏi vai trò" }));

            permissionsMap.put("Permission", java.util.Arrays.asList(
                    new String[] { "PERMISSION_CREATE", "Tạo quyền mới" },
                    new String[] { "PERMISSION_READ", "Xem thông tin quyền" },
                    new String[] { "PERMISSION_LIST", "Xem danh sách quyền" },
                    new String[] { "PERMISSION_UPDATE", "Cập nhật quyền" },
                    new String[] { "PERMISSION_DELETE", "Xóa quyền" }));

            permissionsMap.put("Movie", java.util.Arrays.asList(
                    new String[] { "MOVIE_CREATE", "Tạo phim mới" },
                    new String[] { "MOVIE_READ", "Xem thông tin phim" },
                    new String[] { "MOVIE_LIST", "Xem danh sách phim" },
                    new String[] { "MOVIE_UPDATE", "Cập nhật thông tin phim" },
                    new String[] { "MOVIE_DELETE", "Xóa phim" },
                    new String[] { "MOVIE_SEARCH", "Tìm kiếm phim" },
                    new String[] { "MOVIE_VIEW_COMING_SOON", "Xem phim sắp chiếu" },
                    new String[] { "MOVIE_VIEW_NOW_SHOWING", "Xem phim đang chiếu" },
                    new String[] { "MOVIE_VIEW_TOP_RATED", "Xem phim đánh giá cao" }));

            permissionsMap.put("Cinema", java.util.Arrays.asList(
                    new String[] { "CINEMA_CREATE", "Tạo rạp mới" },
                    new String[] { "CINEMA_READ", "Xem thông tin rạp" },
                    new String[] { "CINEMA_LIST", "Xem danh sách rạp" },
                    new String[] { "CINEMA_UPDATE", "Cập nhật thông tin rạp" },
                    new String[] { "CINEMA_DELETE", "Xóa rạp" },
                    new String[] { "CINEMA_SEARCH_BY_REGION", "Tìm rạp theo khu vực" },
                    new String[] { "CINEMA_SEARCH_BY_MOVIE", "Tìm rạp chiếu phim" }));

            permissionsMap.put("Theater", java.util.Arrays.asList(
                    new String[] { "THEATER_CREATE", "Tạo phòng chiếu mới" },
                    new String[] { "THEATER_READ", "Xem thông tin phòng chiếu" },
                    new String[] { "THEATER_LIST", "Xem danh sách phòng chiếu" },
                    new String[] { "THEATER_UPDATE", "Cập nhật phòng chiếu" },
                    new String[] { "THEATER_DELETE", "Xóa phòng chiếu" },
                    new String[] { "THEATER_DELETE_BY_CINEMA", "Xóa tất cả phòng chiếu của rạp" },
                    new String[] { "THEATER_LIST_BY_CINEMA", "Xem phòng chiếu theo rạp" }));

            permissionsMap.put("Seat", java.util.Arrays.asList(
                    new String[] { "SEAT_CREATE", "Tạo ghế mới" },
                    new String[] { "SEAT_READ", "Xem thông tin ghế" },
                    new String[] { "SEAT_LIST", "Xem danh sách ghế" },
                    new String[] { "SEAT_UPDATE", "Cập nhật thông tin ghế" },
                    new String[] { "SEAT_DELETE", "Xóa ghế" },
                    new String[] { "SEAT_CREATE_BULK", "Tạo hàng loạt ghế" },
                    new String[] { "SEAT_DELETE_BY_THEATER", "Xóa tất cả ghế của phòng chiếu" },
                    new String[] { "SEAT_LIST_BY_THEATER", "Xem ghế theo phòng chiếu" }));

            permissionsMap.put("Showtime", java.util.Arrays.asList(
                    new String[] { "SHOWTIME_CREATE", "Tạo lịch chiếu mới" },
                    new String[] { "SHOWTIME_READ", "Xem thông tin lịch chiếu" },
                    new String[] { "SHOWTIME_LIST", "Xem danh sách lịch chiếu" },
                    new String[] { "SHOWTIME_UPDATE", "Cập nhật lịch chiếu" },
                    new String[] { "SHOWTIME_DELETE", "Xóa lịch chiếu" },
                    new String[] { "SHOWTIME_UPDATE_STATUS", "Cập nhật trạng thái lịch chiếu" },
                    new String[] { "SHOWTIME_DELETE_BY_MOVIE", "Xóa lịch chiếu theo phim" },
                    new String[] { "SHOWTIME_DELETE_BY_THEATER", "Xóa lịch chiếu theo phòng chiếu" },
                    new String[] { "SHOWTIME_LOCK_SEAT", "Khóa ghế trong lịch chiếu" },
                    new String[] { "SHOWTIME_UNLOCK_SEAT", "Mở khóa ghế trong lịch chiếu" },
                    new String[] { "SHOWTIME_SEARCH", "Tìm kiếm lịch chiếu" },
                    new String[] { "SHOWTIME_BY_MOVIE", "Xem lịch chiếu theo phim" },
                    new String[] { "SHOWTIME_BY_THEATER", "Xem lịch chiếu theo phòng chiếu" }));

            permissionsMap.put("Booking", java.util.Arrays.asList(
                    new String[] { "BOOKING_CREATE", "Tạo đơn đặt vé" },
                    new String[] { "BOOKING_READ", "Xem thông tin đặt vé" },
                    new String[] { "BOOKING_LIST", "Xem danh sách đặt vé" },
                    new String[] { "BOOKING_UPDATE", "Cập nhật đặt vé" },
                    new String[] { "BOOKING_DELETE", "Hủy đặt vé" },
                    new String[] { "BOOKING_UPDATE_STATUS", "Cập nhật trạng thái đặt vé" },
                    new String[] { "BOOKING_CONFIRM", "Xác nhận đặt vé" },
                    new String[] { "BOOKING_CANCEL", "Hủy đặt vé (User/Admin)" },
                    new String[] { "BOOKING_LIST_BY_USER", "Xem đặt vé của người dùng" },
                    new String[] { "BOOKING_LIST_BY_SHOWTIME", "Xem đặt vé theo lịch chiếu" },
                    new String[] { "BOOKING_MY_BOOKINGS", "Xem đơn đặt vé của tôi" }));

            permissionsMap.put("Payment", java.util.Arrays.asList(
                    new String[] { "PAYMENT_CREATE", "Tạo giao dịch thanh toán" },
                    new String[] { "PAYMENT_READ", "Xem thông tin thanh toán" },
                    new String[] { "PAYMENT_LIST", "Xem danh sách thanh toán" },
                    new String[] { "PAYMENT_UPDATE", "Cập nhật thanh toán" },
                    new String[] { "PAYMENT_DELETE", "Xóa giao dịch thanh toán" },
                    new String[] { "PAYMENT_CALLBACK", "Xử lý callback thanh toán" }));

            permissionsMap.put("Review", java.util.Arrays.asList(
                    new String[] { "REVIEW_CREATE", "Tạo đánh giá mới" },
                    new String[] { "REVIEW_READ", "Xem đánh giá" },
                    new String[] { "REVIEW_LIST", "Xem danh sách đánh giá" },
                    new String[] { "REVIEW_UPDATE", "Cập nhật đánh giá" },
                    new String[] { "REVIEW_DELETE", "Xóa đánh giá" },
                    new String[] { "REVIEW_LIST_BY_MOVIE", "Xem đánh giá theo phim" }));

            permissionsMap.put("Genre", java.util.Arrays.asList(
                    new String[] { "GENRE_CREATE", "Tạo thể loại mới" },
                    new String[] { "GENRE_READ", "Xem thông tin thể loại" },
                    new String[] { "GENRE_LIST", "Xem danh sách thể loại" },
                    new String[] { "GENRE_UPDATE", "Cập nhật thể loại" },
                    new String[] { "GENRE_DELETE", "Xóa thể loại" }));

            permissionsMap.put("Promotion", java.util.Arrays.asList(
                    new String[] { "PROMOTION_CREATE", "Tạo khuyến mãi mới" },
                    new String[] { "PROMOTION_READ", "Xem thông tin khuyến mãi" },
                    new String[] { "PROMOTION_LIST", "Xem danh sách khuyến mãi" },
                    new String[] { "PROMOTION_UPDATE", "Cập nhật khuyến mãi" },
                    new String[] { "PROMOTION_DELETE", "Xóa khuyến mãi" },
                    new String[] { "PROMOTION_ACTIVATE", "Kích hoạt khuyến mãi" },
                    new String[] { "PROMOTION_DEACTIVATE", "Vô hiệu hóa khuyến mãi" }));

            permissionsMap.put("Region", java.util.Arrays.asList(
                    new String[] { "REGION_CREATE", "Tạo khu vực mới" },
                    new String[] { "REGION_READ", "Xem thông tin khu vực" },
                    new String[] { "REGION_LIST", "Xem danh sách khu vực" },
                    new String[] { "REGION_UPDATE", "Cập nhật khu vực" },
                    new String[] { "REGION_DELETE", "Xóa khu vực" }));

            permissionsMap.put("Revenue", java.util.Arrays.asList(
                    new String[] { "REVENUE_VIEW", "Xem báo cáo doanh thu" },
                    new String[] { "REVENUE_VIEW_BY_CINEMA", "Xem doanh thu theo rạp" },
                    new String[] { "REVENUE_VIEW_BY_MOVIE", "Xem doanh thu theo phim" },
                    new String[] { "REVENUE_VIEW_STATISTICS", "Xem thống kê doanh thu" }));

            permissionsMap.put("Cache", java.util.Arrays.asList(
                    new String[] { "CACHE_CLEAR_ALL", "Xóa toàn bộ cache" },
                    new String[] { "CACHE_CLEAR_SPECIFIC", "Xóa cache cụ thể" },
                    new String[] { "CACHE_VIEW", "Xem thông tin cache" }));

            permissionsMap.put("Email", java.util.Arrays.asList(
                    new String[] { "EMAIL_SEND", "Gửi email" },
                    new String[] { "EMAIL_SEND_BOOKING", "Gửi email xác nhận đặt vé" }));

            for (java.util.Map.Entry<String, java.util.List<String[]>> entry : permissionsMap.entrySet()) {
                String module = entry.getKey();
                for (String[] permData : entry.getValue()) {
                    String name = permData[0];
                    String description = permData[1];
                    if (!permissionRepository.existsByName(name)) {
                        com.example.hotcinemas_be.models.Permission p = com.example.hotcinemas_be.models.Permission
                                .builder()
                                .name(name)
                                .module(module)
                                .description(description)
                                .build();
                        permissionRepository.save(p);
                        System.out.println("PERMISSION '" + name + "' created.");
                    }
                }
            }

            if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
                User adminUser = new User();
                adminUser.setPassword(passwordEncoder.encode("admin123")); // This should be changed to a secure
                                                                           // password
                adminUser.setEmail("admin@gmail.com");
                adminUser.setFullName("Admin User");
                adminUser.setPhone("1234567890");
                adminUser.setAddress("Localhost");
                adminUser.setAvatarUrl("https://example.com/avatar.png");
                adminUser.setIsActive(true);
                adminUser.setRole(adminRole);
                userRepository.save(adminUser);
                System.out.println("Admin user has been created with roles: " + adminRole);
            } else {
                System.out.println("Admin user already exists.");
            }
            System.out.println("Application initialization logic goes here.");
        };
    }
}
