package com.josephhieu.userservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "cart_items")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cartItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cartId")
    @JsonIgnore // Tránh lặp vô hạn khi serialize
    private Cart cart;

    // Chỉ lưu ID, vì MenuItem là của service khác
    private Integer itemId;

    private Integer quantity;
    private String note;
}