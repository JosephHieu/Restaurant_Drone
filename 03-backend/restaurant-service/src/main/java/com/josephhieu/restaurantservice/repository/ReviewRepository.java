package com.josephhieu.restaurantservice.repository;

import com.josephhieu.restaurantservice.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {

    // tìm tất cả Review dựa trên restaurantId
    List<Review> findAllByRestaurantId(String restaurantId);
}
