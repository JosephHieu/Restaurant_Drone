package com.josephhieu.restaurantservice.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class RestaurantResponse {
    private String id;
    private String name;
    private String description;
    private String address;
    private BigDecimal rating;
}
