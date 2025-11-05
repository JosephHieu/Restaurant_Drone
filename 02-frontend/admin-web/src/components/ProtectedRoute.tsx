import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Spin } from "antd";

const ProtectedRoute: React.FC = () => {
  const { user, token, isLoading } = useAuth();

  // 1. Đang kiểm tra token (lúc mới tải trang) -> Hiển thị loading
  if (isLoading) {
    return <Spin fullscreen tip="Đang tải..." />;
  }

  // 2. Không có token HOẶC không có user (chưa login) -> Về trang login
  // 3. Có user nhưng vai trò không phải ADMIN -> Về trang login
  if (!token || !user || user.role.name !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  // 4. Mọi thứ OK -> Cho phép render MainLayout (và các trang con)
  return <Outlet />;
};

export default ProtectedRoute;
