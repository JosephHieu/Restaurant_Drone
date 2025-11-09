package com.josephhieu.restaurantservice.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MenuItemPublicDto {
    private Integer itemId;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUri;
    private boolean isAvailable;

    // TRƯỜNG QUAN TRỌNG NHẤT
    private Integer restaurantId;

    // (Bạn cũng có thể thêm tên nhà hàng nếu muốn)
     private String restaurantName;
}