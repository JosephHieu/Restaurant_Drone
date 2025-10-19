package com.josephhieu.restaurantservice.dto.request;

import lombok.Data;

@Data
public class CreateRestaurantRequest {
    private String ownerId;
    private String name;
    private String description;
    private String address;
    private String phone;
}