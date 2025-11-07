import React, { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { User } from "../types"; // Import User interface
import api from "../services/api";

// Import từ file .ts
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    // Dùng một key (khóa) chung cho dashboard
    localStorage.getItem("dashboard_token")
  );
  const [isLoading, setIsLoading] = useState(true);

  // Bọc hàm logout
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("dashboard_token");
    if (api.defaults.headers.common) {
      api.defaults.headers.common["Authorization"] = undefined;
    }
  }, []);

  // Kiểm tra token cũ khi tải trang
  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get<User>("/api/users/me");

          // === LOGIC GỘP ===
          // Chấp nhận ADMIN hoặc CHỦ NHÀ HÀNG
          if (
            response.data.role.name === "ADMIN" ||
            response.data.role.name === "RESTAURANT_OWNER"
          ) {
            setUser(response.data);
          } else {
            logout(); // Không phải 2 vai trò trên -> Đăng xuất
          }
        } catch (error) {
          logout(); // Token hỏng
          console.error("Token không hợp lệ hoặc hết hạn:", error);
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, [token, logout]);

  // Hàm Login
  const login = useCallback(
    async (newToken: string) => {
      localStorage.setItem("dashboard_token", newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      try {
        const response = await api.get<User>("/api/users/me");

        // === LOGIC GỘP ===
        if (
          response.data.role.name === "ADMIN" ||
          response.data.role.name === "RESTAURANT_OWNER"
        ) {
          setUser(response.data);
          setToken(newToken);
        } else {
          logout();
          throw new Error("Tài khoản không có quyền truy cập trang này.");
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
