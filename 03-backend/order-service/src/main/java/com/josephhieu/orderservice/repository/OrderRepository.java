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

    /**
     * Tìm tất cả đơn hàng của 1 nhà hàng
     * CHỈ LẤY các đơn hàng có trạng thái trong danh sách
     * Sắp xếp theo đơn hàng cũ nhất (để xử lý trước)
     */
    List<Order> findAllByRestaurantIdAndStatusInOrderByCreatedAtAsc(Integer restaurantId, List<String> statuses);

    /**
     * Lấy tất cả đơn hàng trong hệ thống (dành cho Admin)
     * Sắp xếp theo đơn hàng mới nhất
     */
    List<Order> findAllByOrderByCreatedAtDesc();
}
