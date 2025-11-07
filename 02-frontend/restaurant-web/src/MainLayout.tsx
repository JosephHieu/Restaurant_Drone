import React, { useState } from "react";
import {
  DashboardOutlined,
  ContainerOutlined,
  ShopOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
// 1. THÊM "message" TỪ ANTD
import {
  Layout,
  Menu,
  theme,
  Avatar,
  Dropdown,
  Space,
  Typography,
  message,
} from "antd";
// 2. THÊM "useNavigate"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
// 3. IMPORT "useAuth"
import { useAuth } from "./hooks/useAuth";

// Lấy các component Layout từ AntD
const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

// Định nghĩa các mục trong Menu (để ở ngoài là OK)
const menuItems: MenuProps["items"] = [
  {
    key: "/", // Trang chủ Dashboard
    icon: <DashboardOutlined />,
    label: <Link to="/">Tổng quan</Link>,
  },
  {
    key: "/orders", // Trang Quản lý Đơn hàng
    icon: <ContainerOutlined />,
    label: <Link to="/orders">Quản lý Đơn hàng</Link>,
  },
  {
    key: "/menu", // Trang Quản lý Thực đơn
    icon: <ShopOutlined />,
    label: <Link to="/menu">Quản lý Thực đơn</Link>,
  },
  {
    key: "/profile", // Trang Thông tin Nhà hàng
    icon: <SettingOutlined />,
    label: <Link to="/profile">Thông tin Nhà hàng</Link>,
  },
];

// --- COMPONENT CHÍNH ---
const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation(); // Hook để lấy URL hiện tại

  // 4. LẤY CÁC HOOKS (PHẢI Ở TRONG COMPONENT)
  const { user, logout } = useAuth(); // Lấy user và hàm logout từ Context
  const navigate = useNavigate(); // Hook để điều hướng

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 5. TẠO HÀM XỬ LÝ ĐĂNG XUẤT (PHẢI Ở TRONG COMPONENT)
  const handleLogout = () => {
    logout(); // Gọi hàm logout (xóa token trong localStorage)
    message.success("Đăng xuất thành công!"); // Thông báo
    navigate("/login"); // Chuyển hướng về trang đăng nhập
  };

  // 6. TẠO MENU ĐĂNG XUẤT (PHẢI Ở TRONG COMPONENT)
  const userMenu: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout, // <-- GỌI HÀM KHI CLICK
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 1. SIDEBAR (MENU BÊN TRÁI) */}
      <Sider
        width={250} // Sửa lỗi chữ bị cắt
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        {/* Logo (Bạn có thể thay bằng ảnh) */}
        <div
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
            textAlign: "center",
            lineHeight: "32px",
            color: "white",
            fontWeight: "bold",
            borderRadius: 4,
          }}
        >
          {collapsed ? "R" : "Restaurant Portal"}
        </div>

        <Menu
          theme="dark"
          selectedKeys={[location.pathname]} // Tự động highlight mục menu
          mode="inline"
          items={menuItems}
        />
      </Sider>

      {/* 2. KHUNG CHÍNH (BÊN PHẢI) */}
      <Layout>
        {/* HEADER (ĐẦU TRANG) */}
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "flex-end", // Đẩy nội dung Header sang phải
            alignItems: "center",
          }}
        >
          {/* Avatar và Menu Đăng xuất */}
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Avatar icon={<UserOutlined />} />
                {/* Lấy tên user từ AuthContext */}
                <Text>{user ? user.fullName : "Chủ nhà hàng"}</Text>
              </Space>
            </a>
          </Dropdown>
        </Header>

        {/* CONTENT (NỘI DUNG TRANG) */}
        <Content style={{ margin: "16px" }}>
          <div
            style={{
              padding: 24,
              minHeight: "calc(100vh - 160px)", // Tính toán chiều cao
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {/* Đây là nơi các trang (Dashboard, Orders, Menu) sẽ được render */}
            <Outlet />
          </div>
        </Content>

        {/* FOOTER */}
        <Footer
          style={{ textAlign: "center", height: "48px", padding: "16px 0" }}
        >
          FoodFast Restaurant Portal ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
