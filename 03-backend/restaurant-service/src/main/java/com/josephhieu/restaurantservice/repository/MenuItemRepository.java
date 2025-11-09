package com.josephhieu.restaurantservice.repository;

import com.josephhieu.restaurantservice.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MenuItemRepository extends JpaRepository<MenuItem, Integer> {
    // Lấy tất cả menu của 1 nhà hàng
    List<MenuItem> findAllByRestaurant_RestaurantId(Integer restaurantId);

    // Tự động tìm tất cả MenuItem LỌC theo trạng thái của Restaurant (cha)
    List<MenuItem> findAllByRestaurant_Status(String status);

    /**
     * Tìm một món ăn dựa trên ID nhà hàng VÀ tên món ăn (không phân biệt hoa thường)
     */
    Optional<MenuItem> findByRestaurant_RestaurantIdAndNameIgnoreCase(Integer restaurantId, String name);

    /**
     * Tìm tất cả món ăn CỦA MỘT nhà hàng VÀ nhà hàng đó đang 'open'
     */
    List<MenuItem> findAllByRestaurant_StatusAndRestaurant_RestaurantId(String status, Integer restaurantId);
}