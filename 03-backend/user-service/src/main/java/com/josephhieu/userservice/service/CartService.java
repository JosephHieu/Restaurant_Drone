package com.josephhieu.userservice.service;

import com.josephhieu.userservice.dto.request.AddToCartRequest;
import com.josephhieu.userservice.dto.request.UpdateCartItemRequest;
import com.josephhieu.userservice.entity.Cart;
import com.josephhieu.userservice.entity.CartItem;
import com.josephhieu.userservice.exception.ResourceNotFoundException;
import com.josephhieu.userservice.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    public Cart getCartByUserId(Integer userId) {
        // Dùng phương thức đã sửa tên trong Repository
        return cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));
    }

    @Transactional
    public Cart addItemToCart(Integer userId, AddToCartRequest request) {
        Cart cart = getCartByUserId(userId);

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

        return cartRepository.save(cart);
    }

    /**
     * API: PUT /api/cart/items/{itemId}
     * Cập nhật số lượng của một món hàng
     */
    @Transactional
    public Cart updateItemQuantity(Integer userId, Integer itemId, UpdateCartItemRequest request) {
        Cart cart = getCartByUserId(userId);

        // Tìm món hàng trong giỏ
        CartItem itemToUpdate = cart.getCartItems().stream()
                .filter(item -> item.getItemId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "itemId", itemId));

        // Cập nhật số lượng
        itemToUpdate.setQuantity(request.getQuantity());

        return cartRepository.save(cart);
    }

    /**
     * API: DELETE /api/cart/items/{itemId}
     * Xóa một món hàng khỏi giỏ
     */
    @Transactional
    public Cart removeItemFromCart(Integer userId, Integer itemId) {
        Cart cart = getCartByUserId(userId);

        // Tìm món hàng
        CartItem itemToRemove = cart.getCartItems().stream()
                .filter(item -> item.getItemId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "itemId", itemId));

        // Xóa món hàng khỏi danh sách
        // (Do có 'orphanRemoval = true' trong Cart Entity, nó sẽ tự xóa trong DB)
        cart.getCartItems().remove(itemToRemove);

        // Nếu giỏ hàng rỗng, reset luôn restaurantId
        if (cart.getCartItems().isEmpty()) {
            cart.setRestaurantId(null);
        }

        return cartRepository.save(cart);
    }

    /**
     * API: DELETE /api/cart
     * Xóa sạch giỏ hàng
     */
    @Transactional
    public Cart clearCart(Integer userId) {
        Cart cart = getCartByUserId(userId);
        cart.getCartItems().clear();
        cart.setRestaurantId(null);
        return cartRepository.save(cart);
    }
}