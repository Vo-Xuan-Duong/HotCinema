package com.example.cinema.mapper;

import com.example.cinema.dto.employeecinema.EmployeeCinemaCreateRequest;
import com.example.cinema.dto.employeecinema.EmployeeCinemaUpdateRequest;
import com.example.cinema.dto.employeecinema.EmployeeCinemaResponse;
import com.example.cinema.entity.EmployeeCinema;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmployeeCinemaMapper {

    EmployeeCinema toEntity(EmployeeCinemaCreateRequest request);

    EmployeeCinemaResponse toResponse(EmployeeCinema entity);

    List<EmployeeCinemaResponse> toResponseList(List<EmployeeCinema> entities);

    void updateEntityFromRequest(EmployeeCinemaUpdateRequest request, @MappingTarget EmployeeCinema entity);
}
