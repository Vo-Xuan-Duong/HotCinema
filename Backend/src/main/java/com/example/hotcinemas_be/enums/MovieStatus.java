package com.example.hotcinemas_be.enums;

import lombok.Getter;

@Getter
public enum MovieStatus {
    COMING_SOON("Coming Soon"),
    NOW_SHOWING("Now Showing"),
    ENDED("Ended");

    private final String value;

    MovieStatus(String value) {
        this.value = value;
    }

}
