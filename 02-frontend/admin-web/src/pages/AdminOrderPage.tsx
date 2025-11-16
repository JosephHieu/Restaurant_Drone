import React, { useEffect, useState, useRef } from "react";
import {
  Typography,
  Table,
  Spin,
  Alert,
  Tag,
  Modal,
  Descriptions,
  List,
  Button,
} from "antd";
import type { TableProps } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import api from "../services/api";
import type { Order, OrderItem } from "../types"; // Import interface Order và OrderItem

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const { Title, Text } = Typography;

interface GpsData {
  orderId: number;
  lat: number;
  lng: number;
  status: string;
}

// Hàm tiện ích lấy màu Tag (để dùng chung)
const getStatusTagColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "warning";
    case "CONFIRMED":
      return "processing";
    case "READY_FOR_DELIVERY":
      return "cyan";
    case "DELIVERING":
      return "blue";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
};

const AdminOrderPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho Modal xem chi tiết
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // BỔ SUNG: State và Ref cho WebSocket
  const [realtimeLocations, setRealtimeLocations] = useState<
    Map<number, GpsData>
  >(new Map());
  const stompClientRef = useRef<Client | null>(null);

  // Hàm gọi API
  const fetchAllOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Order[]>("/api/orders/all");
      setOrders(response.data);
    } catch (err) {
      setError("Không thể tải danh sách đơn hàng.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tải dữ liệu khi component mount
  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    // 1. Tạo kết nối
    const client = new Client({
      // Trỏ đến API Gateway (port 8080) và endpoint /ws
      // (Endpoint /ws này được định nghĩa trong WebSocketConfig.java VÀ ApiGateway)
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      debug: (str) => {
        console.log("[STOMP]", str);
      },
      reconnectDelay: 5000,
    }); // 2. Khi kết nối thành công

    client.onConnect = (frame) => {
      console.log("Admin WS Connected:", frame); // Lắng nghe topic CHUNG của Admin
      client.subscribe("/topic/admin/locations", (message) => {
        const gpsData: GpsData = JSON.parse(message.body); // Cập nhật Map (bản đồ) trạng thái

        setRealtimeLocations((prevMap) => {
          const newMap = new Map(prevMap);
          newMap.set(gpsData.orderId, gpsData);
          return newMap;
        });
      });
    };

    client.onStompError = (frame) => {
      console.error("Admin WS Error:", frame);
    }; // 3. Kích hoạt

    client.activate();
    stompClientRef.current = client; // 4. Hàm cleanup (Chạy khi rời khỏi trang)

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        console.log("Admin WS Disconnected");
      }
    };
  }, []);

  // Hàm mở Modal
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Hàm đóng Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Định nghĩa các cột cho bảng
  const columns: TableProps<Order>["columns"] = [
    {
      title: "Mã Đơn",
      dataIndex: "orderId",
      key: "orderId",
      sorter: (a, b) => a.orderId - b.orderId,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString("vi-VN"),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "ID Khách hàng",
      dataIndex: "customerId",
      key: "customerId",
    },
    {
      title: "ID Nhà hàng",
      dataIndex: "restaurantId",
      key: "restaurantId",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => price.toLocaleString("vi-VN") + " đ",
      sorter: (a, b) => a.totalPrice - b.totalPrice,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusTagColor(status)}>{status.toUpperCase()}</Tag>
      ),
      filters: [
        { text: "Pending", value: "PENDING" },
        { text: "Confirmed", value: "CONFIRMED" },
        { text: "Delivering", value: "DELIVERING" },
        { text: "Completed", value: "COMPLETED" },
        { text: "Cancelled", value: "CANCELLED" },
      ],
      onFilter: (value, record) => record.status === value,
    },

    {
      title: "Tọa độ Real-time",
      key: "realtimeLocation",
      render: (_, record) => {
        // Chỉ hiển thị nếu đơn hàng đang "DELIVERING"
        if (record.status !== "DELIVERING") {
          return <Text type="secondary">N/A</Text>;
        } // Lấy vị trí từ state (Map)

        const location = realtimeLocations.get(record.orderId);

        if (location) {
          return (
            <Tag color="blue">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </Tag>
          );
        }
        return <Text type="secondary">Chờ tín hiệu...</Text>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          Xem
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Spin tip="Đang tải danh sách đơn hàng..." size="large" />;
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  return (
    <>
      <Title level={2}>Quản lý Tất cả Đơn hàng (Admin)</Title>
      <Table
        columns={columns}
        dataSource={Array.isArray(orders) ? orders : []}
        rowKey="orderId"
      />

      {/* Modal xem chi tiết */}
      <Modal
        title={`Chi tiết Đơn hàng #${selectedOrder?.orderId}`}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedOrder && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID Khách hàng">
              {selectedOrder.customerId}
            </Descriptions.Item>
            <Descriptions.Item label="ID Nhà hàng">
              {selectedOrder.restaurantId}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao">
              {selectedOrder.deliveryAddress}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusTagColor(selectedOrder.status)}>
                {selectedOrder.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              <Text strong type="danger">
                {selectedOrder.totalPrice.toLocaleString("vi-VN")} đ
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Chi tiết món ăn">
              <List
                dataSource={selectedOrder.orderItems}
                size="small"
                renderItem={(item: OrderItem) => (
                  <List.Item>
                    <Text>
                      <strong>{item.quantity}x</strong> {item.name} (
                      {item.price.toLocaleString("vi-VN")} đ)
                    </Text>
                  </List.Item>
                )}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default AdminOrderPage;
