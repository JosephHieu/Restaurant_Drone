import React, { useEffect, useState, useMemo } from "react";
import {
  Typography,
  Table,
  Spin,
  Alert,
  Button,
  Space,
  Popconfirm,
  message,
} from "antd";
import type { TableProps } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import api from "../services/api";
import type { Restaurant } from "../types"; // Import interface Restaurant

const { Title } = Typography;

const AdminRestaurantPendingPage: React.FC = () => {
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm gọi API để lấy *tất cả* nhà hàng
  const fetchAllRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Restaurant[]>("/api/restaurants/all");
      setAllRestaurants(response.data);
    } catch (err) {
      setError("Không thể tải danh sách nhà hàng.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRestaurants();
  }, []);

  // --- HÀM XỬ LÝ HÀNH ĐỘNG ---
  // (LƯU Ý: Bạn cần tạo API cho 2 hàm này ở backend)

  const handleApprove = async (restaurantId: number) => {
    try {
      // 1. Gọi API PUT mới mà bạn vừa tạo
      const response = await api.put<Restaurant>(
        `/api/restaurants/${restaurantId}/approve`
      );

      message.success(`Duyệt nhà hàng "${response.data.name}" thành công!`);

      // 2. Cập nhật trạng thái trong danh sách (xóa khỏi ds "pending")
      setAllRestaurants((prev) =>
        prev.filter((r) => r.restaurantId !== restaurantId)
      );
    } catch (err) {
      message.error("Lỗi khi duyệt nhà hàng.");
      console.error(err);
    }
  };

  const handleReject = async (restaurantId: number) => {
    try {
      // TẠM THỜI: Cập nhật trạng thái local
      // (Sau này bạn sẽ gọi: await api.delete(`/api/admin/restaurants/${restaurantId}`);)
      message.success("Từ chối nhà hàng thành công!");
      setAllRestaurants((prev) =>
        prev.filter((r) => r.restaurantId !== restaurantId)
      );
    } catch (err) {
      message.error("Lỗi khi từ chối nhà hàng.");
      console.error(err);
    }
  };

  // Định nghĩa các cột cho bảng
  const columns: TableProps<Restaurant>["columns"] = [
    { title: "Tên Nhà hàng", dataIndex: "name", key: "name" },
    { title: "ID Chủ sở hữu", dataIndex: "ownerId", key: "ownerId" },
    { title: "Điện thoại", dataIndex: "phone", key: "phone" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="Duyệt nhà hàng này?"
            onConfirm={() => handleApprove(record.restaurantId)}
          >
            <Button type="primary" icon={<CheckCircleOutlined />}>
              Chấp thuận
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Từ chối nhà hàng này?"
            onConfirm={() => handleReject(record.restaurantId)}
          >
            <Button danger icon={<CloseCircleOutlined />}>
              Từ chối
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Lọc danh sách nhà hàng CHỜ DUYỆT
  const pendingRestaurants = useMemo(() => {
    return allRestaurants.filter((r) => r.status === "pending");
  }, [allRestaurants]);

  if (loading) {
    return <Spin tip="Đang tải danh sách chờ duyệt..." fullscreen />;
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <Title level={2}>
        Phê duyệt Nhà hàng mới ({pendingRestaurants.length})
      </Title>
      <Table
        columns={columns}
        dataSource={pendingRestaurants}
        rowKey="restaurantId"
      />
    </div>
  );
};

export default AdminRestaurantPendingPage;
