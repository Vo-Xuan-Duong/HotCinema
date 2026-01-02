package com.example.hotcinemas_be.enums;

import lombok.Getter;

@Getter
public enum ScreenType {
    IMAX("IMAX"),
    STADIUM("Stadium Seating"),
    WIDESCREEN("Widescreen"),
    CURVED("Curved Screen"),
    STANDARD("Standard");

    private final String displayName;

    ScreenType(String displayName) {
        this.displayName = displayName;
    }
}
