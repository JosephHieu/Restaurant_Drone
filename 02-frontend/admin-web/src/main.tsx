import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";

// 1. Import Auth (Đã đúng)
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";

// 2. Import Layout (Đã đúng)
import MainLayout from "./MainLayout";
import LoginPage from "./pages/LoginPage";

// 3. Import các trang (Pages)
import DashboardPage from "./pages/DashboardPage";

// --- Trang của Admin ---

import UserManagementPage from "./pages/UserManagementPage";
import AddUserPage from "./pages/AddUserPage";
import EditUserPage from "./pages/EditUserPage";
import DroneManagementPage from "./pages/DroneManagementPage";
import AdminRestaurantPage from "./pages/AdminRestaurantPage";
import AdminOrderPage from "./pages/AdminOrderPage";
import AdminRestaurantPendingPage from "./pages/AdminRestaurantPendingPage";
import AdminRestaurantAddPage from "./pages/AdminRestaurantAddPage";
import AdminRestaurantEditPage from "./pages/AdminRestaurantEditPage";

import RestaurantOwnerEditPage from "./pages/RestaurantOwnerEditPage";

// --- Trang của Chủ nhà hàng ---
import OrderManagementPage from "./pages/OrderManagementPage";
import ProfilePage from "./pages/ProfilePage";
import MenuManagementPage from "./pages/MenuManagementPage";

// 4. Định nghĩa Router
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          // Trang chủ chung
          { index: true, element: <DashboardPage /> },

          // === TUYẾN ĐƯỜNG CỦA ADMIN (USER) ===
          {
            path: "admin/users",
            element: <Navigate to="/admin/users/list" replace />,
          },
          {
            path: "admin/users/list",
            element: <UserManagementPage />,
          },
          {
            path: "admin/users/add",
            element: <AddUserPage />,
          },
          {
            path: "admin/users/edit/:userId",
            element: <EditUserPage />,
          },
          {
            path: "admin/drones",
            element: <DroneManagementPage />,
          },
          {
            path: "admin/orders",
            element: <AdminOrderPage />,
          },

          // === TUYẾN ĐƯỜNG ADMIN (RESTAURANT) ===
          {
            path: "admin/restaurants", // Trang gốc
            element: <Navigate to="/admin/restaurants/list" replace />, // Chuyển về "Danh sách"
          },
          {
            path: "admin/restaurants/list", // Trang danh sách
            element: <AdminRestaurantPage />,
          },
          {
            path: "admin/restaurants/pending", // Trang chờ duyệt
            element: <AdminRestaurantPendingPage />,
          },
          {
            path: "admin/restaurants/add", // Trang thêm mới
            element: <AdminRestaurantAddPage />,
          },
          {
            path: "admin/restaurants/edit/:restaurantId", // <-- :restaurantId là tham số
            element: <AdminRestaurantEditPage />,
          },
          // ==========================================

          // === TUYẾN ĐƯỜNG CỦA CHỦ NHÀ HÀNG ===
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
          {
            path: "profile/edit/:restaurantId", // <-- Route Sửa của Owner
            element: <RestaurantOwnerEditPage />,
          },
        ],
      },
    ],
  },
]);

// 5. Render App (Đã đúng)
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
