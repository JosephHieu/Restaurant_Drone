"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  message,
  notification,
} from "antd"; // <-- Dùng AntD
import type { TableProps } from "antd";
import { X } from "lucide-react"; // Icon của v0
import dynamic from "next/dynamic";

// BỔ SUNG: Import thư viện WebSocket
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Dynamic import DroneTrackingMap để tránh lỗi SSR
const DroneTrackingMap = dynamic(
  () => import("@/components/drone-tracking-map"),
  { ssr: false, loading: () => <div className="h-72 bg-gray-100 rounded-xl flex items-center justify-center">🗺️ Đang tải bản đồ...</div> }
);

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
  // Thêm tọa độ giao hàng
  deliveryLat?: number;
  deliveryLng?: number;
}

// Interface cho Restaurant (để lấy tọa độ)
interface Restaurant {
  restaurantId: number;
  name: string;
  latitude: number;
  longitude: number;
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
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State cho drone tracking giả lập
  const [droneArrived, setDroneArrived] = useState(false); // Drone đã đến nơi
  const [confirmingDelivery, setConfirmingDelivery] = useState(false); // Đang xác nhận

  // BỔ SUNG: State và Ref cho WebSocket
  const [dronePosition, setDronePosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [wsStatus, setWsStatus] = useState("Ngắt kết nối");
  const stompClientRef = useRef<Client | null>(null);

  // Ref để track status hiện tại (tránh closure stale)
  const orderStatusRef = useRef<string | null>(null);
  const droneArrivedRef = useRef(false);
  
  // Sync refs với state
  useEffect(() => {
    orderStatusRef.current = order?.status || null;
  }, [order?.status]);
  
  useEffect(() => {
    droneArrivedRef.current = droneArrived;
  }, [droneArrived]);

  // 2. TẢI DỮ LIỆU CHI TIẾT KHI MODAL MỞ + Auto polling
  useEffect(() => {
    // Chỉ chạy khi modal mở và có orderId
    if (isOpen && orderId) {
      const fetchOrderDetails = async (isInitial = false) => {
        if (isInitial) {
          setLoading(true);
          setError("");
          setDronePosition(null); // Reset vị trí drone
          setWsStatus("Ngắt kết nối"); // Reset trạng thái WS
          setDroneArrived(false); // Reset drone arrived
          setConfirmingDelivery(false);
          setRestaurant(null);
        }
        try {
          // Gọi API GET /api/orders/{id} (Backend đã tạo)
          const response = await api.get<Order>(`/api/orders/${orderId}`);
          setOrder(response.data);
          
          // Lấy thông tin nhà hàng để có tọa độ
          if (isInitial || !restaurant) {
            try {
              const restaurantRes = await api.get<Restaurant>(`/api/restaurants/${response.data.restaurantId}`);
              setRestaurant(restaurantRes.data);
            } catch (err) {
              console.log("Không thể lấy thông tin nhà hàng");
            }
          }
        } catch (err) {
          if (isInitial) {
            setError("Không thể tải chi tiết đơn hàng.");
          }
        } finally {
          if (isInitial) {
            setLoading(false);
          }
        }
      };
      
      // Lần đầu load
      fetchOrderDetails(true);
      
      // Polling mỗi 5 giây - NHƯNG không poll khi đang DELIVERING và drone chưa đến
      const interval = setInterval(() => {
        // Dùng ref để check, tránh stale closure
        if (orderStatusRef.current === "DELIVERING" && !droneArrivedRef.current) {
          console.log("⏸️ Tạm dừng polling - đang animation drone");
          return;
        }
        fetchOrderDetails(false);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, orderId]); // Chỉ phụ thuộc vào isOpen và orderId

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

  // Xử lý khi drone đến nơi (sau 5 giây simulation) - dùng useCallback để stable reference
  const handleDroneArrived = useCallback(() => {
    console.log("🚁 Drone đã đến nơi - hiển thị nút xác nhận");
    setDroneArrived(true);
    // Hiển thị thông báo
    notification.success({
      message: "🚁 Drone đã đến nơi!",
      description: "Vui lòng nhận hàng và xác nhận để hoàn thành đơn hàng.",
      duration: 0, // Không tự đóng
      placement: "topRight",
    });
  }, []);

  // Xử lý xác nhận nhận hàng - dùng useCallback để stable reference
  const handleConfirmDelivery = useCallback(async () => {
    if (!orderId) return;
    
    setConfirmingDelivery(true);
    try {
      // Gọi API xác nhận đã nhận hàng (DELIVERING -> COMPLETED)
      await api.put(`/api/orders/${orderId}/confirm-delivery`);
      
      message.success("✅ Đã xác nhận nhận hàng thành công!");
      
      // Cập nhật state local
      setOrder(prev => prev ? { ...prev, status: "COMPLETED" } : null);
      setDroneArrived(false);
      
      notification.destroy(); // Đóng thông báo
    } catch (err) {
      message.error("Không thể xác nhận nhận hàng. Vui lòng thử lại!");
    } finally {
      setConfirmingDelivery(false);
    }
  }, [orderId]);

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
              <div className="flex justify-center items-center py-8">
                <Spin size="large" />
                <span className="ml-3 text-gray-500">Đang tải chi tiết...</span>
              </div>
            ) : error ? (
              <Alert message="Lỗi" description={error} type="error" showIcon />
            ) : (
              order && (
                <>
                  {/* BỔ SUNG: Card theo dõi Drone - CHỈ hiện khi DELIVERING hoặc COMPLETED */}
                  {(order.status === "DELIVERING" || order.status === "COMPLETED") && (
                    <Card
                      title="🚁 Theo dõi Drone giao hàng"
                      className="mb-4"
                      extra={
                        order.status === "COMPLETED" ? (
                          <Tag color="success">✅ Đã giao xong</Tag>
                        ) : droneArrived ? (
                          <Tag color="green">📍 Drone đã đến nơi</Tag>
                        ) : (
                          <Tag color="blue">🚁 Đang giao hàng</Tag>
                        )
                      }
                    >
                      {/* Kiểm tra có đủ tọa độ không */}
                      {restaurant && order.deliveryLat && order.deliveryLng ? (
                        <>
                          {/* Nếu đang DELIVERING thì hiện map với animation */}
                          {order.status === "DELIVERING" && (
                            <>
                              <DroneTrackingMap
                                key={`drone-${order.orderId}`}
                                restaurantLocation={{
                                  lat: restaurant.latitude,
                                  lng: restaurant.longitude,
                                }}
                                customerLocation={{
                                  lat: order.deliveryLat,
                                  lng: order.deliveryLng,
                                }}
                                isDelivering={true}
                                onDeliveryComplete={handleDroneArrived}
                                animationDuration={5000} // 5 giây
                                orderId={order.orderId}
                              />
                              
                              {/* Hiển thị thông báo và nút xác nhận khi drone đến */}
                              {droneArrived && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                                  <div className="text-4xl mb-2">🎉</div>
                                  <h3 className="text-lg font-bold text-green-700 mb-2">
                                    Drone đã đến nơi giao hàng!
                                  </h3>
                                  <p className="text-gray-600 mb-4">
                                    Vui lòng nhận hàng từ drone và nhấn xác nhận bên dưới
                                  </p>
                                  <Button
                                    type="primary"
                                    size="large"
                                    loading={confirmingDelivery}
                                    onClick={handleConfirmDelivery}
                                    className="bg-green-600 hover:bg-green-700"
                                    style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                                  >
                                    ✅ Xác nhận đã nhận hàng
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Hiển thị khi đã hoàn thành */}
                          {order.status === "COMPLETED" && (
                            <>
                              <DroneTrackingMap
                                key={`drone-completed-${order.orderId}`}
                                restaurantLocation={{
                                  lat: restaurant.latitude,
                                  lng: restaurant.longitude,
                                }}
                                customerLocation={{
                                  lat: order.deliveryLat,
                                  lng: order.deliveryLng,
                                }}
                                isDelivering={false}
                                animationDuration={5000}
                                orderId={order.orderId}
                              />
                              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                                <div className="text-4xl mb-2">✅</div>
                                <h3 className="text-lg font-bold text-blue-700">
                                  Đơn hàng đã hoàn thành!
                                </h3>
                                <p className="text-gray-600">
                                  Cảm ơn bạn đã sử dụng dịch vụ giao hàng bằng Drone 🚁
                                </p>
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <Alert
                          message="Không có thông tin tọa độ"
                          description={`Đơn hàng này chưa có đầy đủ thông tin tọa độ để hiển thị bản đồ. (Restaurant: ${restaurant ? 'OK' : 'NULL'}, Lat: ${order.deliveryLat}, Lng: ${order.deliveryLng})`}
                          type="warning"
                          showIcon
                        />
                      )}
                    </Card>
                  )}

                  {/* Thông báo trạng thái cho các đơn chưa giao */}
                  {order.status !== "DELIVERING" && order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                    <Card className="mb-4">
                      <div className="text-center py-4">
                        <div className="text-4xl mb-3">
                          {order.status === "PENDING" && "⏳"}
                          {order.status === "CONFIRMED" && "✅"}
                          {order.status === "READY_FOR_DELIVERY" && "📦"}
                        </div>
                        <p className="text-gray-600 text-lg">
                          {order.status === "PENDING" && "Đơn hàng đang chờ nhà hàng xác nhận..."}
                          {order.status === "CONFIRMED" && "Nhà hàng đã xác nhận, đang chuẩn bị món..."}
                          {order.status === "READY_FOR_DELIVERY" && "Đơn hàng đã sẵn sàng, đang chờ drone đến lấy..."}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          🚁 Bản đồ theo dõi drone sẽ hiện khi nhà hàng bắt đầu giao hàng
                        </p>
                      </div>
                    </Card>
                  )}

                  {/* Thông báo cho đơn hàng đã hủy */}
                  {order.status === "CANCELLED" && (
                    <Card className="mb-4">
                      <div className="text-center py-4">
                        <div className="text-4xl mb-3">❌</div>
                        <p className="text-red-500 text-lg font-semibold">
                          Đơn hàng đã bị hủy
                        </p>
                      </div>
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
