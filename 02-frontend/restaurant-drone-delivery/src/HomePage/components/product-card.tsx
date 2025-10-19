"use client";

import { MenuItem } from "@/models/menuitem";

// 1. Cập nhật props để nhận thêm hàm onCardClick
interface ProductCardProps {
  menuItem: MenuItem;
  onCardClick: () => void; // Hàm không có tham số và không trả về gì
}

export default function ProductCard({
  menuItem,
  onCardClick,
}: ProductCardProps) {
  return (
    // 2. Thêm sự kiện onClick vào thẻ div ngoài cùng
    <div
      onClick={onCardClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="relative overflow-hidden bg-gray-100 h-40">
        <img
          src={menuItem.imageUrl || "/placeholder.svg"}
          alt={menuItem.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">
          {menuItem.name}
        </h3>
        <div className="flex items-center">
          <span className="font-bold text-red-500">
            {menuItem.price.toLocaleString("vi-VN")}₫
          </span>
        </div>
      </div>
    </div>
  );
}
