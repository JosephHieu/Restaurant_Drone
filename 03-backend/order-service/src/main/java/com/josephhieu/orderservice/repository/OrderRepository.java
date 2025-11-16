package com.josephhieu.orderservice.repository;

import com.josephhieu.orderservice.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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

    /**
     * Đếm số lượng đơn hàng theo trạng thái
     */
    long countByStatus(String status);

    /**
     * Tính tổng doanh thu từ các đơn hàng đã HOÀN THÀNH
     */
    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.status = 'COMPLETED'")
    BigDecimal findTotalRevenue();

    /**
     * Đếm tổng số đơn hàng của 1 nhà hàng
     */
    long countByRestaurantId(Integer restaurantId);

    /**
     * Đếm số đơn hàng theo trạng thái CỦA 1 nhà hàng
     */
    long countByRestaurantIdAndStatus(Integer restaurantId, String status);

    /**
     * Tính tổng doanh thu (đơn COMPLETED) CỦA 1 nhà hàng
     */
    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.restaurantId = :restaurantId AND o.status = 'COMPLETED'")
    BigDecimal findTotalRevenueByRestaurantId(@Param("restaurantId") Integer restaurantId);
}
