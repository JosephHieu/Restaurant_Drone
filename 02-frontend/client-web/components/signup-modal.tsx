"use client";

import type React from "react";
import { useState } from "react";
// 1. THÊM ICON "User" VÀ "Phone"
import { X, Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AxiosError } from "axios"; // Import AxiosError

// Kiểu dữ liệu lỗi (khớp với backend)
interface ErrorResponse {
  message: string;
}

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function SignupModal({
  isOpen,
  onClose,
  onBackToLogin,
}: SignupModalProps) {
  const { register } = useAuth(); // Lấy hàm register "thật" từ context

  // 2. THÊM "name" VÀ "phone" VÀO STATE
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. VIẾT LẠI HOÀN TOÀN HÀM "handleSubmit"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Kiểm tra mật khẩu
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);

    try {
      // 4. GỌI HÀM REGISTER "THẬT" (ASYNC) TỪ AUTHCONTEXT
      // Hàm này (trong auth-context.tsx) sẽ gọi API POST /api/auth/register
      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.phone
      );

      // 5. XỬ LÝ KHI THÀNH CÔNG
      setIsLoading(false);
      setSuccess(true); // Hiển thị thông báo "Đăng ký thành công!"

      setTimeout(() => {
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          name: "",
          phone: "",
        });
        onClose(); // Đóng modal (vì đã đăng nhập)
      }, 2000); // Chờ 2 giây
    } catch (err) {
      // 6. XỬ LÝ KHI THẤT BẠI (BẮT LỖI 409 TỪ BACKEND)
      setIsLoading(false);

      if (err instanceof AxiosError && err.response) {
        // Lấy thông báo lỗi "đẹp" từ backend
        const backendMessage = (err.response.data as ErrorResponse)?.message;

        if (backendMessage) {
          // Hiển thị chính xác lỗi "Lỗi: Số điện thoại này đã được đăng ký."
          setError(backendMessage);
        } else {
          setError("Đã xảy ra lỗi không mong muốn.");
        }
      } else {
        setError("Đã xảy ra lỗi mạng. Vui lòng thử lại.");
      }
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
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Đăng ký</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
                Đăng ký thành công! Đang chuyển hướng...
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 7. THÊM TRƯỜNG HỌ TÊN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            {/* 8. THÊM TRƯỜNG SỐ ĐIỆN THOẠI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhập lại mật khẩu
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-semibold py-2 rounded-lg transition"
            >
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            {/* Back to Login Link */}
            <p className="text-center text-gray-600 text-sm">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Đăng nhập
              </button>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
