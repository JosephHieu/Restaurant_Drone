import React, { useState } from "react";
import {
  DashboardOutlined,
  ShopOutlined,
  UserOutlined,
  RocketOutlined, // Icon cho Drone
  UserAddOutlined, // <-- 1. Import icon mới
  TeamOutlined,
  ContainerOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";

const { Header, Content, Footer, Sider } = Layout;

// 3. Định nghĩa các mục con cho menu User
const userMenuItems = [
  {
    key: "/users/list",
    icon: <TeamOutlined />,
    label: <Link to="/users/list">Danh sách Người dùng</Link>,
  },
  {
    key: "/users/add",
    icon: <UserAddOutlined />,
    label: <Link to="/users/add">Thêm Người dùng</Link>,
  },
];

// Định nghĩa các mục trong Menu
// Key phải khớp với đường dẫn (path) trong router
const items: MenuProps["items"] = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: <Link to="/">Dashboard</Link>,
  },
  {
    key: "/restaurants",
    icon: <ShopOutlined />,
    label: <Link to="/restaurants">Quản lý Nhà hàng</Link>,
  },
  {
    key: "/orders",
    icon: <ContainerOutlined />,
    label: <Link to="/orders">Quản lý Đơn hàng</Link>,
  },
  {
    key: "/users",
    icon: <UserOutlined />,
    label: <Link to="/users">Quản lý Người dùng</Link>,
    children: userMenuItems, // <-- 2. Thêm mục con vào đây
  },
  {
    key: "/drones",
    icon: <RocketOutlined />,
    label: <Link to="/drones">Quản lý Drone</Link>,
  },
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation(); // Hook để lấy URL hiện tại

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 6. Logic để tự động mở Submenu
  const openKeys = ["/" + location.pathname.split("/")[1]]; // Tự động mở key cha (ví dụ: '/users')

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 1. SIDEBAR (MENU BÊN TRÁI) */}
      <Sider
        width={250}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div
          className="demo-logo-vertical"
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
          }}
        />

        <Menu
          theme="dark"
          // Tự động chọn mục con (ví dụ: '/users/list')
          selectedKeys={[location.pathname]}
          // Tự động mở mục cha (ví dụ: '/users')
          defaultOpenKeys={openKeys}
          mode="inline"
          items={items}
        />
      </Sider>

      {/* 2. KHUNG CHÍNH (HEADER + CONTENT) */}
      <Layout>
        {/* HEADER */}
        <Header style={{ padding: "0 16px", background: colorBgContainer }}>
          {/* Bạn có thể thêm Avatar và nút Đăng xuất ở đây */}
          <span style={{ fontWeight: "bold" }}>
            Trang Quản Trị FoodFast Drone
          </span>
        </Header>

        {/* CONTENT (NỘI DUNG CHÍNH) */}
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            {/* Breadcrumb có thể làm tự động sau */}
            <Breadcrumb.Item>Admin</Breadcrumb.Item>
            <Breadcrumb.Item>
              {location.pathname.replace("/", "") || "Dashboard"}
            </Breadcrumb.Item>
          </Breadcrumb>

          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {/* Đây là nơi các trang con (Dashboard, Users...) sẽ được render */}
            <Outlet />
          </div>
        </Content>

        {/* FOOTER */}
        <Footer style={{ textAlign: "center" }}>
          Đồ án Giao hàng bằng Drone ©{new Date().getFullYear()} - Nhóm 10
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
