import React, { createContext, useState, useEffect, useCallback } from "react";
// 1. IMPORT KIỂU DỮ LIỆU
import type { ReactNode } from "react";
import type { User } from "../types"; // <-- DÙNG INTERFACE TỪ ĐÂY

import api from "../services/api";

// Định nghĩa những gì Context sẽ cung cấp
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

// 3. Export AuthContext
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
    // SỬA 1: Dùng key chung
    localStorage.getItem("dashboard_token")
  );
  const [isLoading, setIsLoading] = useState(true);

  // Bọc hàm logout bằng useCallback để ổn định
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    // SỬA 2: Dùng key chung
    localStorage.removeItem("dashboard_token");
    if (api.defaults.headers.common) {
      api.defaults.headers.common["Authorization"] = undefined;
    }
  }, []);

  // Hàm này được gọi khi app vừa tải, để kiểm tra token cũ
  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          if (api.defaults.headers.common) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          }

          const response = await api.get<User>("/api/users/me");

          // === SỬA 3: CHO PHÉP CẢ 2 VAI TRÒ ===
          if (
            response.data.role.name === "ADMIN" ||
            response.data.role.name === "RESTAURANT_OWNER"
          ) {
            setUser(response.data);
          } else {
            // Nếu là "USER" hoặc vai trò khác -> Đăng xuất
            logout();
          }
          // ===================================
        } catch (error) {
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
      // SỬA 4: Dùng key chung
      localStorage.setItem("dashboard_token", newToken);
      if (api.defaults.headers.common) {
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      }

      try {
        const response = await api.get<User>("/api/users/me");

        // === SỬA 5: CHO PHÉP CẢ 2 VAI TRÒ ===
        if (
          response.data.role.name === "ADMIN" ||
          response.data.role.name === "RESTAURANT_OWNER"
        ) {
          setUser(response.data);
          setToken(newToken);
        } else {
          logout();
          // SỬA 6: Sửa lại thông báo lỗi
          throw new Error(
            "Tài khoản của bạn không có quyền truy cập trang này."
          );
        }
        // ===================================
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
