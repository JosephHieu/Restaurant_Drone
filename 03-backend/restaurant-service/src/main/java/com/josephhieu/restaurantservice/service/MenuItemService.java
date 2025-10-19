package com.josephhieu.restaurantservice.service;

import com.josephhieu.restaurantservice.dto.request.CreateMenuItemRequest;
import com.josephhieu.restaurantservice.dto.response.MenuItemResponse;

import java.util.List;

public interface MenuItemService {

    // Lấy tất cả món ăn của một nhà hàng cụ thể
    List<MenuItemResponse> getMenuItemsByRestaurantId(String restaurantId);

    // Tạo một món ăn mới cho nhà hàng.
    MenuItemResponse createMenuItem(String restaurantId, CreateMenuItemRequest request);
}
