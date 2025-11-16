package com.josephhieu.droneservice.repository;

import com.josephhieu.droneservice.entity.Drone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DroneRepository extends JpaRepository<Drone, Integer> {

    /**
     * Tìm các drone rảnh rỗi (để giao hàng)
     * (Tìm tất cả drone có trạng thái là 'IDLE')
     * Spring Data JPA sẽ tự động tạo query từ tên phương thức này.
     */
    List<Drone> findAllByStatus(String status);

    long countByStatus(String status);
}