"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import {
  Spin,
  Alert,
  Typography,
  Card,
  Descriptions,
  Table,
  Tag,
  Modal,
  Row,
  Col,
  Button,
} from "antd"; // <-- Dùng AntD
import type { TableProps } from "antd";
import { X } from "lucide-react"; // Icon của v0

// BỔ SUNG: Import thư viện WebSocket
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const { Title, Text } = Typography;

// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (ĐẦY ĐỦ)
interface OrderItem {
  orderItemId: number;
  itemId: number;
  name: string; // Tên snapshot
  price: number; // Giá snapshot
  quantity: number;
}
interface Order {
  orderId: number;
  restaurantId: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  deliveryAddress: string;
  paymentMethod: string;
  orderItems: OrderItem[]; // <-- Phải có trường này
}

// Cột cho bảng (bên trong chi tiết)
const itemColumns: TableProps<OrderItem>["columns"] = [
  {
    title: "Tên món ăn (Snapshot)",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Số lượng",
    dataIndex: "quantity",
    key: "quantity",
  },
  {
    title: "Đơn giá (Snapshot)",
    dataIndex: "price",
    key: "price",
    render: (price: number) => price.toLocaleString("vi-VN") + " đ",
  },
];

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null; // <-- Nhận ID của đơn hàng cần xem
}

// BỔ SUNG: Hàm tiện ích lấy màu Tag
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

export default function OrderDetailModal({
  isOpen,
  onClose,
  orderId,
}: OrderDetailModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // BỔ SUNG: State và Ref cho WebSocket
  const [dronePosition, setDronePosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [wsStatus, setWsStatus] = useState("Ngắt kết nối");
  const stompClientRef = useRef<Client | null>(null);

  // 2. TẢI DỮ LIỆU CHI TIẾT KHI MODAL MỞ
  useEffect(() => {
    // Chỉ chạy khi modal mở và có orderId
    if (isOpen && orderId) {
      const fetchOrderDetails = async () => {
        setLoading(true);
        setError("");
        setDronePosition(null); // Reset vị trí drone
        setWsStatus("Ngắt kết nối"); // Reset trạng thái WS
        try {
          // Gọi API GET /api/orders/{id} (Backend đã tạo)
          const response = await api.get<Order>(`/api/orders/${orderId}`);
          setOrder(response.data);
        } catch (err) {
          setError("Không thể tải chi tiết đơn hàng.");
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetails();
    }
  }, [isOpen, orderId]); // Chạy lại khi orderId thay đổi

  useEffect(() => {
    // Chỉ kết nối nếu:
    // 1. Modal đang mở (isOpen)
    // 2. Đã tải xong dữ liệu (order)
    // 3. Trạng thái là "DELIVERING" (Đang giao)
    if (isOpen && order && order.status === "DELIVERING") {
      setWsStatus("Đang kết nối..."); // Tạo STOMP client
      const client = new Client({
        // Trỏ đến API Gateway (port 8080) và endpoint /ws
        // (Endpoint /ws này được định nghĩa trong WebSocketConfig.java)
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        debug: (str) => {
          console.log("[STOMP]", str); // Bật log debug
        },
        reconnectDelay: 5000, // Tự động kết nối lại sau 5s
      }); // Khi kết nối thành công

      client.onConnect = (frame) => {
        setWsStatus("Đã kết nối"); // Lắng nghe topic (chủ đề) của đơn hàng này
        client.subscribe(
          `/topic/order-location/${order.orderId}`,
          (message) => {
            const gpsData = JSON.parse(message.body); // Cập nhật state với tọa độ mới
            setDronePosition({ lat: gpsData.lat, lng: gpsData.lng });
          }
        );
      }; // Xử lý lỗi

      client.onStompError = (frame) => {
        console.error("Lỗi STOMP:", frame);
        setWsStatus("Lỗi kết nối");
      }; // Bắt đầu kết nối

      client.activate(); // Lưu client vào ref để có thể ngắt kết nối
      stompClientRef.current = client; // Hàm cleanup: Sẽ chạy khi modal bị đóng (hoặc 'order' thay đổi)

      return () => {
        if (stompClientRef.current) {
          stompClientRef.current.deactivate();
          console.log("Đã ngắt kết nối WebSocket.");
        }
        setWsStatus("Ngắt kết nối");
      };
    }
  }, [isOpen, order]); // Chạy lại khi 'order' được tải (hoặc modal mở/đóng)

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header (Giữ nguyên) */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Chi tiết Đơn hàng #{orderId}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X size={24} />
            </button>
          </div>
          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {loading ? (
              <Spin tip="Đang tải chi tiết..." />
            ) : error ? (
              <Alert message="Lỗi" description={error} type="error" showIcon />
            ) : (
              order && (
                <>
                  {/* BỔ SUNG: Card hiển thị Trạng thái Drone */}
                  {(order.status === "DELIVERING" ||
                    order.status === "COMPLETED") && (
                    <Card
                      title="🛰️ Theo dõi Drone (Thời gian thực)"
                      className="mb-4"
                    >
                      <Descriptions column={1}>
                        <Descriptions.Item label="Trạng thái WebSocket">
                          <Tag
                            color={
                              wsStatus === "Đã kết nối" ? "success" : "default"
                            }
                          >
                            {wsStatus}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>
                      {/* Đây là nơi bạn sẽ đặt component bản đồ */}
                      {dronePosition ? (
                        <Alert
                          message="Đã nhận được vị trí drone:"
                          description={`Vĩ độ (Lat): ${dronePosition.lat.toFixed(
                            6
                          )}, Kinh độ (Lng): ${dronePosition.lng.toFixed(6)}`}
                          type="success"
                          showIcon
                          className="mt-2"
                        />
                      ) : (
                        <Alert
                          message={
                            order.status === "COMPLETED"
                              ? "Chuyến giao đã hoàn thành."
                              : "Đang chờ tín hiệu drone..."
                          }
                          type={
                            order.status === "COMPLETED" ? "success" : "info"
                          }
                          showIcon
                          className="mt-2"
                        />
                      )}{" "}
                    </Card>
                  )}
                  {/* Code Row/Col hiển thị thông tin cũ (Giữ nguyên) */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Card title="Thông tin Giao hàng">
                        <Descriptions column={1} bordered>
                          <Descriptions.Item label="Địa chỉ">
                            {order.deliveryAddress}
                          </Descriptions.Item>
                          <Descriptions.Item label="Ngày đặt">
                            {new Date(order.createdAt).toLocaleString("vi-VN")} 
                          </Descriptions.Item>
                          <Descriptions.Item label="Trạng thái">
                            {/* SỬA: Dùng hàm getStatusTagColor */}
                            <Tag color={getStatusTagColor(order.status)}>
                              {order.status}
                            </Tag>
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card title="Thông tin Thanh toán">
                        <Descriptions column={1} bordered>
                          <Descriptions.Item label="Phương thức">
                            <Tag
                              color={
                                order.paymentMethod === "COD" ? "gray" : "green"
                              }
                            >
                              {order.paymentMethod}
                            </Tag>
                          </Descriptions.Item>
                          <Descriptions.Item label="Tổng cộng">
                            <Text
                              strong
                              style={{ color: "#d4380d", fontSize: "1.2em" }}
                            >
                              {order.totalPrice.toLocaleString("vi-VN")} đ
                            </Text>
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>

                    <Col span={24}>
                      <Card title="Các món đã đặt">
                        <Table
                          columns={itemColumns}
                          dataSource={order.orderItems}
                          rowKey="orderItemId"
                          pagination={false}
                        />
                      </Card>
                    </Col>
                  </Row>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
