"use client";

import { useState } from "react";
import ProductDetailModal from "./product-detail-modal";
import type { MenuItem } from "@/types"; // <-- Import thật
import { Image } from "antd";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context"; // <-- Import hook thật
import { message } from "antd"; // <-- Import message

// Hàm tiện ích xây dựng URL ảnh
const getImageUrl = (imageUri: string | undefined): string => {
  if (!imageUri) return "https://via.placeholder.com/160?text=No+Image";
  return `http://localhost:8080/api/restaurants/images/${imageUri}`;
};

// Sửa Props: Dùng MenuItem
interface ProductCardProps {
  product: MenuItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart(); // <-- Lấy hàm thật

  // === THÊM HÀM NÀY ĐỂ SỬA LỖI ===
  // Xử lý khi nhấn nút "Thêm vào giỏ" (icon giỏ hàng)
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn modal chi tiết mở ra
    try {
      // Gọi hàm thật (truyền 2 tham số: MenuItem và số lượng)
      addToCart(product, 1);
    } catch (err) {
      message.error("Lỗi khi thêm vào giỏ hàng");
    }
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      >
        <div className="relative overflow-hidden bg-gray-100 h-40">
          <Image
            src={getImageUrl(product.imageUri)}
            alt={product.name}
            className="w-full h-full group-hover:scale-105 transition-transform"
            style={{ objectFit: "cover" }} // <-- Sửa lỗi CSS (dùng style)
            preview={false}
          />
          <button className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow">
            <Heart size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2 truncate">
            {product.restaurantName}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-red-500">
              {product.price.toLocaleString("vi-VN")}₫
            </span>
            {/* THÊM NÚT GIỎ HÀNG NHANH */}
            <button
              onClick={handleAddToCart} // <-- KẾT NỐI HÀM MỚI
              className="p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal chi tiết (đã sửa) */}
      {isModalOpen && (
        <ProductDetailModal
          product={product}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
