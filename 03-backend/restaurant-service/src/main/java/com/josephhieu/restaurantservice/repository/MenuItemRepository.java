package com.josephhieu.restaurantservice.repository;

import com.josephhieu.restaurantservice.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Integer> {
    // Lấy tất cả menu của 1 nhà hàng
    List<MenuItem> findAllByRestaurant_RestaurantId(Integer restaurantId);
}