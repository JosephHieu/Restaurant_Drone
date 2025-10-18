package com.josephhieu.userservice.dto.response;

import com.josephhieu.userservice.entity.Status;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private String userId;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private Status status;
    private String roleName;
}
