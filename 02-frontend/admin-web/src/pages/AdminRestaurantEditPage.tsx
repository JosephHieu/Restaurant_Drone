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
} from "antd";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import type { Restaurant } from "../types";
import { AxiosError } from "axios";

const { Title } = Typography;
const { Option } = Select;

// 2. SỬA INTERFACE: Thêm coverImageUri
interface AdminEditRestaurantFormData {
  name: string;
  description: string;
  phone: string;
  address: string;
  ownerId: number;
  status: "pending" | "open" | "closed" | "banned";
  coverImageUri?: string; // <-- Thêm trường này
}

// Kiểu cho lỗi
interface ErrorResponse {
  message: string;
}

// Hàm tiện ích lấy URL ảnh
const getImageUrl = (imageUri: string | undefined | null): string | null => {
  if (!imageUri) return null;
  // URL này phải khớp với API Gateway
  return `http://localhost:8080/api/restaurants/images/${imageUri}`;
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
                <Input />
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
