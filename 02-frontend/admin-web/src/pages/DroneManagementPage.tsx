import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  Spin,
  Alert,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
} from "antd";
import type { TableProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import api from "../services/api"; // Import api.ts
import { AxiosError } from "axios";

const { Title } = Typography;

// 1. Định nghĩa interface (khớp với Drone.java)
interface Drone {
  droneId: number;
  model: string;
  status: "IDLE" | "DELIVERING" | "CHARGING" | "MAINTENANCE";
  batteryLevel: number;
  currentLat: number;
  currentLng: number;
  updatedAt: string;
}

// Kiểu dữ liệu cho Form
interface DroneFormData {
  model: string;
  batteryLevel: number;
}

// Kiểu dữ liệu lỗi
interface ErrorResponse {
  message: string;
}

const DroneManagementPage: React.FC = () => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<DroneFormData>();

  // Hàm tải dữ liệu
  const fetchDrones = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Drone[]>("/api/drones");
      setDrones(response.data);
    } catch (err) {
      setError("Không thể tải danh sách drone.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tải drones khi component mount
  useEffect(() => {
    fetchDrones();
  }, []);

  // Xử lý khi submit Form (Thêm Drone)
  const handleFormSubmit = async (values: DroneFormData) => {
    setLoading(true);
    try {
      await api.post("/api/drones", {
        model: values.model,
        batteryLevel: values.batteryLevel,
      });
      message.success("Thêm drone mới thành công!");
      setIsModalOpen(false);
      form.resetFields();
      fetchDrones(); // Tải lại danh sách
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data as ErrorResponse;
        message.error(errorData.message || "Lỗi khi thêm drone.");
      } else {
        message.error("Lỗi khi thêm drone.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Định nghĩa cột
  const columns: TableProps<Drone>["columns"] = [
    {
      title: "ID",
      dataIndex: "droneId",
      key: "droneId",
      sorter: (a, b) => a.droneId - b.droneId,
    },
    { title: "Model", dataIndex: "model", key: "model" },
    {
      title: "Pin",
      dataIndex: "batteryLevel",
      key: "batteryLevel",
      render: (level: number) => `${level}%`,
      sorter: (a, b) => a.batteryLevel - b.batteryLevel,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "IDLE") color = "success";
        if (status === "DELIVERING") color = "processing";
        if (status === "MAINTENANCE") color = "error";
        if (status === "CHARGING") color = "warning";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Tọa độ",
      key: "location",
      render: (_, record) =>
        record.currentLat
          ? `${record.currentLat.toFixed(4)}, ${record.currentLng.toFixed(4)}`
          : "Chưa rõ",
    },
    {
      title: "Cập nhật cuối",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) =>
        date ? new Date(date).toLocaleString("vi-VN") : "N/A",
    },
  ];

  if (loading && drones.length === 0) {
    return <Spin tip="Đang tải danh sách drone..." size="large" />;
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <Title level={2}>Quản lý Drone</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalOpen(true)}
        style={{ marginBottom: 16 }}
      >
        Thêm Drone mới
      </Button>

      <Table columns={columns} dataSource={drones} rowKey="droneId" />

      <Modal
        title="Thêm Drone mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ batteryLevel: 100 }}
        >
          <Form.Item
            name="model"
            label="Model Drone"
            rules={[{ required: true, message: "Vui lòng nhập model!" }]}
          >
            <Input placeholder="Ví dụ: DJI Mavic 3" />
          </Form.Item>
          <Form.Item
            name="batteryLevel"
            label="Mức pin khởi tạo (%)"
            rules={[{ required: true, message: "Vui lòng nhập mức pin!" }]}
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Thêm
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DroneManagementPage;
