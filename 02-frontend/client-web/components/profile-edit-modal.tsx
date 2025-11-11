"use client";

import type React from "react";
import { useState, useEffect } from "react"; // <-- Thêm useEffect
import { X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { message, Spin, Alert } from "antd"; // <-- Import antd
import { AxiosError } from "axios";

// Kiểu dữ liệu lỗi (khớp với backend)
interface ErrorResponse {
  message: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
}: ProfileEditModalProps) {
  const { user, updateProfile } = useAuth(); // <-- Lấy hàm "thật"

  // 1. SỬA STATE:
  const [formData, setFormData] = useState({
    fullName: "", // <-- Đổi 'name' thành 'fullName'
    phone: "",
    address: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 2. THÊM useEffect: Tự động điền form khi user được tải
  useEffect(() => {
    // Chỉ điền form nếu modal đang mở VÀ user đã được tải
    if (isOpen && user) {
      setFormData({
        fullName: user.fullName || "", // Dùng fullName, || "" để tránh lỗi null
        phone: user.phone || "", // Dùng || "" để tránh lỗi controlled
        address: user.address || "", // Dùng || "" để tránh lỗi controlled
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user, isOpen]); // Cập nhật khi modal mở hoặc user thay đổi

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  // === 3. SỬA HÀM "handleSave" (Async/Await) ===
  const handleSave = async () => {
    setError("");
    setSuccess("");

    // (Bỏ qua logic đổi mật khẩu ở đây vì API /me không hỗ trợ)
    if (formData.newPassword) {
      setError("Tính năng đổi mật khẩu đang được phát triển.");
      return;
    }

    setIsLoading(true);
    try {
      // Gọi hàm async "thật" từ Context
      await updateProfile({
        fullName: formData.fullName, // <-- Sửa: Dùng fullName
        phone: formData.phone,
        address: formData.address,
      });

      setSuccess("Cập nhật thông tin thành công!");
      setTimeout(() => {
        onClose(); // Đóng modal
        setSuccess(""); // Xóa thông báo
      }, 1500);
    } catch (err) {
      // Bắt lỗi (ví dụ: SĐT trùng)
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data as ErrorResponse;
        setError(errorData.message || "Cập nhật thất bại.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Cập nhật thất bại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
            <h2 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <Spin spinning={isLoading}>
            <div className="p-6 space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email} // (user.email luôn có)
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  name="fullName" // <-- SỬA: "fullName"
                  value={formData.fullName} // <-- SỬA: "fullName"
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone} // (Đã được || "" trong state)
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address} // (Đã được || "" trong state)
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* (Tạm thời bỏ qua phần đổi mật khẩu) */}

              {/* Error Message */}
              {error && <Alert message={error} type="error" showIcon />}

              {/* Success Message */}
              {success && <Alert message={success} type="success" showIcon />}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition disabled:bg-gray-400"
                >
                  {isLoading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </Spin>
        </div>
      </div>
    </>
  );
}
