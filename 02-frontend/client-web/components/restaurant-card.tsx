"use client";

import { Star, MapPin } from "lucide-react";
import type { Restaurant } from "@/types";
import { Image } from "antd";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

// 1. Không cần gọi API Gateway nữa – chỉ cần trả về URL Cloudinary
const getRestaurantImageUrl = (uri?: string) =>
  uri || "https://via.placeholder.com/280x180?text=FoodFast+Restaurant";

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
          src={getRestaurantImageUrl(restaurant.coverImageUri)}
          alt={restaurant.name}
          preview={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "0.25s",
          }}
          className="group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 truncate mb-1">
          {restaurant.name}
        </h3>

        {/* Rating tạm thời */}
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
