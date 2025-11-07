import React, { useState, useMemo, useEffect } from "react"; // <-- Thêm useEffect
import {
  DashboardOutlined,
  ShopOutlined,
  UserOutlined,
  RocketOutlined,
  ContainerOutlined,
  SettingOutlined,
  TeamOutlined,
  UserAddOutlined,
  LogoutOutlined,
  ExceptionOutlined,
  FileAddOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  Layout,
  Menu,
  theme,
  Avatar,
  Dropdown,
  Space,
  Typography,
  message,
  Breadcrumb,
} from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

// --- COMPONENT CHÍNH ---
const MainLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // === SỬA LỖI LOGIC MENU ===
  // 1. Hàm tính toán submenu nào cần mở dựa trên URL
  const calculateOpenKeys = (pathname: string, role?: string) => {
    const pathParts = pathname.split("/").filter(Boolean);
    if (role === "ADMIN" && pathParts.length > 1) {
      // Ví dụ: /admin/users/list -> ["admin", "users", "list"]
      // Key của submenu cha là "/admin/users"
      return ["/" + pathParts[0] + "/" + pathParts[1]];
    }
    return []; // Chủ nhà hàng không có submenu
  };

  // 2. Tạo một 'state' (trạng thái) để lưu các menu đang mở
  const [currentOpenKeys, setCurrentOpenKeys] = useState(
    calculateOpenKeys(location.pathname, user?.role.name)
  );

  // 3. Cập nhật 'state' này khi URL thay đổi (hoặc khi user thay đổi)
  useEffect(() => {
    setCurrentOpenKeys(calculateOpenKeys(location.pathname, user?.role.name));
  }, [location.pathname, user]); // Phụ thuộc vào URL và user

  // 4. Tạo hàm 'onOpenChange' để cập nhật 'state' khi NGƯỜI DÙNG CLICK
  const onOpenChange: MenuProps["onOpenChange"] = (keys) => {
    setCurrentOpenKeys(keys);
  };
  // =========================

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    logout();
    message.success("Đăng xuất thành công!");
    navigate("/login");
  };

  // Tạo menu động (Logic này đã đúng)
  const menuItems = useMemo(() => {
    const role = user?.role.name;
    if (role === "ADMIN") {
      return [
        {
          key: "/",
          icon: <DashboardOutlined />,
          label: <Link to="/">Dashboard Admin</Link>,
        },
        {
          key: "/admin/users",
          icon: <UserOutlined />,
          label: "Quản lý Người dùng",
          children: [
            {
              key: "/admin/users/list",
              icon: <TeamOutlined />,
              label: <Link to="/admin/users/list">Danh sách</Link>,
            },
            {
              key: "/admin/users/add",
              icon: <UserAddOutlined />,
              label: <Link to="/admin/users/add">Thêm mới</Link>,
            },
          ],
        },
        {
          key: "/admin/restaurants",
          icon: <ShopOutlined />,
          label: "Quản lý Nhà hàng",
          children: [
            {
              key: "/admin/restaurants/pending",
              icon: <ExceptionOutlined />,
              label: <Link to="/admin/restaurants/pending">Phê duyệt</Link>,
            },
            {
              key: "/admin/restaurants/list",
              icon: <DatabaseOutlined />,
              label: <Link to="/admin/restaurants/list">Tất cả nhà hàng</Link>,
            },
            {
              key: "/admin/restaurants/add",
              icon: <FileAddOutlined />,
              label: <Link to="/admin/restaurants/add">Thêm mới</Link>,
            },
          ],
        },
        {
          key: "/admin/orders",
          icon: <ContainerOutlined />,
          label: <Link to="/admin/orders">Quản lý Đơn hàng</Link>,
        },
        {
          key: "/admin/drones",
          icon: <RocketOutlined />,
          label: <Link to="/admin/drones">Quản lý Drone</Link>,
        },
      ];
    }
    if (role === "RESTAURANT_OWNER") {
      return [
        {
          key: "/",
          icon: <DashboardOutlined />,
          label: <Link to="/">Tổng quan</Link>,
        },
        {
          key: "/orders",
          icon: <ContainerOutlined />,
          label: <Link to="/orders">Quản lý Đơn hàng</Link>,
        },
        {
          key: "/menu",
          icon: <ShopOutlined />,
          label: <Link to="/menu">Quản lý Thực đơn</Link>,
        },
        {
          key: "/profile",
          icon: <SettingOutlined />,
          label: <Link to="/profile">Thông tin Nhà hàng</Link>,
        },
      ];
    }
    return [];
  }, [user]);

  // Menu đăng xuất (Đã đúng)
  const userMenu: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={250}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
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
          {collapsed ? "D" : "Dashboard"}
        </div>

        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          // 5. GÁN CẢ 2 PROP VÀO MENU
          openKeys={currentOpenKeys} // Trạng thái hiện tại
          onOpenChange={onOpenChange} // Hàm khi user click
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Avatar icon={<UserOutlined />} />
                <Text>{user ? user.fullName : "Đang tải..."}</Text>
              </Space>
            </a>
          </Dropdown>
        </Header>
        <Content style={{ margin: "16px" }}>
          {/* Breadcrumb */}
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>
              {location.pathname.split("/")[1] || "Dashboard"}
            </Breadcrumb.Item>
            {location.pathname.split("/")[2] && (
              <Breadcrumb.Item>
                {location.pathname.split("/")[2]}
              </Breadcrumb.Item>
            )}
          </Breadcrumb>

          <div
            style={{
              padding: 24,
              minHeight: "calc(100vh - 160px)",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer
          style={{ textAlign: "center", height: "48px", padding: "16px 0" }}
        >
          FoodFast Dashboard ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
