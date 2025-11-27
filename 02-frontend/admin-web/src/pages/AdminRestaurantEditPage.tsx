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
  Image, // <-- 1. Import Image
  Space,
} from "antd";
import { AimOutlined } from "@ant-design/icons";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import type { Restaurant } from "../types";
import { AxiosError } from "axios";

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

// 2. SỬA INTERFACE: Thêm coverImageUri
interface AdminEditRestaurantFormData {
  name: string;
  description: string;
  phone: string;
  address: string;
  ownerId: number;
  status: "pending" | "open" | "closed" | "banned";
  coverImageUri?: string; // <-- Thêm trường này
  latitude: number;
  longitude: number;
}

// Kiểu cho lỗi
interface ErrorResponse {
  message: string;
}

// Hàm tiện ích lấy URL ảnh
const getImageUrl = (imageUri: string | undefined | null): string | null => {
  if (!imageUri) return null;
  // URL này phải khớp với API Gateway
  return imageUri;
};

const AdminRestaurantEditPage: React.FC = () => {
  const [loading, setLoading] = useState(false); // Loading cho nút Submit
  const [pageLoading, setPageLoading] = useState(true); // Loading cho cả trang
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<AdminEditRestaurantFormData>();
  const navigate = useNavigate();
  const { restaurantId } = useParams<{ restaurantId: string }>();

  // 3. THÊM STATE CHO FILE UPLOAD
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImageUri, setExistingImageUri] = useState<string | null>(null);

  const [isGeocoding, setIsGeocoding] = useState(false);

  // 1. Tải dữ liệu nhà hàng khi trang được mở
  useEffect(() => {
    if (!restaurantId) {
      setError("Không tìm thấy ID nhà hàng.");
      setPageLoading(false);
      return;
    }

    const fetchRestaurant = async () => {
      try {
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
          latitude: restaurant.latitude, // <-- BỔ SUNG
          longitude: restaurant.longitude,
          ownerId: restaurant.ownerId,
          status: restaurant.status,
          coverImageUri: restaurant.coverImageUri, // <-- 4. Đổ CẢ ảnh cũ
        });

        // 5. Lưu ảnh cũ để xem trước
        if (restaurant.coverImageUri) {
          setExistingImageUri(restaurant.coverImageUri);
        }
      } catch (err) {
        setError("Không thể tải dữ liệu nhà hàng.");
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId, form]);

  // 6. HÀM XỬ LÝ CHỌN FILE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Xem trước ảnh mới
    } else {
      setSelectedFile(null);
      setPreviewUrl(null); // Quay lại xem ảnh cũ (nếu có)
    }
  };

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

  // 7. SỬA HÀM "onFinish" (Thêm logic upload)
  const onFinish = async (values: AdminEditRestaurantFormData) => {
    setLoading(true);
    setError(null);

    // Mặc định là ảnh cũ (hoặc null nếu không có)
    let finalImageUri = values.coverImageUri;

    try {
      // BƯỚC 1: UPLOAD ẢNH MỚI (NẾU CÓ)
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

      // BƯỚC 2: CẬP NHẬT NHÀ HÀNG (Gửi JSON)
      const finalData = {
        ...values,
        coverImageUri: finalImageUri, // Gán tên file ảnh bìa (mới hoặc cũ)
        latitude: values.latitude,
        longitude: values.longitude,
      };

      // SỬA LỖI XUNG ĐỘT API: Gọi đúng API "admin/{id}"
      // (Backend RestaurantController phải có: @PutMapping("/admin/{id}"))
      await api.put(`/api/restaurants/admin/${restaurantId}`, finalData);

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
    // (Xóa finally setLoading(false) vì nó đã được xử lý trong 'catch')
  };

  if (pageLoading) {
    return <Spin tip="Đang tải dữ liệu nhà hàng..." fullscreen />;
  }

  return (
    <Row justify="center">
      <Col xs={24} sm={20} md={18} lg={16}>
        <Spin spinning={loading} tip="Đang lưu...">
          <Card>
            <Title level={2}>Cập nhật Nhà hàng (Admin)</Title>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              {/* ... (Các trường Name, Owner ID, Description, Phone, Address, Status giữ nguyên) ... */}
              <Form.Item
                name="name"
                label="Tên nhà hàng"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="ownerId"
                label="ID Chủ sở hữu"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true }]}
              >
                <Search
                  placeholder="Nhập địa chỉ (ví dụ: 123 Lê Lợi, Quận 1)"
                  enterButton="Tìm tọa độ"
                  size="large"
                  onSearch={handleGeocode} // Gọi hàm khi nhấn nút hoặc Enter
                  loading={isGeocoding} // Hiển thị trạng thái loading
                />
              </Form.Item>

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

              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="pending">Pending (Chờ duyệt)</Option>
                  <Option value="open">Open (Đang hoạt động)</Option>
                  <Option value="closed">Closed (Tạm nghỉ)</Option>
                  <Option value="banned">Banned (Bị cấm)</Option>
                </Select>
              </Form.Item>

              {/* === 8. THÊM KHỐI UPLOAD ẢNH === */}
              <Form.Item name="coverImageUri" label="Ảnh bìa nhà hàng">
                {/* Ưu tiên 1: Hiển thị ảnh mới (previewUrl)
                  Ưu tiên 2: Hiển thị ảnh cũ (existingImageUri)
                */}
                <Image
                  width={200}
                  style={{
                    marginBottom: 10,
                    display: "block",
                    border: "1px solid #eee",
                  }}
                  src={
                    previewUrl ||
                    getImageUrl(existingImageUri) ||
                    "https://via.placeholder.com/200?text=No+Image"
                  }
                />

                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                <Typography.Text type="secondary">
                  (Để trống nếu không muốn thay đổi ảnh)
                </Typography.Text>
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
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Spin>
      </Col>
    </Row>
  );
};

export default AdminRestaurantEditPage;
