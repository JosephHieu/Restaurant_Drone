import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";

// Import AuthProvider
import { AuthProvider } from "./context/AuthContext";

// Import "Người gác cổng"
import ProtectedRoute from "./components/ProtectedRoute";

// Import Layout và các trang
import MainLayout from "./MainLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UserManagementPage from "./pages/UserManagementPage";
import RestaurantManagementPage from "./pages/RestaurantManagementPage";
import DroneManagementPage from "./pages/DroneManagementPage";

import AddUserPage from "./pages/AddUserPage";
import EditUserPage from "./pages/EditUserPage";
import OrderManagementPage from "./pages/OrderManagement";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    // Bọc các trang admin bằng "Người gác cổng"
    element: <ProtectedRoute />,
    children: [
      {
        // Khi mọi thứ OK, ProtectedRoute sẽ render <Outlet />
        // React Router sẽ khớp <MainLayout /> vào <Outlet /> đó
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "restaurants",
            element: <RestaurantManagementPage />,
          },
          {
            path: "orders",
            element: <OrderManagementPage />,
          },
          {
            path: "users", // Khi người dùng đi đến /users
            // Tự động chuyển hướng họ đến /users/list
            element: <Navigate to="/users/list" replace />,
          },
          {
            path: "users/list",
            element: <UserManagementPage />,
          },
          {
            path: "users/add", // <-- Đường dẫn mới
            element: <AddUserPage />, // <-- Trang thêm user
          },
          {
            path: "users/edit/:userId", // <-- :userId là tham số (param)
            element: <EditUserPage />,
          },
          {
            path: "drones",
            element: <DroneManagementPage />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* "Bọc" toàn bộ ứng dụng bằng AuthProvider */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
