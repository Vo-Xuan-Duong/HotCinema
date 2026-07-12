package com.example.hotcinemas_be.enums;

import lombok.Getter;

@Getter
public enum PeopleType {
    CAST("Diễn viên"),
    DIRECTOR("Đạo diễn");

    private final String label;

    PeopleType(String label) {
        this.label = label;
    }
}
