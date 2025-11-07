import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css"; // File CSS full-height bạn đã tạo

// 1. Import Auth và Gatekeeper
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// 2. Import Layout và các trang
import MainLayout from "./MainLayout"; // Layout bạn đã tạo
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import OrderManagementPage from "./pages/OrderManagementPage";
import MenuManagementPage from "./pages/MenuManagementPage";
import ProfilePage from "./pages/ProfilePage";

// 3. Định nghĩa Routes (đường dẫn)
const router = createBrowserRouter([
  {
    path: "/login", // Trang login đứng riêng
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />, // "Người gác cổng"
    children: [
      {
        element: <MainLayout />, // Layout chính (có Sidebar)
        children: [
          {
            index: true, // Trang chủ (/)
            element: <DashboardPage />,
          },
          {
            path: "orders",
            element: <OrderManagementPage />,
          },
          {
            path: "menu",
            element: <MenuManagementPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
]);

// 4. Render ứng dụng
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Bọc toàn bộ App bằng AuthProvider */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
