"use client";

import { X, LogOut, UserIcon, Package, Map, Settings } from "lucide-react"; // Thêm icon
import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import ProfileEditModal from "./profile-edit-modal";
import { Avatar } from "antd"; // Dùng Avatar của AntD cho đẹp

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMyOrders: () => void; // Prop để mở modal "Đơn hàng của tôi"
}

export default function UserProfileModal({
  isOpen,
  onClose,
  onOpenMyOrders, // <-- Lấy prop
}: UserProfileModalProps) {
  const { user, logout } = useAuth(); // Lấy user "thật"
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const handleLogout = () => {
    logout();
    onClose();
  };

  // Hàm "chuỗi modal"
  const handleOpenMyOrders = () => {
    onClose(); // Đóng modal này
    onOpenMyOrders(); // Mở modal "Đơn hàng của tôi"
  };

  if (!isOpen || !user) return null; // Dùng user "thật"

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
            <h2 className="text-2xl font-bold text-gray-900">
              Thông tin tài khoản
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* User Avatar and Info (SỬA LẠI DÙNG DATA THẬT) */}
            <div className="flex items-center gap-4">
              <Avatar size={64} icon={<UserIcon />} className="bg-red-500" />
              <div>
                <p className="text-sm text-gray-500">Tài khoản</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.fullName} {/* <-- Sửa: Dùng fullName */}
                </p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Menu Items (SỬA LẠI CÁC NÚT BẤM) */}
            <div className="space-y-2">
              <button
                onClick={() => setShowProfileEdit(true)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium flex items-center gap-3"
              >
                <UserIcon size={20} />
                Hồ sơ cá nhân
              </button>

              <button
                onClick={handleOpenMyOrders} // <-- SỬA: GỌI HÀM
                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium flex items-center gap-3"
              >
                <Package size={20} />
                Đơn hàng của tôi
              </button>

              <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium flex items-center gap-3">
                <Map size={20} />
                Địa chỉ giao hàng
              </button>

              <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium flex items-center gap-3">
                <Settings size={20} />
                Cài đặt
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Modal con (Giữ nguyên) */}
      {showProfileEdit && (
        <ProfileEditModal
          isOpen={showProfileEdit}
          onClose={() => setShowProfileEdit(false)}
        />
      )}
    </>
  );
}
