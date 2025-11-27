import React, { useEffect, useState, useMemo } from "react";
import {
  Typography,
  Spin,
  Alert,
  Select,
  Row,
  Col,
  Card,
  Button,
  message,
  Space,
  Empty,
  Divider,
  List,
  Tag,
} from "antd";
import {
  CheckOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  CarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import api from "../services/api";
import type { Restaurant } from "../types";
import type { Order, OrderItem } from "../types";
import { AxiosError } from "axios";

const { Title, Text } = Typography;
const { Option } = Select;

// Kiểu dữ liệu lỗi
interface ErrorResponse {
  message: string;
}

const OrderManagementPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    number | null
  >(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Tải danh sách nhà hàng (để điền vào Bộ chọn)
  useEffect(() => {
    const fetchOwnedRestaurants = async () => {
      try {
        const response = await api.get<Restaurant[]>("/api/restaurants/my/all");
        const openRestaurants = response.data.filter(
          (r) => r.status === "open"
        );
        setRestaurants(openRestaurants);

        if (openRestaurants.length > 0) {
          setSelectedRestaurantId(openRestaurants[0].restaurantId);
        } else {
          setError("Bạn chưa có nhà hàng nào 'Mở cửa'.");
          setLoading(false);
        }
      } catch (err) {
        setError("Không thể tải danh sách nhà hàng.");
        setLoading(false);
        console.error(err);
      }
    };
    fetchOwnedRestaurants();
  }, []); // Chạy 1 lần

  // 2. Tải danh sách Đơn hàng (mỗi khi đổi nhà hàng) + Auto refresh
  useEffect(() => {
    if (!selectedRestaurantId) return;

    const fetchOrders = async () => {
      try {
        const response = await api.get<Order[]>(
          `/api/orders/restaurant/${selectedRestaurantId}`
        );
        setOrders(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
    
    // Auto refresh mỗi 5 giây để cập nhật khi khách xác nhận
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [selectedRestaurantId]);

  // 3. Hàm cập nhật trạng thái
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await api.put<Order>(`/api/orders/${orderId}/status`, {
        status: newStatus,
      });
      const updatedOrder = response.data;
      message.success(`Đã cập nhật đơn hàng #${orderId}`);
      setOrders((prev) =>
        prev.map((order) => (order.orderId === orderId ? updatedOrder : order))
      );
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data as ErrorResponse;
        message.error(errorData.message || "Lỗi khi cập nhật.");
      } else {
        message.error("Lỗi khi cập nhật trạng thái.");
      }
    }
  };

  // 4. Lọc đơn hàng cho các cột (Kanban)
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "PENDING"),
    [orders]
  );

  const confirmedOrders = useMemo(
    () => orders.filter((o) => o.status === "CONFIRMED"),
    [orders]
  );

  const deliveringOrders = useMemo(
    () => orders.filter((o) => o.status === "DELIVERING"),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === "COMPLETED").slice(0, 5), // Chỉ hiện 5 đơn gần nhất
    [orders]
  );

  if (loading && restaurants.length === 0) {
    return <Spin tip="Đang tải dữ liệu..." fullscreen />;
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý Đơn hàng</Title>

      {/* 5. Bộ chọn nhà hàng */}
      <Space style={{ marginBottom: 24 }}>
        <Title level={5} style={{ margin: 0 }}>
          Quán đang chọn:
        </Title>
        <Select
          style={{ width: 250 }}
          value={selectedRestaurantId}
          onChange={(value) => setSelectedRestaurantId(value)}
          placeholder="Chọn nhà hàng"
          disabled={restaurants.length <= 1}
        >
          {restaurants.map((r) => (
            <Option key={r.restaurantId} value={r.restaurantId}>
              {r.name}
            </Option>
          ))}
        </Select>
      </Space>

      {/* 6. Giao diện Kanban Board - 4 cột */}
      <Spin spinning={loading}>
        <Row gutter={16}>
          {/* CỘT 1: CHỜ XÁC NHẬN (PENDING) */}
          <Col xs={24} md={6}>
            <Card
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: "#faad14" }} /> Chờ xác nhận ({pendingOrders.length})
                </Space>
              }
              style={{ backgroundColor: "#fffbe6", minHeight: "60vh" }}
              size="small"
            >
              {pendingOrders.length === 0 && (
                <Empty description="Không có đơn hàng mới" />
              )}
              <Space direction="vertical" style={{ width: "100%" }}>
                {pendingOrders.map((order) => (
                  <Card key={order.orderId} size="small" hoverable>
                    <Title level={5}>Đơn #{order.orderId}</Title>
                    <List
                      dataSource={order.orderItems}
                      size="small"
                      renderItem={(item: OrderItem) => (
                        <List.Item style={{ padding: "2px 0" }}>
                          <Text>
                            <strong>{item.quantity}x</strong> {item.name}
                          </Text>
                        </List.Item>
                      )}
                    />
                    <Divider style={{ margin: "8px 0" }} />
                    <p style={{ margin: "4px 0" }}>
                      <Text strong type="danger">
                        {order.totalPrice.toLocaleString("vi-VN")} đ
                      </Text>
                    </p>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => handleUpdateStatus(order.orderId, "CONFIRMED")}
                      block
                    >
                      Xác nhận
                    </Button>
                  </Card>
                ))}
              </Space>
            </Card>
          </Col>

          {/* CỘT 2: ĐANG CHUẨN BỊ (CONFIRMED) */}
          <Col xs={24} md={6}>
            <Card
              title={
                <Space>
                  <CheckOutlined style={{ color: "#1890ff" }} /> Đang chuẩn bị ({confirmedOrders.length})
                </Space>
              }
              style={{ backgroundColor: "#e6f7ff", minHeight: "60vh" }}
              size="small"
            >
              {confirmedOrders.length === 0 && (
                <Empty description="Không có đơn" />
              )}
              <Space direction="vertical" style={{ width: "100%" }}>
                {confirmedOrders.map((order) => (
                  <Card key={order.orderId} size="small" hoverable>
                    <Title level={5}>Đơn #{order.orderId}</Title>
                    <List
                      dataSource={order.orderItems}
                      size="small"
                      renderItem={(item: OrderItem) => (
                        <List.Item style={{ padding: "2px 0" }}>
                          <Text>
                            <strong>{item.quantity}x</strong> {item.name}
                          </Text>
                        </List.Item>
                      )}
                    />
                    <Divider style={{ margin: "8px 0" }} />
                    <p style={{ margin: "4px 0" }}>
                      <Text strong type="danger">
                        {order.totalPrice.toLocaleString("vi-VN")} đ
                      </Text>
                    </p>
                    <Button
                      type="primary"
                      style={{ backgroundColor: "#52c41a" }}
                      icon={<RocketOutlined />}
                      onClick={() => handleUpdateStatus(order.orderId, "DELIVERING")}
                      block
                    >
                      🚁 Giao hàng
                    </Button>
                  </Card>
                ))}
              </Space>
            </Card>
          </Col>

          {/* CỘT 3: ĐANG GIAO (DELIVERING) - Chờ khách xác nhận */}
          <Col xs={24} md={6}>
            <Card
              title={
                <Space>
                  <CarOutlined style={{ color: "#722ed1" }} /> Đang giao ({deliveringOrders.length})
                </Space>
              }
              style={{ backgroundColor: "#f9f0ff", minHeight: "60vh" }}
              size="small"
            >
              {deliveringOrders.length === 0 && (
                <Empty description="Không có đơn đang giao" />
              )}
              <Space direction="vertical" style={{ width: "100%" }}>
                {deliveringOrders.map((order) => (
                  <Card key={order.orderId} size="small" hoverable>
                    <Title level={5}>Đơn #{order.orderId}</Title>
                    <Tag color="purple" style={{ marginBottom: 8 }}>🚁 Drone đang giao</Tag>
                    <List
                      dataSource={order.orderItems}
                      size="small"
                      renderItem={(item: OrderItem) => (
                        <List.Item style={{ padding: "2px 0" }}>
                          <Text>
                            <strong>{item.quantity}x</strong> {item.name}
                          </Text>
                        </List.Item>
                      )}
                    />
                    <Divider style={{ margin: "8px 0" }} />
                    <p style={{ margin: "4px 0", fontSize: "12px" }}>
                      📍 {order.deliveryAddress}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <Text strong type="danger">
                        {order.totalPrice.toLocaleString("vi-VN")} đ
                      </Text>
                    </p>
                    <Alert
                      message="Chờ khách xác nhận nhận hàng"
                      type="info"
                      showIcon
                      style={{ fontSize: "11px" }}
                    />
                  </Card>
                ))}
              </Space>
            </Card>
          </Col>

          {/* CỘT 4: HOÀN THÀNH (COMPLETED) */}
          <Col xs={24} md={6}>
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} /> Hoàn thành ({completedOrders.length})
                </Space>
              }
              style={{ backgroundColor: "#f6ffed", minHeight: "60vh" }}
              size="small"
            >
              {completedOrders.length === 0 && (
                <Empty description="Chưa có đơn hoàn thành" />
              )}
              <Space direction="vertical" style={{ width: "100%" }}>
                {completedOrders.map((order) => (
                  <Card key={order.orderId} size="small">
                    <Title level={5}>Đơn #{order.orderId}</Title>
                    <Tag color="success">✅ Giao thành công</Tag>
                    <p style={{ margin: "8px 0" }}>
                      <Text strong type="danger">
                        {order.totalPrice.toLocaleString("vi-VN")} đ
                      </Text>
                    </p>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </Text>
                  </Card>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default OrderManagementPage;
