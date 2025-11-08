"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import api from "@/services/api"; // <-- Import file api.ts
import type { User } from "@/types"; // <-- Import file types/index.ts

// 1. SỬA LẠI INTERFACE
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>; // <-- Sửa: Login bằng token
  // Sửa: Hàm register này là async
  register: (
    email: string,
    password: string,
    name: string,
    phone: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. TẠO HÀM LOGOUT
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("client_token");
    delete api.defaults.headers.common["Authorization"];
  }, []);

  // 3. KIỂM TRA TOKEN CŨ KHI TẢI TRANG
  useEffect(() => {
    const loadUserFromToken = async () => {
      const storedToken = localStorage.getItem("client_token");
      if (storedToken) {
        try {
          setToken(storedToken);
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;
          const response = await api.get<User>("/api/users/me");
          setUser(response.data);
        } catch (e) {
          logout();
        }
      }
      setIsLoading(false);
    };
    loadUserFromToken();
  }, [logout]);

  // 4. HÀM LOGIN (Được gọi bởi Modal)
  const login = async (newToken: string) => {
    localStorage.setItem("client_token", newToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);
    try {
      const response = await api.get<User>("/api/users/me");
      setUser(response.data);
    } catch (error) {
      logout();
    }
  };

  // 5. HÀM REGISTER "THẬT" (GỌI API)
  const register = async (
    email: string,
    password: string,
    name: string,
    phone: string
  ) => {
    // 1. Gọi API /register (của user-service)
    await api.post("/api/auth/register", {
      email: email,
      password: password,
      fullName: name, // <-- Dùng tên thật
      phone: phone, // <-- Dùng SĐT thật
    });

    // 2. Tự động đăng nhập để lấy token
    const loginResponse = await api.post("/api/auth/login", {
      email,
      password,
    });

    // 3. Gọi hàm login ở trên để lưu token và user
    await login(loginResponse.data.accessToken);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

// 6. Hook useAuth (Giữ nguyên)
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
