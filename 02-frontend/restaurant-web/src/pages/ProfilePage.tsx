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
import type { Restaurant } from "../types"; // <-- Import interface Restaurant
import { AxiosError } from "axios";

const { Title } = Typography;
const { Option } = Select;

// Kiểu dữ liệu cho Form
interface RestaurantFormData {
  name: string;
  description: string;
  phone: string;
  address: string;
  status: "open" | "closed" | "pending";
}

// Kiểu cho lỗi
interface ErrorResponse {
  message: string;
}

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false); // Loading cho nút Submit
  const [pageLoading, setPageLoading] = useState(true); // Loading cho cả trang
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<RestaurantFormData>();

  // 1. Tải dữ liệu nhà hàng khi trang được mở
  useEffect(() => {
    const fetchMyRestaurant = async () => {
      try {
        setPageLoading(true);
        // Gọi API GET mới
        const response = await api.get<Restaurant>("/api/restaurants/my");

        // 2. Đổ dữ liệu vào Form
        form.setFieldsValue({
          name: response.data.name,
          description: response.data.description,
          phone: response.data.phone,
          address: response.data.address,
          status: response.data.status,
        });
      } catch (err) {
        setError("Không thể tải dữ liệu nhà hàng.");
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchMyRestaurant();
  }, [form]);

  // 3. Xử lý khi nhấn nút "Cập nhật"
  const onFinish = async (values: RestaurantFormData) => {
    setLoading(true);
    setError(null);
    try {
      // Gọi API PUT mới
      await api.put("/api/restaurants/my", values);
      message.success("Cập nhật thông tin nhà hàng thành công!");
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data as ErrorResponse;
        setError(errorData.message || "Lỗi khi cập nhật.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi không mong muốn.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <Spin tip="Đang tải dữ liệu nhà hàng..." fullscreen />;
  }

  return (
    <Row justify="center">
      <Col xs={24} sm={20} md={18} lg={16}>
        <Card>
          <Title level={2}>Thông tin Nhà hàng</Title>
          <Form
            form={form} // <-- Gán form vào
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="name"
              label="Tên nhà hàng"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={4} />
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

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="open">Mở cửa (Đang hoạt động)</Option>
                <Option value="closed">Đóng cửa (Tạm nghỉ)</Option>
                {/* Chủ quán không thể tự chuyển về 'pending' */}
                <Option value="pending" disabled>
                  Pending (Chờ duyệt)
                </Option>
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
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default ProfilePage;
