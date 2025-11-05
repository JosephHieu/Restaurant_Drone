package com.josephhieu.userservice.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AdminCreateUserRequest {
    @NotBlank
    private String fullName;
    @NotBlank @Email
    private String email;
    @NotBlank
    private String phone;
    @NotBlank @Size(min = 6)
    private String password;

    @NotNull
    private Integer roleId; // <-- Trường (field) quan trọng mà Admin gửi lên
}