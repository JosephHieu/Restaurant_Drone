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
  InputNumber,
  Spin, // <-- 1. IMPORT Spin
  Image, // <-- 2. IMPORT Image
} from "antd";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

const { Title } = Typography;

// 3. SỬA INTERFACE: Thêm trường ảnh (không bắt buộc)
interface AddRestaurantFormData {
  name: string;
  description: string;
  phone: string;
  address: string;
  ownerId: number;
  coverImageUri?: string; // <-- Thêm trường này
}

// Kiểu cho lỗi
interface ErrorResponse {
  message: string;
}

const AdminRestaurantAddPage: React.FC = () => {
  const [loading, setLoading] = useState(false); // Chung cho cả trang/upload
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<AddRestaurantFormData>();
  const navigate = useNavigate();

  // 4. THÊM STATE CHO FILE UPLOAD
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 5. HÀM XỬ LÝ CHỌN FILE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
      // Tạo URL tạm thời để xem trước
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  // 6. SỬA HÀM "onFinish" (Thêm logic upload)
  const onFinish = async (values: AddRestaurantFormData) => {
    setLoading(true);
    setError(null);

    let finalImageUri = null; // Mặc định là null

    try {
      // BƯỚC 1: UPLOAD ẢNH (NẾU CÓ)
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        // Tái sử dụng API upload (Backend đã có)
        const uploadResponse = await api.post<string>(
          "/api/restaurants/upload-image",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        finalImageUri = uploadResponse.data; // Lấy tên file đã lưu
      }

      // BƯỚC 2: TẠO NHÀ HÀNG (Gửi JSON)
      const finalData = {
        ...values,
        coverImageUri: finalImageUri, // Gán tên file ảnh bìa
      };

      await api.post("/api/restaurants", finalData);

      message.success("Tạo nhà hàng mới thành công!");
      form.resetFields();
      navigate("/admin/restaurants/pending");
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data as ErrorResponse;
        setError(errorData.message || "Lỗi khi tạo nhà hàng.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi không mong muốn.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center">
      <Col xs={24} sm={20} md={18} lg={16}>
        {/* 7. BỌC CARD TRONG SPIN */}
        <Spin spinning={loading} tip="Đang xử lý...">
          <Card>
            <Title level={2}>Tạo Nhà hàng Mới (Admin)</Title>
            <Form form={form} layout="vertical" onFinish={onFinish}>
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

              {/* === 8. THÊM KHỐI UPLOAD ẢNH === */}
              <Form.Item name="coverImageUri" label="Ảnh bìa nhà hàng">
                {/* Xem trước ảnh */}
                {previewUrl && (
                  <Image
                    width={200}
                    style={{
                      marginBottom: 10,
                      display: "block",
                      border: "1px solid #eee",
                    }}
                    src={previewUrl}
                  />
                )}
                {/* Input File */}
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </Form.Item>
              {/* ============================== */}

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
                  {loading ? "Đang xử lý..." : "Tạo nhà hàng"}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Spin>
      </Col>
    </Row>
  );
};

export default AdminRestaurantAddPage;
