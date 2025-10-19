package com.josephhieu.restaurantservice.service;

import com.josephhieu.restaurantservice.dto.request.CreateRestaurantRequest;
import com.josephhieu.restaurantservice.dto.response.RestaurantResponse;

import java.util.List;

public interface RestaurantService {

    RestaurantResponse createRestaurant(CreateRestaurantRequest request);
    RestaurantResponse getRestaurantById(String id);
    List<RestaurantResponse> getAllRestaurants();
    void deleteRestaurant(String id);
}
