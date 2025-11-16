import React, { useEffect, useState } from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Spin,
  Alert,
  Select,
  Space,
  message,
} from "antd";
import {
  ShoppingCartOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  IssuesCloseOutlined,
} from "@ant-design/icons";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type {
  OrderStatsDto,
  DroneStatsDto,
  RestaurantStatsDto,
  Restaurant,
} from "../types";

const { Title } = Typography;
const { Option } = Select;

// ===================================================================
// === COMPONENT 1: ADMIN DASHBOARD ===
// ===================================================================
const AdminDashboard: React.FC = () => {
  const [orderStats, setOrderStats] = useState<OrderStatsDto | null>(null);
  const [droneStats, setDroneStats] = useState<DroneStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [orderResponse, droneResponse] = await Promise.all([
          api.get<OrderStatsDto>("/api/orders/stats"),
          api.get<DroneStatsDto>("/api/drones/stats"),
        ]);
        setOrderStats(orderResponse.data);
        setDroneStats(droneResponse.data);
      } catch (err) {
        setError("Không thể tải dữ liệu dashboard (Admin).");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Spin tip="Đang tải thống kê Admin..." size="large" />;

  if (error)
    return <Alert message="Lỗi" description={error} type="error" showIcon />;

  return (
    <div>
      <Title level={2}>Tổng quan Dashboard (Admin)</Title>

      {/* Thống kê Đơn hàng */}
      <Title level={4}>Thống kê Toàn hệ thống</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng Doanh thu (VND)"
              value={orderStats?.totalRevenue.toLocaleString("vi-VN")}
              prefix={<DollarCircleOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng Đơn hàng"
              value={orderStats?.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Đang chờ xử lý"
              value={orderStats?.pendingOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Đang giao hàng"
              value={orderStats?.deliveringOrders}
              prefix={<IssuesCloseOutlined />}
              valueStyle={{ color: "#0958d9" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê Drone */}
      <Title level={4} style={{ marginTop: 24 }}>
        Thống kê Đội bay
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng số Drone"
              value={droneStats?.totalDrones}
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Drone Rảnh rỗi"
              value={droneStats?.idleDrones}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Drone Đang giao"
              value={droneStats?.deliveringDrones}
              prefix={<IssuesCloseOutlined />}
              valueStyle={{ color: "#0958d9" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// ===================================================================
// === COMPONENT 2: OWNER DASHBOARD ===
// ===================================================================
const OwnerDashboard: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    number | null
  >(null);
  const [stats, setStats] = useState<RestaurantStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tải danh sách nhà hàng của tôi
  useEffect(() => {
    const fetchOwnedRestaurants = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<Restaurant[]>("/api/restaurants/my/all");
        const openRestaurants = response.data.filter(
          (r) => r.status === "open"
        );
        setRestaurants(openRestaurants);

        if (openRestaurants.length > 0)
          setSelectedRestaurantId(openRestaurants[0].restaurantId);
        else setError("Bạn không có nhà hàng nào đang 'Mở cửa'.");
      } catch (err) {
        setError("Không thể tải danh sách nhà hàng của bạn.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOwnedRestaurants();
  }, []);

  // Tải thống kê mỗi khi chọn nhà hàng
  useEffect(() => {
    if (!selectedRestaurantId) return;

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const response = await api.get<RestaurantStatsDto>(
          `/api/orders/restaurant-stats/${selectedRestaurantId}`
        );
        setStats(response.data);
      } catch (err) {
        message.error("Không thể tải thống kê cho nhà hàng này.");
        console.error(err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [selectedRestaurantId]);

  if (loading) return <Spin tip="Đang tải dữ liệu nhà hàng..." size="large" />;
  if (error)
    return <Alert message="Lỗi" description={error} type="error" showIcon />;

  return (
    <div>
      <Title level={2}>Tổng quan Nhà hàng</Title>

      <Space style={{ marginBottom: 24 }}>
        <Title level={5} style={{ margin: 0 }}>
          Chọn nhà hàng:
        </Title>
        <Select
          style={{ width: 300 }}
          value={selectedRestaurantId}
          onChange={(value) => setSelectedRestaurantId(value)}
          placeholder="Chọn nhà hàng"
        >
          {restaurants.map((r) => (
            <Option key={r.restaurantId} value={r.restaurantId}>
              {r.name}
            </Option>
          ))}
        </Select>
      </Space>

      <Spin spinning={statsLoading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Tổng Doanh thu (VND)"
                value={stats?.totalRevenue.toLocaleString("vi-VN")}
                prefix={<DollarCircleOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Tổng Đơn hàng"
                value={stats?.totalOrders}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Đang chờ xử lý"
                value={stats?.pendingOrders}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Đang giao hàng"
                value={stats?.deliveringOrders}
                prefix={<IssuesCloseOutlined />}
                valueStyle={{ color: "#0958d9" }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

// ===================================================================
// === COMPONENT CHÍNH: PHÂN LUỒNG NGƯỜI DÙNG ===
// ===================================================================
const DashboardPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return <Spin tip="Đang tải thông tin người dùng..." size="large" />;

  if (!user)
    return (
      <Alert
        message="Lỗi"
        description="Không thể xác định vai trò người dùng."
        type="error"
        showIcon
      />
    );

  if (user.role.name === "ADMIN") return <AdminDashboard />;
  if (user.role.name === "RESTAURANT_OWNER") return <OwnerDashboard />;

  return (
    <Alert
      message="Lỗi"
      description="Vai trò của bạn không được hỗ trợ."
      type="error"
      showIcon
    />
  );
};

export default DashboardPage;
