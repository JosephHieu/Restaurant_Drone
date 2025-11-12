"use client";

import { Star, MapPin } from "lucide-react";
import type { Restaurant } from "@/types"; // Import interface Restaurant
import { Image } from "antd";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

// 1. SỬA LẠI HÀM NÀY:
// (Vì không có coverImage, chúng ta tạm thời trả về một ảnh giữ chỗ)
const getRestaurantImageUrl = (imageUri: string | undefined): string => {
  // 1. Nếu có ảnh bìa (từ CSDL), dùng nó
  if (imageUri) {
    return `http://localhost:8080/api/restaurants/images/${imageUri}`;
  }

  // 2. Nếu không, dùng ảnh giữ chỗ
  return "https://via.placeholder.com/280x180?text=FoodFast+Restaurant";
};

export default function RestaurantCard({
  restaurant,
  onClick,
}: RestaurantCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md cursor-pointer group"
    >
      <div className="relative overflow-hidden bg-gray-100 h-40">
        <Image
          src={getRestaurantImageUrl(restaurant.coverImageUri)} // <-- 2. SỬA LẠI: Không truyền gì vào đây
          alt={restaurant.name}
          className="w-full h-full group-hover:scale-105 transition-transform"
          style={{ objectFit: "cover" }}
          preview={false}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 truncate mb-1">
          {restaurant.name}
        </h3>

        {/* (Dữ liệu rating này là giả lập, vì CSDL của bạn chưa có) */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">{restaurant.rating || "Mới"}</span>
          <span>(50+ đánh giá)</span>
        </div>

        <p className="text-sm text-gray-600 truncate flex items-center gap-1">
          <MapPin size={14} /> {restaurant.address}
        </p>
      </div>
    </div>
  );
}
