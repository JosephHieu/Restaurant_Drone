"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import { Spin, Alert, Typography, Table, Tag, Modal, Button } from "antd"; // <-- Sửa: Thêm Button
import type { TableProps } from "antd"; // <-- Sửa: Xóa 'Image'
import { EyeOutlined } from "@ant-design/icons"; // <-- Sửa: Thêm Icon
import { X } from "lucide-react";

const { Title } = Typography;

// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (Tạm thời)
interface Order {
  orderId: number;
  restaurantId: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: (orderId: number) => void;
}

// 2. ĐỊNH NGHĨA CỘT CHO BẢNG
// (Khối này đã được DI CHUYỂN VÀO BÊN TRONG component)

export default function MyOrdersModal({
  isOpen,
  onClose,
  onViewDetails,
}: MyOrdersModalProps) {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // === 3. DI CHUYỂN KHỐI "COLUMNS" VÀO ĐÂY ===
  // (Nó phải ở bên trong component để thấy 'onViewDetails')
  const columns: TableProps<Order>["columns"] = [
    { title: "Mã Đơn", dataIndex: "orderId", key: "orderId" },
    {
      title: "Ngày Đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "geekblue"; // PENDING
        if (status === "COMPLETED") color = "success";
        if (status === "CANCELLED") color = "error";
        if (status === "DELIVERING") color = "processing";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Tổng cộng",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => price.toLocaleString("vi-VN") + " đ",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record: Order) => (
        // Bây giờ 'onViewDetails' đã được tìm thấy
        <Button
          icon={<EyeOutlined />}
          onClick={() => onViewDetails(record.orderId)} // <-- GỌI HÀM
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];
  // ===========================================

  // 3. TẢI DỮ LIỆU ĐƠN HÀNG KHI MODAL MỞ
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      const fetchOrders = async () => {
        setLoading(true);
        setError("");
        try {
          const response = await api.get<Order[]>("/api/orders/my-history");
          setOrders(response.data);
        } catch (err) {
          setError("Không thể tải lịch sử đơn hàng.");
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [isOpen, isAuthenticated]); // Chạy lại khi modal được mở

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Đơn hàng của tôi
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
              <Spin tip="Đang tải lịch sử..." />
            ) : error ? (
              <Alert message="Lỗi" description={error} type="error" showIcon />
            ) : (
              <Table
                columns={columns}
                dataSource={orders}
                rowKey="orderId"
                pagination={false}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
