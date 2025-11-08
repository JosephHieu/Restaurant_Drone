"use client";

import type React from "react";
import { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import SignupModal from "./signup-modal";
import ForgotPasswordModal from "./forgot-password-modal";

// 1. IMPORT API SERVICE VÀ KIỂU DỮ LIỆU LỖI
import api from "@/services/api";
import { AxiosError } from "axios";

interface ErrorResponse {
  message: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  // 2. SỬA LẠI: AuthContext "thật" của bạn sẽ trả về token
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // === 3. SỬA LẠI TOÀN BỘ HÀM "handleSubmit" ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Gọi API backend thật (port 8080)
      const response = await api.post("/api/auth/login", {
        email: email,
        password: password,
      });

      // 2. Lấy token
      const token = response.data.accessToken;

      // 3. Gọi hàm login của AuthContext (để lưu token và user)
      await login(token);

      // 4. Thành công
      setIsLoading(false);
      setEmail("");
      setPassword("");
      onClose(); // Đóng modal
    } catch (err) {
      // 5. Xử lý lỗi (giống hệt admin-web)
      setIsLoading(false);
      if (err instanceof AxiosError && err.response) {
        const status = err.response.status;
        const backendMessage = (err.response.data as ErrorResponse)?.message;

        if (status === 403) {
          // 403 Forbidden
          setError(backendMessage || "Tài khoản này đã bị cấm.");
        } else {
          // 401 (Sai pass) hoặc 404 (Không tìm thấy user)
          setError(backendMessage || "Email hoặc mật khẩu không chính xác.");
        }
      } else {
        setError("Đã xảy ra lỗi mạng. Vui lòng thử lại.");
      }
    }
  };
  // ===================================

  if (!isOpen) return null;

  return (
    <>
      {/* Các Modal con vẫn được render */}
      <SignupModal
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        onBackToLogin={() => {
          setShowSignup(false);
        }}
      />
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => setShowForgotPassword(false)}
      />

      {/* Backdrop (màn che mờ) */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* === 4. SỬA LỖI GIAO DIỆN BỊ CHỒNG === */}
      {/* Chỉ hiển thị Modal Đăng nhập nếu Modal Đăng ký và Quên MK đang TẮT */}
      {!showSignup && !showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-gray-700">Nhớ mật khẩu</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)} // <-- Kích hoạt ẩn
                  className="text-red-500 hover:text-red-600 font-medium"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-semibold py-2 rounded-lg transition"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">hoặc</span>
                </div>
              </div>

              {/* Social Login (v0) */}
              <button
                type="button"
                className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                {/* ... (SVG) ... */}
                Google
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-gray-600 text-sm">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => setShowSignup(true)} // <-- Kích hoạt ẩn
                  className="text-red-500 hover:text-red-600 font-medium"
                >
                  Đăng ký ngay
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
