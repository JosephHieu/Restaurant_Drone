package com.josephhieu.userservice.dto.request;


import com.josephhieu.userservice.entity.Status;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreationRequest {

    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String address;
    private Status status;     // ENUM: active, inactive
    private Integer roleId;       // Khóa ngoại tới bảng roles
}
