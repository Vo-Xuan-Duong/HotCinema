package com.example.cinema.mapper;

import com.example.cinema.dto.role.RoleResponse;
import com.example.cinema.dto.user.UserCreateRequest;
import com.example.cinema.dto.user.UserUpdateRequest;
import com.example.cinema.dto.user.UserResponse;
import com.example.cinema.entity.Role;
import com.example.cinema.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserMapper {

    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "roles", ignore = true)
    User toEntity(UserCreateRequest request);

    UserResponse toResponse(User entity);

    RoleResponse toRoleResponse(Role role);

    List<UserResponse> toResponseList(List<User> entities);

    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "roles", ignore = true)
    void updateEntityFromRequest(UserUpdateRequest request, @MappingTarget User entity);
}
