package com.josephhieu.userservice.service;

import com.josephhieu.userservice.client.RestaurantClient;
import com.josephhieu.userservice.client.dto.MenuItemDto;
import com.josephhieu.userservice.dto.request.AddToCartRequest;
import com.josephhieu.userservice.dto.request.UpdateCartItemRequest;
import com.josephhieu.userservice.dto.response.CartItemResponseDto;
import com.josephhieu.userservice.dto.response.CartResponseDto;
import com.josephhieu.userservice.entity.Cart;
import com.josephhieu.userservice.entity.CartItem;
import com.josephhieu.userservice.exception.ResourceNotFoundException;
import com.josephhieu.userservice.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private RestaurantClient restaurantClient; // <-- Tiêm (Inject) Feign Client

    // === 1. TẠO HÀM "PRIVATE" MỚI ===
    /**
     * Hàm nội bộ: Chỉ tìm Cart (Entity) bằng UserId.
     * Các hàm khác trong service này sẽ gọi hàm này.
     */
    private Cart findCartByUserId(Integer userId) {
        return cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));
    }

    /**
     * Hàm tiện ích (private) để chuyển đổi Cart Entity sang CartResponseDto
     */
    private CartResponseDto convertCartToDto(Cart cart) {
        CartResponseDto responseDto = new CartResponseDto();
        responseDto.setCartId(cart.getCartId());
        responseDto.setUserId(cart.getUser().getUserId());
        responseDto.setRestaurantId(cart.getRestaurantId());

        // Gộp (Enrich) dữ liệu cho từng món
        List<CartItemResponseDto> enrichedItems = cart.getCartItems().stream()
                .map(cartItem -> {
                    // GỌI API SANG RESTAURANT-SERVICE
                    MenuItemDto itemDetails = restaurantClient.getMenuItemById(cartItem.getItemId());

                    // Gộp dữ liệu
                    CartItemResponseDto itemDto = new CartItemResponseDto();
                    itemDto.setCartItemId(cartItem.getCartItemId());
                    itemDto.setItemId(cartItem.getItemId());
                    itemDto.setQuantity(cartItem.getQuantity());
                    itemDto.setNote(cartItem.getNote());

                    // Thêm dữ liệu "đầy đủ"
                    itemDto.setName(itemDetails.getName());
                    itemDto.setPrice(itemDetails.getPrice());
                    itemDto.setImageUri(itemDetails.getImageUri());

                    return itemDto;
                })
                .collect(Collectors.toList());

        responseDto.setCartItems(enrichedItems);
        return responseDto;
    }

    // === 2. SỬA CÁC HÀM "PUBLIC" ===

    /**
     * API: GET /api/cart
     * (Hàm này gọi hàm private và chuyển đổi sang DTO)
     */
    public CartResponseDto getCartByUserId(Integer userId) {
        Cart cart = findCartByUserId(userId); // <-- Gọi hàm private
        return convertCartToDto(cart);
    }

    /**
     * API: POST /api/cart/items
     * (Hàm này gọi hàm private và trả về DTO)
     */
    @Transactional
    public CartResponseDto addItemToCart(Integer userId, AddToCartRequest request) {
        Cart cart = findCartByUserId(userId); // <-- Gọi hàm private

        if (cart.getRestaurantId() != null && !cart.getRestaurantId().equals(request.getRestaurantId())) {
            cart.getCartItems().clear();
        }
        cart.setRestaurantId(request.getRestaurantId());

        Optional<CartItem> existingItemOpt = cart.getCartItems().stream()
                .filter(item -> item.getItemId().equals(request.getItemId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            existingItem.setNote(request.getNote());
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setItemId(request.getItemId());
            newItem.setQuantity(request.getQuantity());
            newItem.setNote(request.getNote());
            cart.getCartItems().add(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return convertCartToDto(savedCart); // Trả về DTO "đầy đủ"
    }

    /**
     * API: PUT /api/cart/items/{itemId}
     * (Hàm này gọi hàm private và trả về DTO)
     */
    @Transactional
    public CartResponseDto updateItemQuantity(Integer userId, Integer itemId, UpdateCartItemRequest request) {
        Cart cart = findCartByUserId(userId); // <-- Gọi hàm private

        CartItem itemToUpdate = cart.getCartItems().stream()
                .filter(item -> item.getItemId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "itemId", itemId));

        itemToUpdate.setQuantity(request.getQuantity());

        Cart savedCart = cartRepository.save(cart);
        return convertCartToDto(savedCart); // Trả về DTO "đầy đủ"
    }

    /**
     * API: DELETE /api/cart/items/{itemId}
     * (Hàm này gọi hàm private và trả về DTO)
     */
    @Transactional
    public CartResponseDto removeItemFromCart(Integer userId, Integer itemId) {
        Cart cart = findCartByUserId(userId); // <-- Gọi hàm private

        CartItem itemToRemove = cart.getCartItems().stream()
                .filter(item -> item.getItemId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "itemId", itemId));

        cart.getCartItems().remove(itemToRemove);

        if (cart.getCartItems().isEmpty()) {
            cart.setRestaurantId(null);
        }

        Cart savedCart = cartRepository.save(cart);
        return convertCartToDto(savedCart); // Trả về DTO "đầy đủ"
    }

    /**
     * API: DELETE /api/cart
     * (Hàm này gọi hàm private và trả về DTO)
     */
    @Transactional
    public CartResponseDto clearCart(Integer userId) {
        Cart cart = findCartByUserId(userId); // <-- Gọi hàm private
        cart.getCartItems().clear();
        cart.setRestaurantId(null);

        Cart savedCart = cartRepository.save(cart);
        return convertCartToDto(savedCart); // Trả về DTO "đầy đủ"
    }
}