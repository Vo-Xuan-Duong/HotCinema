package com.example.hotcinemas_be.enums;

import lombok.Getter;

@Getter
public enum ShowtimeStatus {
    UPCOMING("Sắp chiếu"),
    AVAILABLE("Còn vé"),
    ALMOST_FULL("Sắp hết chỗ"),
    FULL("Hết chỗ"),
    SALES_ENDED("Dừng bán vé"),
    COMPLETED("Đã kết thúc"),
    CANCELLED("Đã hủy"),
    POSTPONED("Tạm hoãn");

    private final String displayName;

    ShowtimeStatus(String displayName) {
        this.displayName = displayName;
    }
}
