import React from "react";
import { Typography, Table } from "antd";

const { Title } = Typography;

// (Sau này bạn sẽ gọi API GET /api/orders/all (của Admin) để lấy data)
const sampleData = [
  {
    orderId: 1001,
    customerName: "Khách Hàng An",
    restaurantName: "Phở Hùng",
    status: "COMPLETED",
  },
  {
    orderId: 1002,
    customerName: "Nguyễn Văn A",
    restaurantName: "Cơm Tấm Cali",
    status: "DELIVERING",
  },
];

const columns = [
  { title: "Mã Đơn hàng", dataIndex: "orderId", key: "orderId" },
  { title: "Tên Khách hàng", dataIndex: "customerName", key: "customerName" },
  { title: "Nhà hàng", dataIndex: "restaurantName", key: "restaurantName" },
  { title: "Trạng thái", dataIndex: "status", key: "status" },
];

const AdminOrderPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Quản lý Tất cả Đơn hàng (Admin)</Title>
      <Table dataSource={sampleData} columns={columns} rowKey="orderId" />
    </div>
  );
};

export default AdminOrderPage;
