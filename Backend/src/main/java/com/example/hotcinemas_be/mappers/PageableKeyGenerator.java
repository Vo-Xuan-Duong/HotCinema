package com.example.hotcinemas_be.mappers;

import org.jspecify.annotations.NonNull;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;

@Component("pageableKeyGenerator")
public class PageableKeyGenerator implements KeyGenerator {

    @Override
    public @NonNull Object generate(@NonNull Object target, Method method, Object @NonNull ... params) {
        Pageable pageable = Arrays.stream(params)
                .filter(p -> p instanceof Pageable)
                .map(p -> (Pageable) p)
                .findFirst()
                .orElse(PageRequest.of(0, 10));

        return method.getName() +
                ":page=" + pageable.getPageNumber() +
                "&size=" + pageable.getPageSize() +
                "&sort=" + pageable.getSort().toString();
    }
}

