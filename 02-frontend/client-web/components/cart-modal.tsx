"use client";

import { X, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context"; // <-- 1. DÙNG CONTEXT THẬT
import { useAuth } from "@/context/auth-context";
import api from "@/services/api"; // <-- 2. IMPORT API
import { useState, useMemo } from "react"; // <-- 3. IMPORT HOOKS
import { message, Spin, Alert } from "antd"; // <-- 4. IMPORT ANT DESIGN
import { AxiosError } from "axios";

// Hàm tiện ích xây dựng URL ảnh
const getImageUrl = (imageUri: string | undefined): string => {
  if (!imageUri) return "https://via.placeholder.com/80?text=No+Image";
  return `http://localhost:8080/api/restaurants/images/${imageUri}`;
};

// 1. Định nghĩa kiểu DTO trả về (khớp với OrderResponseDto)
interface OrderResponse {
  order: {
    // (Chi tiết đơn hàng nếu cần)
    orderId: number;
    totalPrice: number;
  };
  paymentUrl: string; // <-- URL CỦA VNPAY
}

// Kiểu dữ liệu lỗi
interface ErrorResponse {
  message: string;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onProceedToCheckout: () => void; // <-- 1. THÊM PROP MỚI
}

export default function CartModal({
  isOpen,
  onClose,
  onOpenLogin,
  onProceedToCheckout, // <-- 2. LẤY PROP MỚI
}: CartModalProps) {
  // 5. LẤY GIỎ HÀNG THẬT TỪ CONTEXT
  const {
    cart,
    updateQuantity,
    removeFromCart,
    fetchCart,
    isLoading: isCartLoading,
  } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // 6. TÍNH TOÁN DỰA TRÊN GIỎ HÀNG THẬT
  // (Giả sử UserService/CartContext đã cung cấp giá)
  const calculateTotal = useMemo(() => {
    if (!cart) return 0;
    return cart.cartItems.reduce((total, item) => {
      // (Bỏ qua logic 'discount' vì backend không có)
      return total + (item.price || 0) * item.quantity;
    }, 0);
  }, [cart]);

  // === 7. HÀM THANH TOÁN (GỌI ORDER SERVICE) ===
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      onOpenLogin();
      onClose();
    } else {
      // Đóng modal
      onClose();
      // Chuyển hướng đến trang checkout
      onProceedToCheckout(); // <-- 4. GỌI HÀM MỚI
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Modal */}
        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h2 className="text-xl font-bold">Giỏ hàng của bạn</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isCartLoading ? (
              <div className="flex justify-center items-center h-full">
                <Spin tip="Đang tải giỏ hàng..." />
              </div>
            ) : !cart || cart.cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingCart size={48} className="mb-2 opacity-50" />
                <p>Giỏ hàng của bạn trống</p>
              </div>
            ) : (
              // 8. DÙNG DỮ LIỆU THẬT TỪ 'cart.cartItems'
              cart.cartItems.map((item) => {
                return (
                  <div
                    key={item.cartItemId} // <-- Sửa: Dùng cartItemId
                    className="flex gap-3 border border-gray-200 rounded-lg p-3"
                  >
                    {/* Image */}
                    <img
                      src={getImageUrl(item.imageUri)} // <-- Sửa: Dùng imageUri
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {/* (Bỏ logic discount) */}
                        <span className="text-red-500 font-bold">
                          {item.price ? item.price.toLocaleString() : 0}đ
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            // Sửa: Dùng itemId
                            updateQuantity(item.itemId, item.quantity - 1)
                          }
                          className="p-1 hover:bg-gray-100 rounded transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-6 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            // Sửa: Dùng itemId
                            updateQuantity(item.itemId, item.quantity + 1)
                          }
                          className="p-1 hover:bg-gray-100 rounded transition"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.itemId)} // Sửa: Dùng itemId
                          className="ml-auto p-1 hover:bg-red-50 rounded transition text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {cart && cart.cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-3">
              {/* (Bỏ logic 'calculateSavings') */}

              {/* Total */}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                <span>Tổng cộng:</span>
                <span className="text-red-500">
                  {calculateTotal.toLocaleString()}đ
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckoutLoading || isCartLoading} // <-- Thêm disabled
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:bg-gray-400"
              >
                {isCheckoutLoading ? "Đang xử lý..." : "Thanh toán"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
