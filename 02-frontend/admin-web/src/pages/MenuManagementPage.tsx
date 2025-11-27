import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  Spin,
  Alert,
  Button,
  Space,
  Popconfirm,
  message,
  Switch, // <-- Dùng cho trạng thái 'isAvailable'
  Modal, // <-- Dùng cho form Thêm/Sửa
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  Select,
  Image,
} from "antd";
import type { TableProps } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import api from "../services/api";
import type { MenuItem, Restaurant } from "../types";
import { AxiosError } from "axios";

const { Title } = Typography;
const { Option } = Select;

interface ErrorResponse {
  message: string;
}

// Kiểu dữ liệu cho Form (phải khớp với DTO backend)
interface MenuItemFormData {
  name: string;
  description: string;
  price: number;
  imageUri: string; // <-- Đây là URL/Tên file sẽ gửi đến backend
  available: boolean;
}

const MenuManagementPage: React.FC = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  // Danh sách TẤT CẢ nhà hàng của chủ quán
  const [ownedRestaurants, setOwnedRestaurants] = useState<Restaurant[]>([]);
  // ID của nhà hàng đang được chọn
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    number | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái Modal
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null); // Món đang sửa
  const [form] = Form.useForm<MenuItemFormData>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 1. Hàm tải danh sách TẤT CẢ nhà hàng của Owner
  useEffect(() => {
    const fetchOwnedRestaurants = async () => {
      try {
        const response = await api.get<Restaurant[]>("/api/restaurants/my/all");
        const restaurants = response.data.filter((r) => r.status === "open");

        setOwnedRestaurants(restaurants);

        // Đặt nhà hàng ĐẦU TIÊN làm mặc định
        if (restaurants.length > 0) {
          setSelectedRestaurantId(restaurants[0].restaurantId);
        }
      } catch (err) {
        setError("Không thể tải danh sách nhà hàng.");
        console.error(err);
      }
    };
    fetchOwnedRestaurants();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      // Gọi API menu theo ID nhà hàng đã chọn
      const response = await api.get<MenuItem[]>(
        `/api/restaurants/${selectedRestaurantId}/menu`
      );

      console.log("Dữ liệu thực đơn nhận được:", response.data);

      setMenu(response.data);
    } catch (err) {
      setError("Không thể tải thực đơn của nhà hàng này.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Hàm tải Thực đơn (Chạy khi component tải VÀ khi selectedRestaurantId thay đổi)
  useEffect(() => {
    // Chỉ chạy khi đã chọn một nhà hàng
    if (selectedRestaurantId === null && ownedRestaurants.length > 0) {
      setLoading(false);
      return;
    }

    // Nếu chưa có quán nào và đã cố gắng tải, ta dừng loading
    if (selectedRestaurantId === null && ownedRestaurants.length === 0) {
      setLoading(false);
      return;
    }

    fetchMenu();
  }, [selectedRestaurantId, ownedRestaurants]); // Phụ thuộc vào ID được chọn và danh sách quán

  // --- HÀM XỬ LÝ SỬA/XÓA/THÊM ---

  // Mở Modal cho việc Thêm/Sửa
  const handleOpenModal = (item?: MenuItem) => {
    setEditingItem(item || null);
    setIsModalOpen(true);
    setSelectedFile(null);
    setPreviewUrl(
      item?.imageUri
        ? `http://localhost:8080/api/restaurants/images/${item.imageUri}`
        : null
    );
    if (item) {
      // Đổ dữ liệu vào Form khi sửa
      form.setFieldsValue({
        name: item.name,
        description: item.description,
        price: item.price,
        imageUri: item.imageUri,
        available: !!item.available,
      });
    } else {
      form.resetFields();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      setSelectedFile(file);
      // Tạo URL tạm thời từ file cục bộ (chỉ tồn tại trong trình duyệt)
      setPreviewUrl(URL.createObjectURL(file));
      message.info(`Đã chọn file: ${file.name}.`);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  // Xử lý Thêm hoặc Sửa
  const onFinish = async (values: MenuItemFormData) => {
    if (!selectedRestaurantId) {
      message.error("Vui lòng chọn nhà hàng để thêm món!");
      return;
    }

    // Đang chờ xử lý
    setLoading(true);
    let finalImageUri = values.imageUri; // Mặc định là URI cũ (nếu không có file mới)

    try {
      // 1. KIỂM TRA VÀ UPLOAD FILE VẬT LÝ
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile); // key BẮT BUỘC là "file" (khớp với @RequestParam("file"))

        // Gọi API upload file
        const uploadResponse = await api.post<string>(
          "/api/restaurants/upload-image",
          formData,
          {
            headers: {
              // BẮT BUỘC: Không để Axios tự đặt Content-Type
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Lấy tên file đã được lưu từ Backend
        finalImageUri = uploadResponse.data;
      }

      // 2. GỌI API LƯU DATA VÀO DATABASE (JSON)
      const finalData = {
        ...values,
        imageUri: finalImageUri || "", // Sử dụng tên file đã được lưu
      };

      if (editingItem) {
        // SỬA MÓN ĂN (PUT)
        await api.put(`/api/menu-items/${editingItem.itemId}`, finalData);
        message.success(`Cập nhật món ăn "${values.name}" thành công!`);
      } else {
        // THÊM MÓN ĂN (POST)
        await api.post(
          `/api/restaurants/${selectedRestaurantId}/menu-items`,
          finalData
        );
        message.success(`Thêm món ăn mới thành công!`);
      }

      setIsModalOpen(false);
      // setSelectedFile(null); // Reset file sau khi thành công
      fetchMenu();
    } catch (err) {
      setLoading(false); // Dừng loading khi có lỗi

      // Xử lý lỗi "đẹp"
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data as ErrorResponse;

        // Hiển thị lỗi từ backend (ví dụ: "Lỗi: Tên món ăn này đã tồn tại...")
        message.error(errorData.message || "Đã xảy ra lỗi");
      } else {
        message.error("Lỗi khi lưu món ăn hoặc upload ảnh.");
      }
      console.error(err);
    }
  };

  // Xử lý Xóa
  const handleDelete = async (itemId: number) => {
    try {
      await api.delete(`/api/menu-items/${itemId}`);
      message.success("Xóa món ăn thành công!");
      setMenu((prev) => prev.filter((item) => item.itemId !== itemId));
    } catch (err) {
      message.error("Lỗi khi xóa món ăn.");
      console.error(err);
    }
  };

  // Xử lý bật/tắt trạng thái (isAvailable)
  const handleToggle = async (item: MenuItem, checked: boolean) => {
    try {
      // 1. CHUẨN BỊ DỮ LIỆU ĐẦY ĐỦ (BẮT BUỘC ĐỂ TRÁNH LỖI MAPPING Ở BACKEND)
      const valuesToUpdate = {
        name: item.name,
        description: item.description,
        price: item.price,
        imageUri: item.imageUri || "",
        available: checked, // <-- Trường được cập nhật
      };

      // 2. Gửi PUT request
      await api.put(`/api/menu-items/${item.itemId}`, valuesToUpdate);

      message.success(
        checked ? `"${item.name}" đã được bật!` : `"${item.name}" đã được tắt.`
      );

      // 3. Cập nhật trạng thái trong UI ngay lập tức
      setMenu((prev) =>
        prev.map((m) =>
          m.itemId === item.itemId ? { ...m, available: checked } : m
        )
      );
    } catch (err) {
      message.error("Lỗi khi thay đổi trạng thái.");
      console.error(err);
    }
  };

  // Định nghĩa các cột cho bảng
  const columns: TableProps<MenuItem>["columns"] = [
    { title: "ID", dataIndex: "itemId", key: "itemId", width: 70 },
    {
      title: "Tên món ăn",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Giá (VND)",
      dataIndex: "price",
      key: "price",
      render: (price: number) => price.toLocaleString("vi-VN") + " đ",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "available",
      key: "available",
      render: (available: boolean | number, record) => (
        <Switch
          checkedChildren="Còn hàng"
          unCheckedChildren="Hết hàng"
          checked={!!available}
          onChange={(checked) => handleToggle(record, checked)}
        />
      ),
      width: 130,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa món ăn?"
            description="Bạn có chắc muốn xóa món ăn này vĩnh viễn?"
            onConfirm={() => handleDelete(record.itemId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 190,
    },
    {
      title: "Ảnh",
      dataIndex: "imageUri",
      key: "imageUri",
      render: (imageUri: string) => {
        // Nếu không có URI, dùng placeholder, nếu có, gọi hàm helper
        const imageUrl =
          imageUri || "https://via.placeholder.com/80?text=No+Image";
        return <Image width={80} src={imageUrl} alt="Món ăn" />;
      },
      width: 100,
    },
  ];

  if (loading && ownedRestaurants.length === 0) {
    return <Spin tip="Đang tải dữ liệu..." fullscreen />;
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Title level={2}>Quản lý Thực đơn</Title>
      </Col>

      {/* 3. KHỐI BỘ CHỌN (SELECTOR BLOCK) */}
      <Col xs={24} sm={12} lg={10}>
        <Space direction="horizontal" size="large">
          <Title level={5} style={{ margin: 0 }}>
            Quán đang chọn:
          </Title>
          <Select
            style={{ width: 250 }}
            value={selectedRestaurantId}
            onChange={(value) => setSelectedRestaurantId(value)} // <-- Cập nhật state
            placeholder="Chọn nhà hàng"
            // Chỉ vô hiệu hóa nếu không có quán nào (ví dụ: đang pending)
            disabled={ownedRestaurants.length <= 1}
          >
            {ownedRestaurants.map((r) => (
              <Option key={r.restaurantId} value={r.restaurantId}>
                {r.name} ({r.status.toUpperCase()})
              </Option>
            ))}
          </Select>
        </Space>
      </Col>

      <Col xs={24} sm={12} lg={14} style={{ textAlign: "right" }}>
        {/* Nút thêm mới chỉ hoạt động khi có quán được chọn */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
          disabled={selectedRestaurantId === null}
        >
          Thêm món mới
        </Button>
      </Col>

      {/* 4. HIỂN THỊ CẢNH BÁO KHI KHÔNG CÓ NHÀ HÀNG */}
      {ownedRestaurants.length === 0 && (
        <Col span={24}>
          <Alert
            message="Bạn chưa sở hữu nhà hàng nào đang hoạt động."
            description="Vui lòng liên hệ Admin để duyệt nhà hàng của bạn."
            type="warning"
            showIcon
          />
        </Col>
      )}

      {/* 5. HIỂN THỊ BẢNG */}
      {selectedRestaurantId !== null && (
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={menu}
            rowKey="itemId"
            pagination={{ pageSize: 10 }}
          />
        </Col>
      )}

      {/* Modal Thêm/Sửa */}
      <Modal
        title={editingItem ? "Sửa món ăn" : "Thêm món mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null} // Không dùng footer mặc định
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ available: true }}
        >
          <Form.Item
            name="name"
            label="Tên món"
            rules={[{ required: true, message: "Vui lòng nhập tên món!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá (VND)"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <InputNumber
              min={1000}
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="imageUri" label="Link Ảnh (URL)">
            {(previewUrl || editingItem?.imageUri) && (
              <Image
                width={100}
                style={{ marginBottom: 10, display: "block" }}
                src={previewUrl || editingItem?.imageUri}
              />
            )}

            <Input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
          </Form.Item>
          <Form.Item
            name="available"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch checkedChildren="Còn hàng" unCheckedChildren="Hết hàng" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              {editingItem ? "Lưu thay đổi" : "Thêm món"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
};

export default MenuManagementPage;
