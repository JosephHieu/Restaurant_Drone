import React from "react";
import { Typography, Table } from "antd";

const { Title } = Typography;

// (Đây là dữ liệu mẫu, sau này bạn sẽ gọi API từ OrderService)
const sampleData = [
  {
    orderId: "ORD-123",
    customerName: "Nguyễn Văn A",
    restaurantName: "Phở Thìn",
    totalPrice: 150000,
    status: "COMPLETED",
  },
  {
    orderId: "ORD-124",
    customerName: "Trần Thị B",
    restaurantName: "Trà sữa Tocotoco",
    totalPrice: 85000,
    status: "DELIVERING",
  },
];

// (Đây là cột mẫu)
const columns = [
  { title: "Mã Đơn", dataIndex: "orderId", key: "orderId" },
  { title: "Khách hàng", dataIndex: "customerName", key: "customerName" },
  { title: "Nhà hàng", dataIndex: "restaurantName", key: "restaurantName" },
  { title: "Tổng tiền", dataIndex: "totalPrice", key: "totalPrice" },
  { title: "Trạng thái", dataIndex: "status", key: "status" },
];

const OrderManagementPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Quản lý Tất cả Đơn hàng</Title>
      <Table dataSource={sampleData} columns={columns} rowKey="orderId" />
    </div>
  );
};

export default OrderManagementPage;
