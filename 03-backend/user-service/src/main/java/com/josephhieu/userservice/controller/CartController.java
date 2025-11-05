package com.josephhieu.userservice.controller;

import com.josephhieu.userservice.dto.request.AddToCartRequest;
import com.josephhieu.userservice.dto.request.UpdateCartItemRequest;
import com.josephhieu.userservice.entity.Cart;
import com.josephhieu.userservice.security.CustomUserDetails;
import com.josephhieu.userservice.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    /**
     * Lấy giỏ hàng
     */
    @GetMapping
    public ResponseEntity<Cart> getCart(@AuthenticationPrincipal CustomUserDetails currentUser) {
        Cart cart = cartService.getCartByUserId(currentUser.getId());
        return ResponseEntity.ok(cart);
    }

    /**
     * Thêm món mới vào giỏ
     */
    @PostMapping("/items")
    public ResponseEntity<Cart> addItem(@AuthenticationPrincipal CustomUserDetails currentUser,
                                        @Valid @RequestBody AddToCartRequest request) {
        Cart updatedCart = cartService.addItemToCart(currentUser.getId(), request);
        return ResponseEntity.ok(updatedCart);
    }

    /**
     * Cập nhật số lượng của 1 món trong giỏ
     */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<Cart> updateItemQuantity(@AuthenticationPrincipal CustomUserDetails currentUser,
                                                   @PathVariable Integer itemId,
                                                   @Valid @RequestBody UpdateCartItemRequest request) {
        Cart updatedCart = cartService.updateItemQuantity(currentUser.getId(), itemId, request);
        return ResponseEntity.ok(updatedCart);
    }

    /**
     * Xóa 1 món khỏi giỏ
     */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Cart> removeItem(@AuthenticationPrincipal CustomUserDetails currentUser,
                                           @PathVariable Integer itemId) {
        Cart updatedCart = cartService.removeItemFromCart(currentUser.getId(), itemId);
        return ResponseEntity.ok(updatedCart);
    }

    /**
     * Xóa sạch giỏ hàng
     */
    @DeleteMapping
    public ResponseEntity<Cart> clearCart(@AuthenticationPrincipal CustomUserDetails currentUser) {
        Cart updatedCart = cartService.clearCart(currentUser.getId());
        return ResponseEntity.ok(updatedCart);
    }
}