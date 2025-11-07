import React, { useState } from "react";
import { Button, Card, Col, Row, Form, Input, Alert, message } from "antd";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AxiosError } from "axios";
import type { ErrorResponse } from "../types/ErrorResponse";

// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU CHO FORM
interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth(); // Lấy hàm login từ Context
  const navigate = useNavigate(); // Hook để điều hướng

  // 2. SỬA "any" THÀNH KIỂU "LoginFormData"
  const onFinish = async (values: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Gọi API /api/auth/login từ UserService
      const response = await api.post("/api/auth/login", {
        email: values.email,
        password: values.password,
      });

      const token = response.data.accessToken;

      // 2. Gọi hàm login của Context
      // Hàm này sẽ tự kiểm tra vai trò ADMIN
      await login(token);

      // 3. Nếu thành công, điều hướng đến trang chủ
      message.success("Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      // 3. SỬA "catch(err: any)" THÀNH "catch(err)"
      setLoading(false);
      // Bắt đầu kiểm tra kiểu của 'err' (kiểu unknown)
      if (err instanceof AxiosError && err.response) {
        const status = err.response.status;
        const backendMessage = (err.response.data as ErrorResponse).message;

        if (status === 403) {
          // <-- BẮT LỖI TÀI KHOẢN BỊ CẤM
          setError(backendMessage); // Hiển thị "Tài khoản này đã bị cấm..."
        } else if (status === 401) {
          setError("Tài khoản này đã bị cấm.");
        } else {
          // Lỗi 400 (Bad Request) - Lỗi mặc định cho sai mật khẩu/user không tồn tại
          setError(
            backendMessage || "Tên đăng nhập hoặc mật khẩu không chính xác."
          );
        }
      } else {
        setError("Đã xảy ra lỗi mạng/server không mong muốn.");
      }
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card title="Đăng nhập Trang Quản Trị">
          <Form
            name="admin_login"
            onFinish={onFinish} // <-- Hàm onFinish đã được định kiểu
            layout="vertical"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Vui lòng nhập email hợp lệ!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password />
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
              <Button type="primary" htmlType="submit" loading={loading} block>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;
