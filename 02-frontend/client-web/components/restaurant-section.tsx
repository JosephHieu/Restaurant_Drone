"use client";

import { useState, useEffect } from "react";
import RestaurantCard from "./restaurant-card"; // <-- 1. Import Card
import api from "@/services/api";
import type { Restaurant } from "@/types";
import { Spin, Alert } from "antd";

// 2. NHẬN PROP TỪ 'page.tsx' (trang chủ)
interface RestaurantSectionProps {
  onRestaurantClick: (id: number) => void;
}

export default function RestaurantSection({
  onRestaurantClick,
}: RestaurantSectionProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        // Gọi API public lấy các quán đang 'open' (Đã đúng)
        const response = await api.get<Restaurant[]>("/api/restaurants");
        setRestaurants(response.data);
      } catch (err) {
        console.error("Lỗi khi tải nhà hàng:", err);
        setError("Không thể tải danh sách nhà hàng.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurants();
  }, []); // Chạy 1 lần khi tải

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Nhà hàng nổi bật</h2>
        {/* (Có thể thêm nút "Xem tất cả" ở đây) */}
      </div>

      {isLoading ? (
        <div className="text-center p-10">
          <Spin size="large" />
        </div>
      ) : error ? (
        <div className="p-10">
          <Alert message="Lỗi" description={error} type="error" showIcon />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            // 3. TRUYỀN HÀM XUỐNG 'RestaurantCard'
            <RestaurantCard
              key={restaurant.restaurantId}
              restaurant={restaurant}
              onClick={() => onRestaurantClick(restaurant.restaurantId)} // <-- SỬA LỖI Ở ĐÂY
            />
          ))}
        </div>
      )}
    </section>
  );
}
