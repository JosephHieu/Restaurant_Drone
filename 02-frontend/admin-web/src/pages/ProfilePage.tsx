import React, { useEffect, useState } from "react";
import { Typography, Table, Spin, Alert, Button, Space, Tag } from "antd";
import type { TableProps } from "antd";
import { EditOutlined } from "@ant-design/icons";
import api from "../services/api";
import type { Restaurant } from "../types"; // Import interface Restaurant
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const ProfilePage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Hàm gọi API để lấy *tất cả* nhà hàng của Owner
  const fetchMyRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      // Gọi API /my/all mới
      const response = await api.get<Restaurant[]>("/api/restaurants/my/all");
      setRestaurants(response.data);

      // UX Tối ưu: Nếu chỉ có 1 nhà hàng, chuyển thẳng đến trang sửa
      if (response.data.length === 1) {
        navigate(`/profile/edit/${response.data[0].restaurantId}`);
        return; // Dừng lại không render bảng
      }
    } catch (err) {
      setError("Không thể tải danh sách nhà hàng.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurants();
  }, []);

  // Hàm chuyển hướng đến trang Sửa
  const handleEdit = (restaurantId: number) => {
    navigate(`/profile/edit/${restaurantId}`);
  };

  // Định nghĩa các cột cho bảng
  const columns: TableProps<Restaurant>["columns"] = [
    {
      title: "ID",
      dataIndex: "restaurantId",
      key: "restaurantId",
    },
    {
      title: "Tên Nhà hàng",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "geekblue";
        if (status === "open") color = "success";
        if (status === "pending") color = "warning";
        if (status === "closed") color = "default";
        if (status === "banned") color = "error";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.restaurantId)}
          >
            Sửa thông tin
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <Spin tip="Đang tải danh sách nhà hàng..." fullscreen />;
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  // Nếu có > 1 nhà hàng, hiển thị danh sách
  if (restaurants.length > 1) {
    return (
      <div>
        <Title level={2}>Danh sách Nhà hàng của tôi</Title>
        <p>Vui lòng chọn nhà hàng bạn muốn cập nhật thông tin:</p>
        <Table
          columns={columns}
          dataSource={restaurants}
          rowKey="restaurantId"
        />
      </div>
    );
  }

  // Trường hợp còn lại (0 nhà hàng)
  return (
    <Alert
      message="Chưa có nhà hàng"
      description="Bạn chưa đăng ký nhà hàng nào. Vui lòng liên hệ Admin để được hỗ trợ đăng ký."
      type="info"
      showIcon
    />
  );
};

export default ProfilePage;
