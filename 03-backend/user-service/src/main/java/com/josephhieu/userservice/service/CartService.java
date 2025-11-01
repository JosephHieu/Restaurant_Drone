package com.josephhieu.userservice.service;

import com.josephhieu.userservice.dto.request.AddToCartRequest;
import com.josephhieu.userservice.entity.Cart;
import com.josephhieu.userservice.entity.CartItem;
import com.josephhieu.userservice.exception.ResourceNotFoundException;
import com.josephhieu.userservice.repository.CartItemRepository;
import com.josephhieu.userservice.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private CartItemRepository cartItemRepository;

    public Cart getCartByUserId(Integer userId) {
        return cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));
    }

    @Transactional
    public Cart addItemToCart(Integer userId, AddToCartRequest request) {
        Cart cart = getCartByUserId(userId);

        // Logic nghiệp vụ: Nếu thêm đồ ở nhà hàng mới, xóa giỏ hàng cũ.
        if (cart.getRestaurantId() != null && !cart.getRestaurantId().equals(request.getRestaurantId())) {
            // Xóa tất cả cart items cũ
            cart.getCartItems().clear();
        }
        cart.setRestaurantId(request.getRestaurantId());

        // Tìm xem item đã có trong giỏ chưa
        Optional<CartItem> existingItemOpt = cart.getCartItems().stream()
                .filter(item -> item.getItemId().equals(request.getItemId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            // Cập nhật số lượng
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            existingItem.setNote(request.getNote());
        } else {
            // Thêm item mới
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setItemId(request.getItemId());
            newItem.setQuantity(request.getQuantity());
            newItem.setNote(request.getNote());
            cart.getCartItems().add(newItem);
        }

        return cartRepository.save(cart);
    }

    // (Bạn có thể thêm các hàm removeItem, updateQuantity...)
}