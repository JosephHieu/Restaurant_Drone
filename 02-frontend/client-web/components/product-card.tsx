"use client";

import { useState } from "react";
import ProductDetailModal from "./product-detail-modal";
import type { MenuItem } from "@/types"; // <-- 1. IMPORT INTERFACE THẬT
import { Image } from "antd"; // <-- 2. DÙNG COMPONENT ẢNH TỐI ƯU

// 3. XÓA BỎ INTERFACE "Product" GIẢ LẬP

// 4. TẠO HÀM TIỆN ÍCH XÂY DỰNG URL ẢNH
const getImageUrl = (imageUri: string | undefined): string => {
  if (!imageUri) return "https://via.placeholder.com/160?text=No+Image";
  // URL này phải khớp với API Gateway
  return `http://localhost:8080/api/restaurants/images/${imageUri}`;
};

// 5. SỬA LẠI PROPS: Đổi "Product" thành "MenuItem"
export default function ProductCard({ product }: { product: MenuItem }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      >
        <div className="relative overflow-hidden bg-gray-100 h-40">
          {/* 6. SỬA LẠI COMPONENT ẢNH VÀ TRƯỜNG DỮ LIỆU */}
          <Image
            src={getImageUrl(product.imageUri)}
            alt={product.name}
            className="w-full h-full group-hover:scale-105 transition-transform" // <-- Bỏ 'object-cover'
            style={{ objectFit: "cover" }} // <-- THÊM DÒNG NÀY
            preview={false}
          />
          {/* (Logic giảm giá - bạn có thể thêm lại sau nếu backend hỗ trợ) */}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-500">
              {product.price.toLocaleString("vi-VN")}₫
            </span>
            {/* (Bỏ logic originalPrice vì MenuItem không có) */}
          </div>
        </div>
      </div>

      {/* 7. LƯU Ý: File "ProductDetailModal" CŨNG SẼ CẦN SỬA LẠI */}
      {/* Nó cũng đang nhận "Product" thay vì "MenuItem" */}
      {/* <ProductDetailModal product={product} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} /> */}

      {/* Tạm thời vô hiệu hóa Modal chi tiết để sửa lỗi */}
      {isModalOpen && (
        <ProductDetailModal
          product={product} // Truyền MenuItem vào
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
