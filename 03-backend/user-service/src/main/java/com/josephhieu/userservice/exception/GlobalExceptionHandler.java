package com.josephhieu.userservice.exception;

import com.josephhieu.userservice.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {



    /**
     * Bắt lỗi nghiệp vụ (ví dụ: Cố xóa user đang sở hữu nhà hàng)
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(IllegalStateException ex, HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(), // 409 CONFLICT
                "Business Logic Error",
                ex.getMessage(), // Lấy thông báo "Không thể xóa user..."
                request.getRequestURI()
        );

        // Trả về lỗi 409 thay vì 500
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }
}