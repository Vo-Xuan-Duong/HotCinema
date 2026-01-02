package com.example.hotcinemas_be.exceptions;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ErrorException extends RuntimeException {
  private ErrorCode errorCode;

  public ErrorException(ErrorCode errorCode) {
    super(errorCode.getMessage());
    this.errorCode = errorCode;
  }

  public ErrorException(String message, ErrorCode errorCode) {
    super(message);
    this.errorCode = errorCode;
  }
}
