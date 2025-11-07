import React, { useState } from "react";
import { Button, Card, Col, Row, Form, Input, Alert, message } from "antd";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AxiosError } from "axios";

// Kiểu dữ liệu cho Form
interface LoginFormData {
  email: string;
  password: string;
}

// Kiểu dữ liệu cho lỗi
interface ErrorResponse {
  message: string;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/auth/login", {
        email: values.email,
        password: values.password,
      });
      const token = response.data.accessToken;
      await login(token);
      message.success("Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      setLoading(false);
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data as ErrorResponse;
        setError(errorData.message || "Email hoặc mật khẩu không chính xác.");
      } else if (err instanceof Error) {
        if (err.message.includes("quyền truy cập")) {
          setError(err.message);
        } else {
          setError("Email hoặc mật khẩu không chính xác.");
        }
      } else {
        setError("Đã xảy ra lỗi không mong muốn.");
      }
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card title="Đăng nhập Trang Nhà hàng">
          <Form name="restaurant_login" onFinish={onFinish} layout="vertical">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Vui lòng nhập email!",
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
