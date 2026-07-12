package com.example.hotcinemas_be.enums;

import lombok.Getter;

@Getter
public enum AudioType {
    SUBTITLE("Phụ đề"),
    DUBBED("Lồng tiếng"),
    ORIGINAL("Nguyên gốc");

    private final String value;

    AudioType(String value) {
        this.value = value;
    }
}
