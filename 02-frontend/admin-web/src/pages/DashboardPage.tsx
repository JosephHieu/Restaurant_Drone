import React from "react";
import { Typography } from "antd";

const DashboardPage: React.FC = () => {
  return (
    <div>
      <Typography.Title level={2}>Tổng quan Dashboard</Typography.Title>
      <p>Đây là nơi hiển thị các biểu đồ và thống kê nhanh.</p>
    </div>
  );
};

export default DashboardPage;
