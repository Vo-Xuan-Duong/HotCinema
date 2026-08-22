package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.EmployeeCinema;
import com.example.cinema.dto.employeecinema.EmployeeCinemaResponse;
import com.example.cinema.mapper.EmployeeCinemaMapper;
import com.example.cinema.repository.EmployeeCinemaRepository;
import com.example.cinema.service.EmployeeCinemaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeCinemaServiceImpl implements EmployeeCinemaService {

    private final EmployeeCinemaRepository repository;
    private final EmployeeCinemaMapper employeeCinemaMapper;

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeCinemaResponse> findAll() {
        return employeeCinemaMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EmployeeCinemaResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(employeeCinemaMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "employeecinemas", key = "#id")
    public Optional<EmployeeCinema> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "employeecinemas", key = "#result.id")
    public EmployeeCinema save(EmployeeCinema entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "employeecinemas", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
