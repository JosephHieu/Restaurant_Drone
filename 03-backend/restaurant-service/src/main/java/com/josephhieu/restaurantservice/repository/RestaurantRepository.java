package com.josephhieu.restaurantservice.repository;

import com.josephhieu.restaurantservice.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Integer> {
    // Tìm các nhà hàng theo ID chủ sở hữu
    List<Restaurant> findAllByOwnerId(Integer ownerId);

    // Tìm các nhà hàng đang mở cửa (cho khách xem)
    List<Restaurant> findAllByStatus(String status);

    boolean existsByOwnerId(Integer ownerId);
}