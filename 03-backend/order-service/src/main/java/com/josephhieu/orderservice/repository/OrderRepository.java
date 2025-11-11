package com.josephhieu.orderservice.repository;

import com.josephhieu.orderservice.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    /**
     * Tìm tất cả đơn hàng của một khách hàng
     * Sắp xếp theo ngày tạo (mới nhất lên đầu)
     */
    List<Order> findAllByCustomerIdOrderByCreatedAtDesc(Integer customerId);
}
