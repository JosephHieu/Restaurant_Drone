package com.josephhieu.orderservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "order_item_id")
    private String orderItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "product_id", nullable = false)
    private String productId; // từ Restaurant Service

    @Column(name = "product_name", length = 100)
    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private BigDecimal price;

    @Transient // không lưu trong DB — tính tự động trong code
    private BigDecimal totalPrice;

    @PostLoad
    @PostPersist
    @PostUpdate
    public void calculateTotal() {
        if (quantity != null && price != null) {
            this.totalPrice = price.multiply(BigDecimal.valueOf(quantity));
        }
    }
}