"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import api from "@/services/api"; // Service gọi API
import { useAuth } from "./auth-context"; // Lấy thông tin đăng nhập
import type { MenuItem } from "@/types"; // Kiểu dữ liệu Món ăn
import { message, notification } from "antd"; // Dùng message của AntD

// === 1. ĐỊNH NGHĨA INTERFACE THẬT (Khớp với Backend) ===
export interface CartItem {
  cartItemId: number;
  itemId: number;
  quantity: number;
  note: string | null;

  // Các trường này sẽ được "gộp" vào từ RestaurantService
  name?: string;
  price?: number;
  imageUri?: string;
}
export interface Cart {
  cartId: number;
  userId: number;
  restaurantId: number | null;
  cartItems: CartItem[];
}

// Định nghĩa Context
interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  fetchCart: () => Promise<void>;
  // === 2. SỬA CHỮ KÝ HÀM (Signature) ===
  addToCart: (item: MenuItem, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth(); // Lấy trạng thái đăng nhập

  // === 3. HÀM TẢI GIỎ HÀNG THẬT TỪ USER-SERVICE ===
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get<Cart>("/api/cart");
      setCart(response.data);
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Tải giỏ hàng khi user đăng nhập
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // === 4. HÀM THÊM VÀO GIỎ HÀNG THẬT ===
  const addToCart = async (item: MenuItem, quantity: number) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để thêm món ăn vào giỏ hàng.");
      return;
    }

    try {
      // Gọi API (POST /api/cart/items) của UserService
      const response = await api.post<Cart>("/api/cart/items", {
        itemId: item.itemId,
        restaurantId: item.restaurantId,
        quantity: quantity,
        note: "",
      });

      setCart(response.data); // Cập nhật giỏ hàng
      // message.success(`Đã thêm "${item.name}" vào giỏ hàng!`);
      alert(`Đã thêm "${item.name}" vào giỏ hàng!`);
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(error.response.data.message);
      } else {
        message.error("Lỗi khi thêm vào giỏ hàng.");
      }
    }
  };

  // === 5. CÁC HÀM CẬP NHẬT/XÓA THẬT ===
  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!cart) return;
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    try {
      const response = await api.put<Cart>(`/api/cart/items/${itemId}`, {
        quantity,
      });
      setCart(response.data);
    } catch (error) {
      message.error("Lỗi khi cập nhật số lượng.");
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!cart) return;
    try {
      const response = await api.delete<Cart>(`/api/cart/items/${itemId}`);
      setCart(response.data);
      message.success("Đã xóa món ăn khỏi giỏ hàng.");
    } catch (error) {
      message.error("Lỗi khi xóa món ăn.");
    }
  };

  const itemCount =
    cart?.cartItems.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook để sử dụng (Giữ nguyên)
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
