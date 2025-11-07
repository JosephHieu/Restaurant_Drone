import React, { useState, useEffect } from "react";
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
  Spin,
} from "antd";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import type { Restaurant } from "../types"; // Import kiểu Restaurant
import { AxiosError } from "axios";

const { Title } = Typography;

// Kiểu dữ liệu cho Form (Chủ nhà hàng không được sửa ownerId và status)
interface OwnerEditRestaurantFormData {
  name: string;
  description: string;
  phone: string;
  address: string;
}

const RestaurantOwnerEditPage: React.FC = () => {
  const [loading, setLoading] = useState(false); // Loading cho nút Submit
  const [pageLoading, setPageLoading] = useState(true); // Loading cho cả trang
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<OwnerEditRestaurantFormData>();
  const navigate = useNavigate();
  const { restaurantId } = useParams<{ restaurantId: string }>(); // Lấy ID từ URL

  // Tải dữ liệu nhà hàng
  useEffect(() => {
    if (!restaurantId) {
      setError("Không tìm thấy ID nhà hàng.");
      setPageLoading(false);
      return;
    }

    const fetchRestaurant = async () => {
      try {
        // API chung để lấy thông tin nhà hàng (GET /api/restaurants/{id})
        const response = await api.get<Restaurant>(
          `/api/restaurants/${restaurantId}`
        );
        const restaurant = response.data;

        // Đổ dữ liệu vào Form
        form.setFieldsValue({
          name: restaurant.name,
          description: restaurant.description,
          phone: restaurant.phone,
          address: restaurant.address,
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

  // Xử lý khi nhấn nút "Cập nhật"
  const onFinish = async (values: OwnerEditRestaurantFormData) => {
    setLoading(true);
    setError(null);
    try {
      // GỌI API PUT /api/restaurants/my (sửa API chung cho owner)
      // *Lưu ý: Backend của bạn phải có API PUT /api/restaurants/my
      // Nếu không, bạn phải dùng API PUT /api/restaurants/{id} và tự kiểm tra OwnerID ở backend.
      // Vì bạn đã có API PUT /my, ta sẽ dùng API đó.

      await api.put(`/api/restaurants/${restaurantId}`, values);
      message.success("Cập nhật thông tin nhà hàng thành công!");
      navigate("/profile"); // Quay về trang dashboard/selector
    } catch (err) {
      setLoading(false);
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data.message || "Lỗi khi cập nhật.");
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
          <Title level={2}>Cập nhật Thông tin Nhà hàng</Title>
          <Title level={4} type="secondary">
            ID Nhà hàng: {restaurantId}
          </Title>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="name"
              label="Tên nhà hàng"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input />
            </Form.Item>

            {/* Owner không được sửa Owner ID */}

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

            {/* Owner không được sửa Trạng thái (status) */}

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

export default RestaurantOwnerEditPage;
