package com.josephhieu.restaurantservice.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateMenuItemRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
}
