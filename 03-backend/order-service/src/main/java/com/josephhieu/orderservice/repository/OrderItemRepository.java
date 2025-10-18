package com.josephhieu.orderservice.repository;

import com.josephhieu.orderservice.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, String> {


    // 🔹 Lấy danh sách item của một order
    List<OrderItem> findByOrder_OrderId(String orderId);

    // 🔹 Xóa toàn bộ item của một order
    void deleteByOrder_OrderId(String orderId);
}
