package com.josephhieu.orderservice.repository;

import com.josephhieu.orderservice.entity.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory,String> {

    // 🔹 Lấy lịch sử trạng thái của một đơn hàng (sắp xếp theo thời gian)
    List<OrderStatusHistory> findByOrder_OrderIdOrderByChangedAtAsc(String orderId);
}
