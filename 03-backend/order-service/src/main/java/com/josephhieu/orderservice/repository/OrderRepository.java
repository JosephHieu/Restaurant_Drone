package com.josephhieu.orderservice.repository;


import com.josephhieu.orderservice.entity.Order;
import com.josephhieu.orderservice.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    // Tìm đơn hàng bằng mã hiển thị (order_code)
    Optional<Order> findByOrderCode(String orderCode);

    // 🔹 Lấy tất cả đơn hàng theo ID người dùng
    List<Order> findByCustomerId(String customerId);

    // 🔹 Lấy tất cả đơn hàng theo ID nhà hàng
    List<Order> findByRestaurantId(String restaurantId);

    // 🔹 Lọc theo trạng thái
    List<Order> findByStatus(OrderStatus status);

    // 🔹 Custom Query: lấy tất cả đơn hàng theo trạng thái & nhà hàng
    @Query("SELECT o FROM Order o WHERE o.restaurantId = :restaurantId AND o.status = :status")
    List<Order> findByRestaurantAndStatus(String restaurantId, OrderStatus status);
}
