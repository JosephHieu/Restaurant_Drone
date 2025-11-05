import React, { useState } from "react";
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
} from "antd";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios"; // Import kiểu AxiosError

const { Title } = Typography;
const { Option } = Select;

// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU CHO FORM
interface AddUserFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  roleId: number;
}

// Định nghĩa kiểu cho lỗi trả về từ backend (nếu có)
interface ErrorResponse {
  message: string;
  // Thêm các trường khác nếu backend trả về
}

const AddUserPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 2. SỬA "any" THÀNH KIỂU "AddUserFormData"
  const onFinish = async (values: AddUserFormData) => {
    setLoading(true);
    setError(null);
    try {
      // Gửi request với dữ liệu đã được định kiểu
      await api.post("/api/users", {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        roleId: values.roleId,
      });

      message.success("Thêm người dùng thành công!");
      form.resetFields(); // Xóa form
      navigate("/users/list"); // Chuyển về trang danh sách
    } catch (err) {
      // 3. SỬA "catch(err: any)" THÀNH "catch(err)"

      // 4. XỬ LÝ LỖI MỘT CÁCH AN TOÀN
      setLoading(false);
      if (err instanceof AxiosError && err.response) {
        // Nếu đây là lỗi từ Axios và có response
        const errorData = err.response.data as ErrorResponse;
        setError(errorData.message || "Email hoặc SĐT đã tồn tại.");
      } else if (err instanceof Error) {
        // Lỗi chung
        setError(err.message);
      } else {
        // Lỗi không xác định
        setError("Đã xảy ra lỗi không mong muốn.");
      }
    }
    // Xóa "finally" đi vì setLoading(false) đã được xử lý trong 'catch'
  };

  return (
    <Row justify="center">
      <Col xs={24} sm={20} md={16} lg={12}>
        <Card>
          <Title level={2}>Thêm Người dùng Mới</Title>
          <Form
            form={form}
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
              name="password"
              label="Mật khẩu"
              rules={[
                {
                  required: true,
                  min: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự!",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="roleId"
              label="Vai trò"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              {/* Giả sử ID vai trò trong CSDL của bạn: 1=ADMIN, 2=RESTAURANT_OWNER, 3=USER */}
              <Select placeholder="Chọn một vai trò">
                <Option value={1}>ADMIN</Option>
                <Option value={2}>RESTAURANT_OWNER</Option>
                <Option value={3}>USER</Option>
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
                Thêm Người dùng
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default AddUserPage;
