import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Spin } from "antd";

const ProtectedRoute: React.FC = () => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return <Spin fullscreen tip="Đang tải..." />;
  }

  // === SỬA LỖI LOGIC QUAN TRỌNG ===
  if (
    !token ||
    !user ||
    (user.role.name !== "RESTAURANT_OWNER" && user.role.name !== "ADMIN")
  ) {
    return <Navigate to="/login" replace />;
  }

  // Mọi thứ OK
  return <Outlet />;
};

export default ProtectedRoute;
