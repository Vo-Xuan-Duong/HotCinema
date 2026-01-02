package com.example.hotcinemas_be.enums;

import lombok.Getter;

@Getter
public enum TheaterType {
    TWO_D("2D"),
    THREE_D("3D"),
    IMAX("IMAX"),
    IMAX_3D("IMAX 3D"),
    FOUR_DX("4DX"),
    SCREEN_X("ScreenX");

    private final String value;

    TheaterType(String value) {
        this.value = value;
    }

}
