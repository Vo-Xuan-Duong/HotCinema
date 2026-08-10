package com.example.cinema.mapper;

import com.example.cinema.dto.user.UserCreateRequest;
import com.example.cinema.dto.user.UserUpdateRequest;
import com.example.cinema.dto.user.UserResponse;
import com.example.cinema.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    User toEntity(UserCreateRequest request);

    UserResponse toResponse(User entity);

    List<UserResponse> toResponseList(List<User> entities);

    void updateEntityFromRequest(UserUpdateRequest request, @MappingTarget User entity);
}
