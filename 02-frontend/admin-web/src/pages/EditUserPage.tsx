import React, { useState, useEffect } from "react";
import {
  Typography,
  Form,
  Input,
  Button,
  Select,
  Card,
  Row,
  Col,
  Alert,
  message,
  Spin,
} from "antd";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import type { User } from "../types";
import { AxiosError } from "axios";

const { Title } = Typography;
const { Option } = Select;

// Kiểu dữ liệu cho Form (không có mật khẩu)
interface EditUserFormData {
  fullName: string;
  email: string;
  phone: string;
  roleId: number;
  status: string;
}

// Kiểu dữ liệu cho lỗi trả về
interface ErrorResponse {
  message: string;
}

const EditUserPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // Loading cho việc tải data
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>(); // Lấy userId từ URL

  // 1. Tải dữ liệu user khi trang được mở
  useEffect(() => {
    if (!userId) {
      setError("Không tìm thấy ID người dùng.");
      setPageLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get<User>(`/api/users/${userId}`);
        const user = response.data;

        // 2. Đổ dữ liệu vào Form
        form.setFieldsValue({
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          roleId: user.role.roleId, // Lưu ý: Cần roleId, không phải role.name
          status: user.status,
        });
      } catch (err) {
        setError("Không thể tải dữ liệu người dùng.");
        console.log(err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchUser();
  }, [userId, form]);

  // 3. Xử lý khi nhấn nút "Cập nhật"
  const onFinish = async (values: EditUserFormData) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/api/users/${userId}`, values); // Gọi API PUT
      message.success("Cập nhật người dùng thành công!");
      navigate("/users/list"); // Quay về trang danh sách
    } catch (err) {
      setLoading(false);
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data as ErrorResponse;
        setError(errorData.message || "Email hoặc SĐT đã tồn tại.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi khi cập nhật.");
      }
    }
  };

  if (pageLoading) {
    return <Spin tip="Đang tải dữ liệu..." fullscreen />;
  }

  return (
    <Row justify="center">
      <Col xs={24} sm={20} md={16} lg={12}>
        <Card>
          <Title level={2}>Cập nhật Người dùng</Title>
          <Form
            form={form} // <-- Gán form vào
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="fullName"
              label="Họ và Tên"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Email không hợp lệ!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true, message: "Vui lòng nhập SĐT!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="roleId"
              label="Vai trò"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <Select placeholder="Chọn một vai trò">
                <Option value={1}>ADMIN</Option>
                <Option value={2}>RESTAURANT_OWNER</Option>
                <Option value={3}>USER</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="active">Active (Hoạt động)</Option>
                <Option value="banned">Banned (Bị cấm)</Option>
              </Select>
            </Form.Item>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default EditUserPage;
