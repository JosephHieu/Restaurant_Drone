package com.josephhieu.restaurantservice.repository;

import com.josephhieu.restaurantservice.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, String> {

    // tìm giỏ hàng dựa trên ID người dùng và Id nhà hàng
    Optional<Cart> findByUserIdAndRestaurantId(String userId, String restaurantId);
}
