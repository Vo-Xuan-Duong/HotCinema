# Exception handling review (HotCinemas backend)

## Gaps detected
- Missing handlers: `ConstraintViolationException` (@RequestParam/@PathVariable validation), `HttpMessageNotReadableException` (malformed JSON), `MethodArgumentTypeMismatchException`, `HttpRequestMethodNotSupportedException`, `HttpMediaTypeNotSupportedException`, `AccessDeniedException` / `AuthenticationException`, `DataIntegrityViolationException` (DB constraint), downstream timeouts/IO (e.g., RestTemplate, Redis, Cloudinary).
- Generic `RuntimeException` handler currently echoes `ex.getMessage()` back to client → risk of leaking internals.
- Some `ErrorCode` messages are empty: `ERROR_VOUCHER_INVALID`, `ERROR_VOUCHER_OUT_OF_STOCK`, `ERROR_SEAT_ALREADY_LOCKED`.
- Validation response only covers `MethodArgumentNotValidException`; constraint violations on params are not normalized.
- No WebSocket/STOMP-specific error mapping if messaging is used.

## Suggested fixes
- Add specific handlers in `GlobalExceptionHandler`:
  - `ConstraintViolationException` → 400 with field-to-message map.
  - `HttpMessageNotReadableException` → 400 “Malformed JSON request” (use `ERROR_JSON_PARSE`).
  - `MethodArgumentTypeMismatchException` → 400 “Invalid parameter {name}”.
  - `HttpRequestMethodNotSupportedException` → 405 using `ERROR_METHOD_NOT_ALLOWED`.
  - `HttpMediaTypeNotSupportedException` → 415 using `ERROR_MEDIA_TYPE_NOT_SUPPORTED`.
  - `AccessDeniedException` → 403 using `ERROR_ACCESS_DENIED`; `AuthenticationException` → 401 using `ERROR_UNAUTHORIZED`.
  - `DataIntegrityViolationException` → 409/400 with `ERROR_RESOURCE_CONFLICT` or `ERROR_DATABASE_ERROR` depending on cause.
  - Consider `ResourceAccessException`/`SocketTimeoutException` → 504/503 using `ERROR_SERVICE_UNAVAILABLE` or `ERROR_DEPENDENCY_FAILURE`.
- Harden fallback handlers: for `RuntimeException`/`Exception`, return a generic message (“Internal server error”) and keep details only in logs.
- Fill empty messages in `ErrorCode` for voucher/seat cases with clear text.
- Ensure validation responses (`MethodArgumentNotValidException`, `ConstraintViolationException`) share the same payload shape to simplify frontend handling.
- If using WebSocket/STOMP, add a `@MessageExceptionHandler`/`@ControllerAdvice` for messaging to map errors to user-friendly frames.

## Quick acceptance steps
- Implement the handlers above in `GlobalExceptionHandler`.
- Update `ErrorCode` messages for voucher/seat errors.
- Re-run integration tests or smoke-test endpoints that previously returned 500 for bad input (invalid JSON, wrong param type, unauthorized, DB constraint violations).














