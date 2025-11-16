package com.josephhieu.droneservice.service;

import com.josephhieu.droneservice.entity.Delivery;
import com.josephhieu.droneservice.entity.Drone;
import com.josephhieu.droneservice.repository.DeliveryRepository;
import com.josephhieu.droneservice.repository.DroneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private DroneRepository droneRepository;

    /**
     * Logic nghiệp vụ chính:
     * 1. Tìm một drone rảnh rỗi ('IDLE').
     * 2. Tạo một chuyến giao hàng (Delivery) mới.
     * 3. Cập nhật trạng thái drone thành 'DELIVERING'.
     */
    @Transactional
    public Delivery createDelivery(Integer orderId, BigDecimal startLat, BigDecimal startLng, BigDecimal endLat, BigDecimal endLng) {

        // 1. Tìm drone rảnh rỗi (trạng thái 'IDLE')
        List<Drone> idleDrones = droneRepository.findAllByStatus("IDLE");
        if (idleDrones.isEmpty()) {
            throw new RuntimeException("Không tìm thấy drone rảnh rỗi.");
        }

        Drone assignedDrone = idleDrones.get(0); // Lấy drone đầu tiên

        // 2. Tạo chuyến giao hàng mới
        Delivery delivery = new Delivery();
        delivery.setOrderId(orderId);
        delivery.setDrone(assignedDrone);
        delivery.setStatus("ASSIGNED"); // Trạng thái: Đã gán
        delivery.setStartLat(startLat);
        delivery.setStartLng(startLng);
        delivery.setEndLat(endLat);
        delivery.setEndLng(endLng);

        Delivery savedDelivery = deliveryRepository.save(delivery);

        // 3. Cập nhật trạng thái drone
        assignedDrone.setStatus("DELIVERING"); // Trạng thái: Đang bận
        assignedDrone.setCurrentLat(startLat);   // <-- Bổ sung
        assignedDrone.setCurrentLng(startLng);
        droneRepository.save(assignedDrone);

        return savedDelivery;
    }
}