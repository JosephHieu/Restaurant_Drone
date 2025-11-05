import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  Spin,
  Alert,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
} from "antd";
import type { TableProps } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../services/api";
import type { User } from "../types"; // Import interface User
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Hàm gọi API để lấy danh sách user
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // **LƯU Ý:** Chúng ta cần tạo API này ở backend
      const response = await api.get<User[]>("/api/users");
      setUsers(response.data);
    } catch (err) {
      setError("Không thể tải danh sách người dùng.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Tự động gọi API khi component được tải
  useEffect(() => {
    fetchUsers();
  }, []);

  // Xử lý Xóa
  const handleDelete = async (userId: number) => {
    try {
      await api.delete(`/api/users/${userId}`);
      message.success("Xóa người dùng thành công!");
      // Tải lại danh sách (bằng cách lọc thủ công, nhanh hơn gọi API)
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.userId !== userId)
      );
    } catch (err) {
      setError("Lỗi khi xóa người dùng.");
      console.log(err);
    }
  };

  // 4. HÀM MỚI ĐỂ SỬA
  const handleEdit = (userId: number) => {
    navigate(`/users/edit/${userId}`); // Chuyển đến trang Sửa
  };

  // Định nghĩa các cột cho bảng
  const columns: TableProps<User>["columns"] = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        let color = "geekblue";
        if (role.name === "ADMIN") color = "volcano";
        if (role.name === "RESTAURANT_OWNER") color = "green";
        return <Tag color={color}>{role.name}</Tag>;
      },
      filters: [
        { text: "ADMIN", value: "ADMIN" },
        { text: "USER", value: "USER" },
        { text: "RESTAURANT_OWNER", value: "RESTAURANT_OWNER" },
      ],
      onFilter: (value, record) => record.role.name === value,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {/* 5. KÍCH HOẠT NÚT SỬA */}
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.userId)} // <-- GỌI HÀM SỬA
          >
            Sửa
          </Button>

          {/* 6. KÍCH HOẠT NÚT XÓA */}
          <Popconfirm
            title="Xóa người dùng?"
            description="Bạn có chắc muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.userId)} // <-- GỌI HÀM XÓA
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <Spin tip="Đang tải..." fullscreen />;
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <Title level={2}>Danh sách Người dùng</Title>
      <Table columns={columns} dataSource={users} rowKey="userId" />
    </div>
  );
};

export default UserManagementPage;
