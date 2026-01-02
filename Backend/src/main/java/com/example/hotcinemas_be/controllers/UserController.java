package com.example.hotcinemas_be.controllers;

import java.time.LocalDateTime;

import com.example.hotcinemas_be.dtos.auth.requests.UpdatePasswordRequest;
import com.example.hotcinemas_be.dtos.user.requests.*;
import com.example.hotcinemas_be.dtos.auth.requests.RegisterRequest;
import com.example.hotcinemas_be.dtos.user.responses.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.hotcinemas_be.dtos.common.DataResponse;
import com.example.hotcinemas_be.services.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

        private final UserService userService;

        @Operation(summary = "Create a new user", description = "Create a new user account")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "User created successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid input data"),
                        @ApiResponse(responseCode = "409", description = "User already exists")
        })
        @PostMapping
        public ResponseEntity<DataResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest userRequest) {
                log.info("Creating new user with fullName: {}", userRequest.getFullName());
                UserResponse userResponse = userService.createUser(userRequest);

                DataResponse<UserResponse> dataResponse = DataResponse.<UserResponse>builder()
                                .status(HttpStatus.CREATED.value())
                                .message("User created successfully")
                                .data(userResponse)
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.status(HttpStatus.CREATED).body(dataResponse);
        }

        @Operation(summary = "Register a new user", description = "Register a new user account")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "User registered successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid input data")
        })
        @PostMapping("/register")
        public ResponseEntity<DataResponse<UserResponse>> registerUser(
                        @Valid @RequestBody RegisterRequest registerRequest) {
                log.info("Registering new user with fullName: {}", registerRequest.getFullName());
                UserResponse userResponse = userService.registerUser(registerRequest);

                DataResponse<UserResponse> dataResponse = DataResponse.<UserResponse>builder()
                                .status(HttpStatus.CREATED.value())
                                .message("User registered successfully")
                                .data(userResponse)
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.status(HttpStatus.CREATED).body(dataResponse);
        }

        @Operation(summary = "Get user by ID", description = "Retrieve a user by their ID")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "User found"),
                        @ApiResponse(responseCode = "404", description = "User not found")
        })
        @GetMapping("/{id}")
        public ResponseEntity<DataResponse<UserResponse>> getUserById(
                        @Parameter(description = "User ID") @PathVariable Long id) {
                log.info("Getting user by ID: {}", id);
                UserResponse userResponse = userService.getUserById(id);

                DataResponse<UserResponse> dataResponse = DataResponse.<UserResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("User retrieved successfully")
                                .data(userResponse)
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get all users", description = "Retrieve all users with pagination")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Users retrieved successfully")
        })
        @GetMapping
        public ResponseEntity<DataResponse<Page<UserResponse>>> getAllUsers(
                        @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
                        @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
                        @Parameter(description = "Sort direction") @RequestParam(defaultValue = "asc") String sortDir) {

                log.info("Getting all users - page: {}, size: {}, sortBy: {}, sortDir: {}", page, size, sortBy,
                                sortDir);

                Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                                sortBy);
                Pageable pageable = PageRequest.of(page, size, sort);
                Page<UserResponse> users = userService.getAllUsers(pageable);

                DataResponse<Page<UserResponse>> dataResponse = DataResponse.<Page<UserResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Users retrieved successfully")
                                .data(users)
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Update user", description = "Update user information")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "User updated successfully"),
                        @ApiResponse(responseCode = "404", description = "User not found"),
                        @ApiResponse(responseCode = "400", description = "Invalid input data")
        })
        @PutMapping("/{id}")
        public ResponseEntity<DataResponse<UserResponse>> updateUser(
                        @Parameter(description = "User ID") @PathVariable Long id,
                        @Valid @RequestBody UserUpdateRequest userRequest) {
                log.info("Updating user with ID: {}", id);
                UserResponse userResponse = userService.updateUser(id, userRequest);

                DataResponse<UserResponse> dataResponse = DataResponse.<UserResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("User updated successfully")
                                .data(userResponse)
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Delete user", description = "Delete a user by ID")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "User deleted successfully"),
                        @ApiResponse(responseCode = "404", description = "User not found")
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<DataResponse<Void>> deleteUser(
                        @Parameter(description = "User ID") @PathVariable Long id) {
                log.info("Deleting user with ID: {}", id);
                userService.deleteUser(id);

                DataResponse<Void> dataResponse = DataResponse.<Void>builder()
                                .status(HttpStatus.OK.value())
                                .message("User deleted successfully")
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Search users", description = "Search users by keyword")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Search completed successfully")
        })
        @GetMapping("/search")
        public ResponseEntity<DataResponse<Page<UserResponse>>> searchUsers(
                        @Parameter(description = "Search keyword") @RequestParam String keyword,
                        @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {

                log.info("Searching users with keyword: {}", keyword);
                Pageable pageable = PageRequest.of(page, size);
                Page<UserResponse> users = userService.searchUsers(keyword, pageable);

                DataResponse<Page<UserResponse>> dataResponse = DataResponse.<Page<UserResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Search completed successfully")
                                .data(users)
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get user by email", description = "Retrieve a user by email address")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "User found"),
                        @ApiResponse(responseCode = "404", description = "User not found")
        })
        @GetMapping("/email/{email}")
        public ResponseEntity<DataResponse<UserResponse>> getUserByEmail(
                        @Parameter(description = "User email") @PathVariable String email) {
                log.info("Getting user by email: {}", email);
                UserResponse userResponse = userService.getUserByEmail(email);

                DataResponse<UserResponse> dataResponse = DataResponse.<UserResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("User retrieved successfully")
                                .data(userResponse)
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Update user password", description = "Update user password")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Password updated successfully"),
                        @ApiResponse(responseCode = "404", description = "User not found"),
                        @ApiResponse(responseCode = "400", description = "Invalid password data")
        })
        @PutMapping("/{id}/password")
        public ResponseEntity<DataResponse<UserResponse>> updateUserPassword(
                        @Parameter(description = "User ID") @PathVariable Long id,
                        @Valid @RequestBody UpdatePasswordRequest updatePasswordRequest) {
                log.info("Updating password for user ID: {}", id);
                UserResponse userResponse = userService.updateUserPassword(id, updatePasswordRequest);

                DataResponse<UserResponse> dataResponse = DataResponse.<UserResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Password updated successfully")
                                .data(userResponse)
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Update user avatar", description = "Update user avatar URL")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Avatar updated successfully"),
                        @ApiResponse(responseCode = "404", description = "User not found")
        })

        @PutMapping("/{id}/avatar")
        public ResponseEntity<DataResponse<UserResponse>> updateUserAvatar(
                        @Parameter(description = "User ID") @PathVariable Long id,
                        @Parameter(description = "Avatar URL") @RequestParam String avatarUrl) {
                log.info("Updating avatar for user ID: {}", id);
                UserResponse userResponse = userService.updateUserAvatar(id, avatarUrl);

                DataResponse<UserResponse> dataResponse = DataResponse.<UserResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Avatar updated successfully")
                                .data(userResponse)
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Change role to user", description = "Change a role to user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Role changed successfully"),
                        @ApiResponse(responseCode = "404", description = "User or role not found")
        })
        @PostMapping("/{id}/change-roles")
        public ResponseEntity<DataResponse<UserResponse>> addRoleToUser(
                        @Parameter(description = "User ID") @PathVariable Long id,
                        @Parameter(description = "Roles to add") @RequestParam String role) {
                log.info("Changing role {} to user ID: {}", role, id);
                userService.changeRoleForUser(id, role);

                DataResponse<UserResponse> dataResponse = DataResponse.<UserResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Role added successfully")
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Activate user", description = "Activate a user account")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "User activated successfully"),
                        @ApiResponse(responseCode = "404", description = "User not found")
        })
        @PutMapping("/{id}/activate")
        public ResponseEntity<DataResponse<Boolean>> activateUser(
                        @Parameter(description = "User ID") @PathVariable Long id) {
                log.info("Activating user ID: {}", id);
                boolean result = userService.activateUser(id);

                DataResponse<Boolean> dataResponse = DataResponse.<Boolean>builder()
                                .status(HttpStatus.OK.value())
                                .message("User activated successfully")
                                .data(result)
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Deactivate user", description = "Deactivate a user account")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "User deactivated successfully"),
                        @ApiResponse(responseCode = "404", description = "User not found")
        })
        @PutMapping("/{id}/deactivate")
        public ResponseEntity<DataResponse<Boolean>> deactivateUser(
                        @Parameter(description = "User ID") @PathVariable Long id) {
                log.info("Deactivating user ID: {}", id);
                boolean result = userService.deactivateUser(id);

                DataResponse<Boolean> dataResponse = DataResponse.<Boolean>builder()
                                .status(HttpStatus.OK.value())
                                .message("User deactivated successfully")
                                .data(result)
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get users by role", description = "Get all users with a specific role")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Users retrieved successfully")
        })
        @GetMapping("/role/{code}")
        public ResponseEntity<DataResponse<Page<UserResponse>>> getUsersByRole(
                        @Parameter(description = "Role code") @PathVariable String code,
                        @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

                log.info("Getting users by role: {}", code);
                Page<UserResponse> users = userService.getUsersByRole(code, pageable);

                DataResponse<Page<UserResponse>> dataResponse = DataResponse.<Page<UserResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Users retrieved successfully")
                                .data(users)
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.ok(dataResponse);
        }

        @PutMapping("/profile")
        public ResponseEntity<?> updateProfile(@RequestBody UserUpdateRequest userRequest) {
                UserResponse updatedUser = userService.updateInfoUser(userRequest);
                DataResponse<UserResponse> dataResponse = DataResponse.<UserResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Profile updated successfully")
                                .data(updatedUser)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @GetMapping("/staffs")
        public ResponseEntity<DataResponse<Page<UserResponse>>> getAllUsersWithoutPagination(@PageableDefault(page = 0, size = 1000, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
                log.info("Getting all users without pagination");
                Page<UserResponse> users = userService.getAllUsersWithoutPagination(pageable);

                DataResponse<Page<UserResponse>> dataResponse = DataResponse.<Page<UserResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Users retrieved successfully")
                                .data(users)
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity.ok(dataResponse);
        }

        @GetMapping("/customers")
        public ResponseEntity<DataResponse<Page<UserResponse>>> getAllCustomersWithoutPagination(@PageableDefault(page = 0, size = 1000, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
                log.info("Getting all customers without pagination");
                Page<UserResponse> users = userService.getAllCustomersWithoutPagination(pageable);
                DataResponse<Page<UserResponse>> dataResponse = DataResponse.<Page<UserResponse>>builder()
                        .status(HttpStatus.OK.value())
                        .message("Customers retrieved successfully")
                        .data(users)
                        .timestamp(LocalDateTime.now())
                        .build();
                return ResponseEntity.ok(dataResponse);
        }
}
