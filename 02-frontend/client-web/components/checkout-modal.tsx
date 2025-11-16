"use client";

import { useState, useMemo, useEffect } from "react";
import { X, User, Phone, MapPin, CreditCard, Truck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import api from "@/services/api";
import { Alert, Button, message, Radio, Space, Spin } from "antd"; // Dùng AntD cho message và Spin
import { AimOutlined } from "@ant-design/icons";
import { AxiosError } from "axios";

// Kiểu DTO trả về (khớp với OrderResponseDto của backend)
interface OrderResponse {
  paymentUrl: string; // URL của VNPay
}
// Kiểu dữ liệu lỗi
interface ErrorResponse {
  message: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckoutSuccess: () => void; // <-- 2. THÊM PROP MỚI
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onCheckoutSuccess,
}: CheckoutModalProps) {
  const { user } = useAuth(); // Lấy user đã đăng nhập
  const { cart, fetchCart, isLoading: isCartLoading } = useCart(); // Lấy giỏ hàng thật

  // State cho Form
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    deliveryAddress: user?.address || "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD"); // Mặc định là COD
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [customerCoordinates, setCustomerCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Tải dữ liệu user (vì user có thể được tải sau)
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        fullName: user.fullName,
        phone: user.phone,
        deliveryAddress: user.address,
      });
      setCustomerCoordinates(null);
    }
  }, [user, isOpen]); // Chạy lại khi modal mở

  // Tính tổng tiền
  const calculateTotal = useMemo(() => {
    if (!cart) return 0;
    // (Lỗi "0đ" đã được sửa trong CartContext "thật")
    return cart.cartItems.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  }, [cart]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      message.error("Trình duyệt không hỗ trợ Geolocation");
      return;
    }

    const key = "geolocation_customer";
    message.loading({ content: "Đang lấy vị trí của bạn...", key });
    setError(""); // Xóa lỗi cũ

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Cập nhật state tọa độ
        setCustomerCoordinates({ lat, lng });

        message.success({
          content: "Đã lấy vị trí thành công!",
          key,
          duration: 2,
        });
      },
      (err) => {
        // Hiển thị lỗi trong Alert
        setError("Không lấy được vị trí: " + err.message);
        message.error({ content: "Không lấy được vị trí.", key, duration: 3 });
      }
    );
  };

  // === HÀM "XÁC NHẬN ĐẶT HÀNG" ===
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.cartItems.length === 0) {
      setError("Giỏ hàng của bạn đang trống.");
      return;
    }
    if (!formData.deliveryAddress || !formData.fullName || !formData.phone) {
      setError("Vui lòng điền đầy đủ thông tin giao hàng.");
      return;
    }

    // SỬA: Kiểm tra tọa độ
    if (!customerCoordinates) {
      setError(
        "Vui lòng nhấn 'Lấy vị trí của tôi' để xác nhận tọa độ giao hàng."
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Gọi API POST /api/orders (đến OrderService)
      const response = await api.post<OrderResponse>("/api/orders", {
        deliveryAddress: formData.deliveryAddress,
        paymentMethod: paymentMethod,
        deliveryLat: customerCoordinates.lat,
        deliveryLng: customerCoordinates.lng,
      });

      // 2. Xử lý kết quả
      await fetchCart(); // Dọn dẹp giỏ hàng

      if (paymentMethod === "VNPAY") {
        message.success("Đang chuyển hướng đến VNPay...");
        window.location.href = response.data.paymentUrl;
      } else {
        message.success("Đặt hàng thành công!");
        onClose(); // Đóng modal checkout
        onCheckoutSuccess(); // <-- 5. GỌI HÀM CHA ĐỂ MỞ MODAL "ĐƠN HÀNG"
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data as ErrorResponse;
        setError(errorData.message || "Lỗi khi đặt hàng.");
      } else {
        setError("Lỗi khi đặt hàng.");
      }
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Spin spinning={isLoading || isCartLoading}>
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b flex items-center justify-between p-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Xác nhận Đơn hàng
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitOrder} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột Thông tin (Trái) */}
                <div className="space-y-4">
                  {/* 1. THÔNG TIN GIAO HÀNG */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Thông tin giao hàng
                    </h3>
                    <div className="space-y-4">
                      {/* Họ tên */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Họ và Tên
                        </label>
                        <div className="relative">
                          <User
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fullName: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                            required
                          />
                        </div>
                      </div>
                      {/* SĐT */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        <div className="relative">
                          <Phone
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                            required
                          />
                        </div>
                      </div>
                      {/* Địa chỉ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Địa chỉ giao hàng
                        </label>
                        <div className="relative">
                          <MapPin
                            className="absolute left-3 top-3 text-gray-400"
                            size={18}
                          />
                          <textarea
                            value={formData.deliveryAddress}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                deliveryAddress: e.target.value,
                              });
                              setCustomerCoordinates(null); // Reset tọa độ
                              setError(""); // Xóa lỗi
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                            rows={3}
                            required
                          />
                        </div>
                      </div>

                      {/* Nút lấy tọa độ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tọa độ GPS (Bắt buộc)
                        </label>

                        <Button
                          type="dashed"
                          icon={<AimOutlined />}
                          onClick={getCurrentLocation}
                        >
                          Lấy vị trí của tôi
                        </Button>

                        {customerCoordinates && (
                          <Alert
                            message={`Đã lấy tọa độ: ${customerCoordinates.lat.toFixed(
                              4
                            )}, ${customerCoordinates.lng.toFixed(4)}`}
                            type="success"
                            showIcon
                            style={{ marginTop: 8 }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. PHƯƠNG THỨC THANH TOÁN */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Phương thức thanh toán
                    </h3>
                    <Radio.Group
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      value={paymentMethod}
                    >
                      <Space direction="vertical">
                        <Radio value={"COD"} className="text-base">
                          <Truck size={20} className="inline-block mr-2" />
                          Thanh toán khi nhận hàng (COD)
                        </Radio>
                        <Radio value={"VNPAY"} className="text-base">
                          <CreditCard size={20} className="inline-block mr-2" />
                          Thanh toán qua VNPay
                        </Radio>
                      </Space>
                    </Radio.Group>
                  </div>
                </div>

                {/* Cột Giỏ hàng (Phải) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                    Tóm tắt Đơn hàng
                  </h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {cart?.cartItems.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="flex justify-between items-center text-sm"
                      >
                        <div>
                          <p className="font-semibold">
                            {item.name} (x{item.quantity})
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.note || "..."}
                          </p>
                        </div>
                        <span className="font-semibold">
                          {(item.price || 0).toLocaleString()}đ
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Tổng cộng */}
                  <div className="flex justify-between font-bold text-xl mt-4 border-t pt-3">
                    <span>Tổng cộng:</span>
                    <span className="text-red-500">
                      {calculateTotal.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <Alert message={error} type="error" showIcon className="mt-4" />
              )}

              {/* Nút Submit */}
              <div className="mt-6 border-t pt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  danger
                  block
                  size="large"
                  loading={isLoading}
                >
                  {isLoading
                    ? "Đang xử lý..."
                    : paymentMethod === "VNPAY"
                    ? "Tiến hành Thanh toán VNPay"
                    : "Xác nhận Đặt hàng (COD)"}
                </Button>
              </div>
            </form>
          </div>
        </Spin>
      </div>
    </>
  );
}
