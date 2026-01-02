package com.example.hotcinemas_be.exceptions;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppException extends RuntimeException {
  private ErrorCode errorCode;

  public AppException(ErrorCode errorCode) {
    super(errorCode.getMessage());
    this.errorCode = errorCode;
  }

  public AppException(String message, ErrorCode errorCode) {
    super(message);
    this.errorCode = errorCode;
  }
}
