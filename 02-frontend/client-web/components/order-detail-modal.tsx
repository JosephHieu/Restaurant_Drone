"use client";

import React, { useState, useEffect } from "react";
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

export default function OrderDetailModal({
  isOpen,
  onClose,
  orderId,
}: OrderDetailModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 2. TẢI DỮ LIỆU CHI TIẾT KHI MODAL MỞ
  useEffect(() => {
    // Chỉ chạy khi modal mở và có orderId
    if (isOpen && orderId) {
      const fetchOrderDetails = async () => {
        setLoading(true);
        setError("");
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

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
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
                          <Tag color="blue">{order.status}</Tag>
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
                        dataSource={order.orderItems} // <-- Dùng data lồng nhau
                        rowKey="orderItemId"
                        pagination={false}
                      />
                    </Card>
                  </Col>
                </Row>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
