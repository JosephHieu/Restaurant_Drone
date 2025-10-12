package com.josephhieu.userservice.repository;

import com.josephhieu.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
}
