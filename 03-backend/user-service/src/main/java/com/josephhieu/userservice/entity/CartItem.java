package com.josephhieu.userservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "cart_items")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cartItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id") // (Dòng này đã đúng)
    @JsonIgnore
    private Cart cart;
    private Integer itemId;

    private Integer quantity;
    private String note;

    // (Script SQL của bạn không có cột 'addedAt', nên hãy xóa trường này đi)
    // private LocalDateTime addedAt;
}