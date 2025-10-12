package com.josephhieu.userservice.service;

import com.josephhieu.userservice.dto.request.UserCreationRequest;
import com.josephhieu.userservice.dto.request.UserUpdateRequest;
import com.josephhieu.userservice.dto.response.UserResponse;
import com.josephhieu.userservice.entity.User;
import org.springframework.stereotype.Repository;

import java.util.List;


public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse getUserById(String id);

    UserResponse createUser(UserCreationRequest request);

    UserResponse updateUser(String id, UserUpdateRequest request);

    void deleteUserById(String id);
}
