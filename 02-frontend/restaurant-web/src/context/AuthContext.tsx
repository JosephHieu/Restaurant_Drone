import React, { createContext, useState, useEffect, useCallback } from "react";
// 1. IMPORT KIỂU DỮ LIỆU
import type { ReactNode } from "react";
import type { User } from "../types"; // <-- Dùng interface User từ thư mục /types

import api from "../services/api";

// Định nghĩa những gì Context sẽ cung cấp
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

// 3. THÊM DÒNG NÀY ĐỂ SỬA LỖI LINTER
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Tạo Provider (component "bọc" ứng dụng)
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    // Dùng key token riêng cho trang nhà hàng
    localStorage.getItem("restaurant_token")
  );
  const [isLoading, setIsLoading] = useState(true);

  // Bọc hàm logout bằng useCallback để ổn định
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("restaurant_token");
    if (api.defaults.headers.common) {
      api.defaults.headers.common["Authorization"] = undefined;
    }
  }, []);

  // Hàm này được gọi khi app vừa tải, để kiểm tra token cũ
  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get<User>("/api/users/me");

          // LOGIC QUAN TRỌNG: Chỉ cho phép RESTAURANT_OWNER (hoặc ADMIN)
          if (
            response.data.role.name === "RESTAURANT_OWNER" ||
            response.data.role.name === "ADMIN"
          ) {
            setUser(response.data);
          } else {
            // Đăng nhập thành công nhưng không phải vai trò chủ nhà hàng
            logout(); // Xóa token
          }
        } catch (error) {
          // Token hết hạn hoặc không hợp lệ
          console.error("Token không hợp lệ hoặc hết hạn:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, [token, logout]);

  // Hàm Login
  const login = useCallback(
    async (newToken: string) => {
      localStorage.setItem("restaurant_token", newToken);
      if (api.defaults.headers.common) {
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      }

      try {
        const response = await api.get<User>("/api/users/me");

        // LOGIC QUAN TRỌNG: Chỉ cho phép RESTAURANT_OWNER (hoặc ADMIN)
        if (
          response.data.role.name === "RESTAURANT_OWNER" ||
          response.data.role.name === "ADMIN"
        ) {
          setUser(response.data);
          setToken(newToken);
        } else {
          logout();
          throw new Error("Bạn không có quyền truy cập trang nhà hàng.");
        }
      } catch (error) {
        logout();
        throw error;
      }
    },
    [logout]
  );

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
