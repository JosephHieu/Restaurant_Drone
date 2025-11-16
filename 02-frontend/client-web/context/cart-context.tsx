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
import { message, notification, Modal } from "antd"; // Dùng message của AntD
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons"; // Import icon

// === 1. ĐỊNH NGHĨA INTERFACE THẬT (Khớp với Backend DTO) ===

// Interface này khớp với CartItemResponseDto (đã được "làm giàu")
export interface CartItem {
  cartItemId: number;
  itemId: number;
  quantity: number;
  note: string | null;

  // Các trường "đầy đủ" từ RestaurantService
  name: string;
  price: number;
  imageUri: string;
}
// Interface này khớp với CartResponseDto (DTO phản hồi)
export interface Cart {
  cartId: number;
  userId: number;
  restaurantId: number | null;
  cartItems: CartItem[];
}

// Định nghĩa Context
interface CartContextType {
  cart: Cart | null; // <-- Sửa: Dùng interface "thật"
  isLoading: boolean;
  itemCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (item: MenuItem, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null); // <-- Sửa: Dùng interface "thật"
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // === HÀM TẢI GIỎ HÀNG THẬT (SỬA KIỂU TRẢ VỀ) ===
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      // Sửa: Mong đợi kiểu <Cart> (DTO "đầy đủ")
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

  // === HÀM NỘI BỘ ĐỂ GỌI API (TRÁNH LẶP CODE) ===
  const callApiAddToCart = async (item: MenuItem, quantity: number) => {
    try {
      // Sửa: Mong đợi kiểu <Cart> (DTO "đầy đủ")
      const response = await api.post<Cart>("/api/cart/items", {
        itemId: item.itemId,
        restaurantId: item.restaurantId,
        quantity: quantity,
        note: "",
      });

      setCart(response.data); // Cập nhật giỏ hàng

      // Sửa: Dùng NOTIFICATION (thông báo "đẹp")
      notification.success({
        message: "Thêm thành công!",
        description: `"${item.name}" (x${quantity}) đã được thêm vào giỏ hàng.`,
        placement: "topRight",
        duration: 2.5,
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Lỗi khi thêm vào giỏ hàng.");
      }
    }
  };

  // === HÀM ADD TO CART (CÓ HỎI XÁC NHẬN) ===
  const addToCart = async (item: MenuItem, quantity: number) => {
    if (!isAuthenticated) {
      message.error("Vui lòng đăng nhập để thêm món ăn vào giỏ hàng.");
      return;
    }

    // KIỂM TRA ĐỔI NHÀ HÀNG
    if (
      cart &&
      cart.restaurantId !== null &&
      cart.restaurantId !== item.restaurantId
    ) {
      // HIỂN THỊ POPUP HỎI XÁC NHẬN
      Modal.confirm({
        title: "Bạn muốn tạo đơn hàng mới?",
        icon: <ExclamationCircleOutlined />,
        content:
          "Giỏ hàng của bạn hiện đang có món ăn từ một nhà hàng khác. Bạn có muốn xóa giỏ hàng cũ và thêm món này không?",
        okText: "Tạo đơn mới",
        cancelText: "Hủy",
        onOk: () => {
          // Nếu user đồng ý, gọi API
          callApiAddToCart(item, quantity);
        },
        onCancel: () => {
          /* Không làm gì cả */
        },
      });
    } else {
      // Nếu giỏ hàng rỗng HOẶC cùng nhà hàng -> Thêm bình thường
      callApiAddToCart(item, quantity);
    }
  };

  // === CÁC HÀM CẬP NHẬT/XÓA (SỬA KIỂU TRẢ VỀ) ===
  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!cart) return;
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    try {
      // Sửa: Mong đợi kiểu <Cart>
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
      // Sửa: Mong đợi kiểu <Cart>
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
