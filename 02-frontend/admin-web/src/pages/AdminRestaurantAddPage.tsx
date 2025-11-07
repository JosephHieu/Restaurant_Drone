import React, { useState } from "react";
import {
  Typography,
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Alert,
  message,
  InputNumber, // <-- Dùng InputNumber cho ID
} from "antd";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

const { Title } = Typography;

// 1. Định nghĩa kiểu dữ liệu cho Form
// (Interface này phải khớp với DTO mà backend sẽ nhận)
interface AddRestaurantFormData {
  name: string;
  description: string;
  phone: string;
  address: string;
  ownerId: number; // <-- Trường (field) quan trọng cho Admin
}

// Kiểu cho lỗi
interface ErrorResponse {
  message: string;
}

const AdminRestaurantAddPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<AddRestaurantFormData>();
  const navigate = useNavigate();

  // 2. Hàm xử lý khi nhấn "Tạo nhà hàng"
  const onFinish = async (values: AddRestaurantFormData) => {
    setLoading(true);
    setError(null);
    try {
      // 3. Gọi API POST (mà chúng ta sẽ sửa ở backend)
      await api.post("/api/restaurants", values); // Gửi toàn bộ object 'values'

      message.success("Tạo nhà hàng mới thành công!");
      form.resetFields(); // Xóa form
      navigate("/admin/restaurants/pending"); // Chuyển đến trang "Chờ duyệt"
    } catch (err) {
      setLoading(false);
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data as ErrorResponse;
        setError(errorData.message || "Lỗi khi tạo nhà hàng.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi không mong muốn.");
      }
    }
  };

  return (
    <Row justify="center">
      <Col xs={24} sm={20} md={18} lg={16}>
        <Card>
          <Title level={2}>Tạo Nhà hàng Mới (Admin)</Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ status: "pending" }} // Mặc định là 'pending'
          >
            <Form.Item
              name="name"
              label="Tên nhà hàng"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input />
            </Form.Item>

            {/* 4. Thêm trường Owner ID */}
            <Form.Item
              name="ownerId"
              label="ID Chủ sở hữu (Owner ID)"
              rules={[
                { required: true, message: "Vui lòng nhập ID chủ sở hữu!" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Nhập User ID của chủ nhà hàng"
              />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true, message: "Vui lòng nhập SĐT!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <Input />
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
                Tạo nhà hàng
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default AdminRestaurantAddPage;
