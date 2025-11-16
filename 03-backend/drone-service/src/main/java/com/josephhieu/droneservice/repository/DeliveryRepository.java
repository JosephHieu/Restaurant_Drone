package com.josephhieu.droneservice.repository;

import com.josephhieu.droneservice.entity.Delivery;
import com.josephhieu.droneservice.entity.Drone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional; // Import

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Integer> {

    /**
     * Tìm một chuyến giao hàng (delivery) bằng ID của đơn hàng (order)
     * (Vì cột order_id là UNIQUE trong CSDL)
     */
    Optional<Delivery> findByOrderId(Integer orderId);

    /**
     * Tìm chuyến giao hàng đang hoạt động (DELIVERING) bằng
     * đối tượng Drone.
     */
    Optional<Delivery> findByDroneAndStatus(Drone drone, String status);
}