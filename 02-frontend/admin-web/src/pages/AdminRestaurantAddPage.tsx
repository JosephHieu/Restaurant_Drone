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
  Space,
} from "antd";

import { AimOutlined } from "@ant-design/icons";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

const { Title } = Typography;
const { Search } = Input;

// 3. SỬA INTERFACE: Thêm trường ảnh (không bắt buộc)
interface AddRestaurantFormData {
  name: string;
  description: string;
  phone: string;
  address: string;
  ownerId: number;
  coverImageUri?: string; // <-- Thêm trường này
  latitude: number;
  longitude: number;
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

  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleGeocode = async (address: string) => {
    console.log("Bắt đầu tìm tọa độ cho:", address); // <-- LOG 1
    if (!address) {
      message.error("Vui lòng nhập địa chỉ trước khi tìm.");
      return;
    }

    setIsGeocoding(true);
    setError(null);

    // KHÔNG CẦN API KEY
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json&limit=1`; // Lấy 1 kết quả

    try {
      console.log("Đang gọi API:", url); // <-- LOG 2
      const response = await fetch(url, {
        headers: {
          "User-Agent": "FoodFast-Admin-Web (do-an-tot-nghiep)",
        },
      });

      console.log("Đã nhận được phản hồi (response):", response); // <-- LOG 3

      const data = await response.json();
      console.log("Đã phân tích JSON (data):", data); // <-- LOG 4

      if (data && data.length > 0) {
        const location = data[0];
        console.log("Tìm thấy vị trí:", location); // <-- LOG 5

        const lat = parseFloat(location.lat);
        const lon = parseFloat(location.lon);

        console.log(`Đã phân tích Lat: ${lat}, Lon: ${lon}`); // <-- LOG 6

        // Tự động điền form
        form.setFieldsValue({
          latitude: parseFloat(location.lat), // Dùng parseFloat
          longitude: parseFloat(location.lon), // Nominatim dùng 'lon'
        });

        message.success("Đã tìm thấy tọa độ!");
      } else {
        message.error("Không tìm thấy tọa độ cho địa chỉ này.");
      }
    } catch (err) {
      message.error("Lỗi khi gọi API Geocoding (Nominatim).");
      console.error(err);
    } finally {
      setIsGeocoding(false);
    }
  };

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

  // --- BỔ SUNG: HÀM LẤY VỊ TRÍ (TỪ CODE CỦA BẠN) ---
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      message.error("Trình duyệt không hỗ trợ Geolocation");
      return;
    }

    // Thêm thông báo loading
    const key = "geolocation";
    message.loading({ content: "Đang lấy vị trí...", key });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Tự động điền vào form
        form.setFieldsValue({
          latitude: lat,
          longitude: lng,
        });

        message.success({
          content: "Đã lấy vị trí hiện tại!",
          key,
          duration: 2,
        });
      },
      (err) => {
        message.error({
          content: "Không lấy được vị trí: " + err.message,
          key,
          duration: 3,
        });
      }
    );
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
        latitude: values.latitude, // <-- BỔ SUNG
        longitude: values.longitude,
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
                <Search
                  placeholder="Nhập địa chỉ (ví dụ: 123 Lê Lợi, Quận 1)"
                  enterButton="Tìm tọa độ"
                  size="large"
                  onSearch={handleGeocode} // Gọi hàm khi nhấn nút hoặc Enter
                  loading={isGeocoding} // Hiển thị trạng thái loading
                />
              </Form.Item>

              {/* === SỬA KHỐI TỌA ĐỘ === */}
              <Form.Item label="Tọa độ GPS">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="latitude"
                        label="Vĩ độ (Latitude)"
                        rules={[
                          { required: true, message: "Vui lòng tìm tọa độ!" },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder="Sẽ được điền tự động"
                          precision={8} // 8 chữ số thập phân
                          readOnly // Không cho người dùng nhập trực tiếp
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name="longitude"
                        label="Kinh độ (Longitude)"
                        rules={[
                          { required: true, message: "Vui lòng tìm tọa độ!" },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder="Sẽ được điền tự động"
                          precision={8}
                          readOnly // Chỉ auto-fill từ geocode
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Button
                    icon={<AimOutlined />}
                    onClick={getCurrentLocation}
                    style={{ marginTop: 8 }}
                  >
                    Lấy vị trí hiện tại
                  </Button>
                </Space>
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
