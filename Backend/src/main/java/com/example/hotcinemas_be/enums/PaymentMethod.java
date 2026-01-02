package com.example.hotcinemas_be.enums;

import lombok.Getter;

@Getter
public enum PaymentMethod {
    CASH,
    VNPAY,
    MOMO,
    ZALOPAY,
    CREDIT_CARD("Credit Card"),
    DEBIT_CARD("Debit Card");

    private final String value;

    PaymentMethod() {
        this.value = name();
    }

    PaymentMethod(String value) {
        this.value = value;
    }

}
