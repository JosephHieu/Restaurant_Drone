"use client";

import { X, Star, ShoppingCart, Heart } from "lucide-react";
import { useState, useEffect } from "react";
// 1. Import interface MenuItem từ file models của bạn
import { MenuItem } from "@/models/menuitem";

// 2. Cập nhật props để nhận vào một MenuItem
interface ProductDetailModalProps {
  menuItem: MenuItem | null; // Đổi tên và kiểu
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({
  menuItem,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Reset số lượng mỗi khi mở một sản phẩm mới
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen, menuItem]);

  if (!isOpen || !menuItem) return null;

  const totalPrice = menuItem.price * quantity;

  return (
    <>
      {/* Lớp nền mờ */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal chính */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b flex items-center justify-between p-4 z-10">
            <h2 className="text-xl font-bold text-gray-800">{menuItem.name}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Image */}
            <div className="relative mb-6 rounded-lg overflow-hidden bg-gray-100 h-80">
              {/* 3. Sử dụng 'imageUrl' từ menuItem */}
              <img
                src={menuItem.imageUrl || "/placeholder.svg"}
                alt={menuItem.name}
                className="w-full h-full object-cover"
              />
              {/* Phần giảm giá đã được xóa vì không có trong MenuItem */}
            </div>

            {/* Phần thông tin nhà hàng và đánh giá đã được xóa */}

            {/* Description */}
            <p className="text-gray-700 mb-6 leading-relaxed">
              {menuItem.description}
            </p>

            {/* Price Section - Đã được đơn giản hóa */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-red-500">
                  {menuItem.price.toLocaleString("vi-VN")}₫
                </span>
                {/* Phần giá gốc đã được xóa */}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-gray-700 font-semibold">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  −
                </button>
                <span className="px-6 py-2 font-semibold text-gray-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center justify-between">
              <span className="text-gray-700 font-semibold">Tổng cộng:</span>
              <span className="text-2xl font-bold text-red-500">
                {totalPrice.toLocaleString("vi-VN")}₫
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isFavorite
                    ? "bg-red-100 text-red-500 hover:bg-red-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                {isFavorite ? "Đã thích" : "Thích"}
              </button>
              <button className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors">
                <ShoppingCart size={20} />
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
