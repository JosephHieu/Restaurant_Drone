package com.josephhieu.restaurantservice.service;

import com.josephhieu.restaurantservice.dto.request.CreateMenuItemRequest;
import com.josephhieu.restaurantservice.dto.response.MenuItemResponse;
import com.josephhieu.restaurantservice.entity.MenuItem;
import com.josephhieu.restaurantservice.entity.Restaurant;
import com.josephhieu.restaurantservice.repository.MenuItemRepository;
import com.josephhieu.restaurantservice.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository; // Cần để kiểm tra nhà hàng tồn tại

    @Override
    public List<MenuItemResponse> getMenuItemsByRestaurantId(String restaurantId) {
        // Kiểm tra xem nhà hàng có tồn tại không
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new RuntimeException("Restaurant not found with id: " + restaurantId);
        }

        // Sử dụng phương thức đã tạo trong repository
        return menuItemRepository.findAllByRestaurantId(restaurantId)
                .stream()
                .map(this::mapToMenuItemResponse) // Chuyển đổi từng entity sang response
                .collect(Collectors.toList());
    }

    @Override
    public MenuItemResponse createMenuItem(String restaurantId, CreateMenuItemRequest request) {
        // Tìm nhà hàng, nếu không có sẽ báo lỗi
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Cannot create menu item. Restaurant not found with id: " + restaurantId));

        MenuItem menuItem = MenuItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .isAvailable(true) // Mặc định là còn hàng khi mới tạo
                .restaurant(restaurant) // Gán mối quan hệ với nhà hàng
                .build();

        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        return mapToMenuItemResponse(savedMenuItem);
    }

    // --- Helper Method ---
    private MenuItemResponse mapToMenuItemResponse(MenuItem menuItem) {
        return MenuItemResponse.builder()
                .id(menuItem.getId())
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .price(menuItem.getPrice())
                .imageUrl(menuItem.getImageUrl())
                .isAvailable(menuItem.isAvailable())
                .build();
    }
}
