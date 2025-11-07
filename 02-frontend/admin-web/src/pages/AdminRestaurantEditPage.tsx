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
  InputNumber,
} from "antd";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import type { Restaurant } from "../types"; // Import kiểu Restaurant
import { AxiosError } from "axios";

const { Title } = Typography;
const { Option } = Select;

// Kiểu dữ liệu cho Form (phải khớp với DTO mới)
interface AdminEditRestaurantFormData {
  name: string;
  description: string;
  phone: string;
  address: string;
  ownerId: number;
  status: "pending" | "open" | "closed" | "banned";
}

// Kiểu cho lỗi
interface ErrorResponse {
  message: string;
}

const AdminRestaurantEditPage: React.FC = () => {
  const [loading, setLoading] = useState(false); // Loading cho nút Submit
  const [pageLoading, setPageLoading] = useState(true); // Loading cho cả trang
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<AdminEditRestaurantFormData>();
  const navigate = useNavigate();
  const { restaurantId } = useParams<{ restaurantId: string }>(); // Lấy ID từ URL

  // 1. Tải dữ liệu nhà hàng khi trang được mở
  useEffect(() => {
    if (!restaurantId) {
      setError("Không tìm thấy ID nhà hàng.");
      setPageLoading(false);
      return;
    }

    const fetchRestaurant = async () => {
      try {
        // Gọi API GET (API này public nên không cần quyền)
        const response = await api.get<Restaurant>(
          `/api/restaurants/${restaurantId}`
        );
        const restaurant = response.data;

        // 2. Đổ dữ liệu vào Form
        form.setFieldsValue({
          name: restaurant.name,
          description: restaurant.description,
          phone: restaurant.phone,
          address: restaurant.address,
          ownerId: restaurant.ownerId,
          status: restaurant.status,
        });
      } catch (err) {
        setError("Không thể tải dữ liệu nhà hàng.");
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId, form]);

  // 3. Xử lý khi nhấn nút "Cập nhật"
  const onFinish = async (values: AdminEditRestaurantFormData) => {
    setLoading(true);
    setError(null);
    try {
      // Gọi API PUT (API Admin)
      await api.put(`/api/restaurants/${restaurantId}`, values);
      message.success("Cập nhật nhà hàng thành công!");
      navigate("/admin/restaurants/list"); // Quay về trang danh sách
    } catch (err) {
      setLoading(false);
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data as ErrorResponse;
        setError(errorData.message || "Lỗi khi cập nhật.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi không mong muốn.");
      }
    }
  };

  if (pageLoading) {
    return <Spin tip="Đang tải dữ liệu nhà hàng..." fullscreen />;
  }

  return (
    <Row justify="center">
      <Col xs={24} sm={20} md={18} lg={16}>
        <Card>
          <Title level={2}>Cập nhật Nhà hàng (Admin)</Title>
          <Form
            form={form} // Gán form vào
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

            <Form.Item
              name="ownerId"
              label="ID Chủ sở hữu (Owner ID)"
              rules={[
                { required: true, message: "Vui lòng nhập ID chủ sở hữu!" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} />
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

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="pending">Pending (Chờ duyệt)</Option>
                <Option value="open">Open (Đang hoạt động)</Option>
                <Option value="closed">Closed (Tạm nghỉ)</Option>
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
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default AdminRestaurantEditPage;
