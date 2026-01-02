package com.example.hotcinemas_be.enums;

import lombok.Getter;

@Getter
public enum SoundSystem {
    DOLBY_ATMOS("Dolby Atmos"),
    DOLBY_7_1("Dolby 7.1"),
    DTS_X("DTS:X"),
    SURROUND_5_1("Surround 5.1"),
    STEREO("Stereo");

    private final String displayName;

    SoundSystem(String displayName) {
        this.displayName = displayName;
    }
}
