package com.josephhieu.userservice.controller;

import com.josephhieu.userservice.dto.request.AddToCartRequest;
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

    @GetMapping
    public ResponseEntity<Cart> getCart(@AuthenticationPrincipal CustomUserDetails currentUser) {
        Cart cart = cartService.getCartByUserId(currentUser.getId());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItem(@AuthenticationPrincipal CustomUserDetails currentUser,
                                        @Valid @RequestBody AddToCartRequest request) {
        Cart updatedCart = cartService.addItemToCart(currentUser.getId(), request);
        return ResponseEntity.ok(updatedCart);
    }

    // (Thêm API DELETE, PUT cho cart items)
}