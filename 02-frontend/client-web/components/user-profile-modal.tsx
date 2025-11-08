"use client"

import { X, LogOut, UserIcon } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useState } from "react"
import ProfileEditModal from "./profile-edit-modal"

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, logout } = useAuth()
  const [showProfileEdit, setShowProfileEdit] = useState(false)

  const handleLogout = () => {
    logout()
    onClose()
  }

  if (!isOpen || !user) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Thông tin tài khoản</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* User Avatar and Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <UserIcon size={32} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tài khoản</p>
                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              <button
                onClick={() => setShowProfileEdit(true)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
              >
                Hồ sơ cá nhân
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium">
                Đơn hàng của tôi
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium">
                Địa chỉ giao hàng
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium">
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

      {showProfileEdit && <ProfileEditModal isOpen={showProfileEdit} onClose={() => setShowProfileEdit(false)} />}
    </>
  )
}
