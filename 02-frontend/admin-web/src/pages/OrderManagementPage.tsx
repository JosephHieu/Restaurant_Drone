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
} from "antd";
import {
  CheckOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
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

  // 2. Tải danh sách Đơn hàng (mỗi khi đổi nhà hàng)
  useEffect(() => {
    if (!selectedRestaurantId) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<Order[]>(
          `/api/orders/restaurant/${selectedRestaurantId}`
        );
        setOrders(response.data);
      } catch (err) {
        setError("Không thể tải danh sách đơn hàng.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [selectedRestaurantId]); // Chạy lại khi ID đổi

  // 3. Hàm cập nhật trạng thái (Logic giữ nguyên)
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

  if (loading && restaurants.length === 0) {
    return <Spin tip="Đang tải dữ liệu..." fullscreen />;
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý Đơn hàng</Title>

      {/* 5. Bộ chọn nhà hàng (Giữ nguyên) */}
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

      {/* 6. Giao diện Kanban Board */}
      <Spin spinning={loading}>
        <Row gutter={16}>
          {/* CỘT 1: CHỜ XÁC NHẬN (PENDING) */}
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <ClockCircleOutlined /> Chờ xác nhận ({pendingOrders.length})
                </Space>
              }
              style={{ backgroundColor: "#fafafa", minHeight: "60vh" }}
            >
              {pendingOrders.length === 0 && (
                <Empty description="Không có đơn hàng mới" />
              )}
              <Space direction="vertical" style={{ width: "100%" }}>
                {pendingOrders.map((order) => (
                  <Card key={order.orderId} hoverable>
                    <Title level={5}>Đơn hàng #{order.orderId}</Title>
                    {/* (Chi tiết món ăn) */}
                    <List
                      dataSource={order.orderItems}
                      renderItem={(item: OrderItem) => (
                        <List.Item style={{ padding: "5px 0" }}>
                          <Text>
                            <strong>{item.quantity}x</strong> {item.name}
                          </Text>
                        </List.Item>
                      )}
                    />
                    <Divider style={{ margin: "12px 0" }} />
                    <p>
                      Tổng tiền:{" "}
                      <Text strong type="danger">
                        {order.totalPrice.toLocaleString("vi-VN")} đ
                      </Text>
                    </p>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() =>
                        handleUpdateStatus(order.orderId, "CONFIRMED")
                      }
                    >
                      Xác nhận
                    </Button>
                  </Card>
                ))}
              </Space>
            </Card>
          </Col>

          {/* CỘT 2: ĐANG CHUẨN BỊ (CONFIRMED) */}
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <CheckOutlined /> Đang chuẩn bị ({confirmedOrders.length})
                </Space>
              }
              style={{ backgroundColor: "#fafafa", minHeight: "60vh" }}
            >
              {confirmedOrders.length === 0 && (
                <Empty description="Không có đơn hàng nào" />
              )}

              <Space direction="vertical" style={{ width: "100%" }}>
                {confirmedOrders.map((order) => (
                  <Card key={order.orderId} hoverable>
                    <Title level={5}>Đơn hàng #{order.orderId}</Title>

                    {/* === SỬA LỖI Ở ĐÂY: THÊM CHI TIẾT MÓN ĂN === */}
                    <List
                      dataSource={order.orderItems}
                      renderItem={(item: OrderItem) => (
                        <List.Item style={{ padding: "5px 0" }}>
                          <Text>
                            <strong>{item.quantity}x</strong> {item.name}
                          </Text>
                        </List.Item>
                      )}
                    />
                    <Divider style={{ margin: "12px 0" }} />
                    {/* ======================================== */}

                    <p>
                      Tổng tiền:{" "}
                      <Text strong type="danger">
                        {order.totalPrice.toLocaleString("vi-VN")} đ
                      </Text>
                    </p>
                    <Button
                      type="primary"
                      style={{ backgroundColor: "#52c41a" }}
                      icon={<ArrowRightOutlined />}
                      onClick={() =>
                        handleUpdateStatus(order.orderId, "READY_FOR_DELIVERY")
                      }
                    >
                      Sẵn sàng Giao
                    </Button>
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
