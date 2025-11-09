package com.josephhieu.userservice.controller;

import com.josephhieu.userservice.dto.request.AddToCartRequest;
import com.josephhieu.userservice.dto.request.UpdateCartItemRequest;
import com.josephhieu.userservice.dto.response.CartResponseDto;
// import com.josephhieu.userservice.entity.Cart; // <-- Không cần Entity nữa
import com.josephhieu.userservice.security.CustomUserDetails;
import com.josephhieu.userservice.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // <-- Thêm import
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("isAuthenticated()") // <-- Bảo vệ toàn bộ Controller
public class CartController {

    @Autowired
    private CartService cartService;

    /**
     * Lấy giỏ hàng (Đã đúng)
     */
    @GetMapping
    public ResponseEntity<CartResponseDto> getCart(@AuthenticationPrincipal CustomUserDetails currentUser) {
        CartResponseDto cartDto = cartService.getCartByUserId(currentUser.getId());
        return ResponseEntity.ok(cartDto);
    }

    /**
     * Thêm món mới vào giỏ
     */
    @PostMapping("/items")
    // SỬA 1: Đổi kiểu trả về
    public ResponseEntity<CartResponseDto> addItem(@AuthenticationPrincipal CustomUserDetails currentUser,
                                                   @Valid @RequestBody AddToCartRequest request) {
        // SỬA 2: Nhận kiểu mới
        CartResponseDto updatedCart = cartService.addItemToCart(currentUser.getId(), request);
        return ResponseEntity.ok(updatedCart);
    }

    /**
     * Cập nhật số lượng của 1 món trong giỏ
     */
    @PutMapping("/items/{itemId}")
    // SỬA 3: Đổi kiểu trả về
    public ResponseEntity<CartResponseDto> updateItemQuantity(@AuthenticationPrincipal CustomUserDetails currentUser,
                                                              @PathVariable Integer itemId,
                                                              @Valid @RequestBody UpdateCartItemRequest request) {
        CartResponseDto updatedCart = cartService.updateItemQuantity(currentUser.getId(), itemId, request);
        return ResponseEntity.ok(updatedCart);
    }

    /**
     * Xóa 1 món khỏi giỏ
     */
    @DeleteMapping("/items/{itemId}")
    // SỬA 4: Đổi kiểu trả về
    public ResponseEntity<CartResponseDto> removeItem(@AuthenticationPrincipal CustomUserDetails currentUser,
                                                      @PathVariable Integer itemId) {
        CartResponseDto updatedCart = cartService.removeItemFromCart(currentUser.getId(), itemId);
        return ResponseEntity.ok(updatedCart);
    }

    /**
     * Xóa sạch giỏ hàng
     */
    @DeleteMapping
    // SỬA 5: Đổi kiểu trả về
    public ResponseEntity<CartResponseDto> clearCart(@AuthenticationPrincipal CustomUserDetails currentUser) {
        CartResponseDto updatedCart = cartService.clearCart(currentUser.getId());
        return ResponseEntity.ok(updatedCart);
    }
}