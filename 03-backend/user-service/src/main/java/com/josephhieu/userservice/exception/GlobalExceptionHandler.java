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
     * VÀ BẮT LỖI TÀI KHOẢN BỊ CẤM (Từ AuthService)
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(IllegalStateException ex, HttpServletRequest request) {

        HttpStatus status = HttpStatus.CONFLICT; // Mặc định là 409

        // 1. KIỂM TRA: Nếu lỗi liên quan đến "bị cấm" (bắt từ hàm login)
        if (ex.getMessage().contains("bị cấm")) {
            status = HttpStatus.FORBIDDEN; // 403 Forbidden
        }

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(), // Lấy thông báo cụ thể từ AuthService
                request.getRequestURI()
        );

        // Trả về lỗi 403 (Forbidden) hoặc 409 (Conflict)
        return new ResponseEntity<>(errorResponse, status);
    }
}