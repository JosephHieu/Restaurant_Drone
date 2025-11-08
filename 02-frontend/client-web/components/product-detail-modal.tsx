"use client";

import { X, Star, ShoppingCart, Heart, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import type { MenuItem } from "@/types"; // <-- 1. IMPORT INTERFACE THẬT
import { Image } from "antd"; // <-- 2. DÙNG COMPONENT ẢNH TỐI ƯU

// 3. XÓA BỎ INTERFACE "Product" GIẢ LẬP

// 4. TẠO HÀM TIỆN ÍCH XÂY DỰNG URL ẢNH
const getImageUrl = (imageUri: string | undefined): string => {
  if (!imageUri) return "https://via.placeholder.com/400?text=No+Image";
  // URL này phải khớp với API Gateway
  return `http://localhost:8080/api/restaurants/images/${imageUri}`;
};

// 5. SỬA LẠI PROPS: Đổi "Product" thành "MenuItem"
interface ProductDetailModalProps {
  product: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart(); // (Giả sử useCart() đã được cập nhật)

  if (!isOpen || !product) return null;

  // 6. SỬA LẠI LOGIC TÍNH TOÁN
  const totalPrice = product.price * quantity;

  const handleAddToCart = () => {
    // 7. SỬA LẠI DỮ LIỆU GỬI ĐI
    // (Lưu ý: bạn sẽ cần cập nhật cart-context để chấp nhận MenuItem)
    addToCart({
      id: product.itemId, // <-- Dùng itemId
      name: product.name,
      price: product.price,
      image: product.imageUri, // <-- Dùng imageUri
      quantity: quantity,
      // (Bỏ qua discount và originalPrice vì MenuItem không có)
    });
    setQuantity(1);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b flex items-center justify-between p-4 z-10">
            <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* 8. SỬA LẠI ẢNH */}
            <div className="relative mb-6 rounded-lg overflow-hidden bg-gray-100 h-80">
              <Image
                src={getImageUrl(product.imageUri)}
                alt={product.name}
                className="w-full h-full rounded-l-lg" // <-- Bỏ 'object-cover'
                style={{ objectFit: "cover" }} // <-- THÊM DÒNG NÀY
                preview={false}
              />
              {/* (Logic discount bị bỏ qua) */}
            </div>

            {/* Restaurant Info (Cần gọi API để lấy tên thật) */}
            <p className="text-sm text-gray-600 mb-4">
              Từ: Nhà hàng (ID: {product.restaurantId})
            </p>

            {/* (Rating - v0 dùng dữ liệu giả) */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < 4
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(128 đánh giá)</span>
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-6 leading-relaxed">
              {product.description || "Món ăn ngon, hấp dẫn."}
            </p>

            {/* Price Section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-red-500">
                  {product.price.toLocaleString("vi-VN")}₫
                </span>
                {/* (originalPrice bị bỏ qua) */}
              </div>
            </div>

            {/* Quantity Selector (Đã đúng) */}
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
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
              >
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
