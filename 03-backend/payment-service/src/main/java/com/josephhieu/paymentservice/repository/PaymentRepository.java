package com.josephhieu.paymentservice.repository;

import com.josephhieu.paymentservice.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    // (Sau này bạn có thể thêm các hàm tìm kiếm, ví dụ: findByOrderId)
}