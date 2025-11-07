import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  Spin,
  Alert,
  Button,
  Space,
  Tag,
  message,
  Popconfirm, // <-- 1. Import Popconfirm
} from "antd";
import type { TableProps } from "antd";
import {
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import api from "../services/api";
import type { Restaurant } from "../types"; // Import interface Restaurant
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const AdminRestaurantPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Hàm gọi API để lấy *tất cả* nhà hàng
  const fetchAllRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Restaurant[]>("/api/restaurants/all");
      setRestaurants(response.data);
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

  // Hàm "Sửa" (chưa làm)
  const handleEdit = (restaurantId: number) => {
    navigate(`/admin/restaurants/edit/${restaurantId}`);
  };

  // Hàm này sẽ gọi API backend để thay đổi status
  const handleStatusChange = async (
    restaurantId: number,
    newStatus: string
  ) => {
    try {
      // 1. Gọi API và LẤY kết quả trả về (response)
      const response = await api.put<Restaurant>(
        `/api/restaurants/${restaurantId}/status`,
        { status: newStatus }
      );

      // 2. Lấy đối tượng Restaurant đã được cập nhật từ backend
      const updatedRestaurant = response.data;

      message.success(`Cập nhật trạng thái nhà hàng thành công!`);

      // 3. Dùng đối tượng mới (đúng kiểu) này để cập nhật state
      setRestaurants((prev) =>
        prev.map((r) =>
          r.restaurantId === restaurantId ? updatedRestaurant : r
        )
      );
    } catch (err) {
      message.error("Lỗi khi cập nhật trạng thái.");
      console.error(err);
    }
  };

  // Định nghĩa các cột cho bảng
  const columns: TableProps<Restaurant>["columns"] = [
    {
      title: "Tên Nhà hàng",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "ID Chủ sở hữu",
      dataIndex: "ownerId",
      key: "ownerId",
    },
    {
      title: "Điện thoại",
      dataIndex: "phone",
      key: "phone",
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
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Open", value: "open" },
        { text: "Closed", value: "closed" },
        { text: "Banned", value: "banned" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Hành động",
      key: "action",
      // 3. SỬA LẠI CỘT NÀY:
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.restaurantId)}
          >
            Sửa
          </Button>

          {/* Hiển thị nút động (Dynamic Button) */}
          {record.status === "open" ? (
            // Nếu đang "open", hiển thị nút "Vô hiệu hóa" (để cấm)
            <Popconfirm
              title="Vô hiệu hóa (cấm) nhà hàng này?"
              onConfirm={() =>
                handleStatusChange(record.restaurantId, "banned")
              }
              okText="Vô hiệu hóa"
              cancelText="Hủy"
            >
              <Button danger icon={<StopOutlined />}>
                Vô hiệu hóa
              </Button>
            </Popconfirm>
          ) : (
            // Nếu đang "closed", "pending", "banned", hiển thị nút "Kích hoạt"
            <Popconfirm
              title="Kích hoạt lại nhà hàng này?"
              description="Trạng thái sẽ chuyển thành 'open'."
              onConfirm={() => handleStatusChange(record.restaurantId, "open")}
              okText="Kích hoạt"
              cancelText="Hủy"
            >
              <Button type="primary" icon={<CheckCircleOutlined />}>
                Kích hoạt lại
              </Button>
            </Popconfirm>
          )}
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

  return (
    <div>
      <Title level={2}>Tất cả Nhà hàng</Title>
      <Table columns={columns} dataSource={restaurants} rowKey="restaurantId" />
    </div>
  );
};

export default AdminRestaurantPage;
