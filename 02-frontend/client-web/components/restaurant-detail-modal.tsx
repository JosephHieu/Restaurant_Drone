"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { Spin, Alert, Typography, Image, Tag, Divider, Row, Col } from "antd"; // Thêm Row/Col
import { X, Star, MapPin } from "lucide-react";
import type { Restaurant, MenuItem } from "@/types";
import ProductCard from "./product-card";

const { Title, Text, Paragraph } = Typography;

// === SỬA LẠI HÀM NÀY ===
const getRestaurantImageUrl = (imageUri: string | undefined): string => {
  if (imageUri) {
    return `http://localhost:8080/api/restaurants/images/${imageUri}`;
  }
  return "https://via.placeholder.com/1200x300?text=FoodFast+Restaurant";
};
// ========================

interface RestaurantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: number | null;
}

export default function RestaurantDetailModal({
  isOpen,
  onClose,
  restaurantId,
}: RestaurantDetailModalProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tải dữ liệu (Info + Menu) khi modal mở
  useEffect(() => {
    if (isOpen && restaurantId) {
      const fetchRestaurantData = async () => {
        setLoading(true);
        setError("");
        try {
          // (Logic gọi 2 API: GET /api/restaurants/{id} và GET /api/restaurants/{id}/menu)
          const resPromise = api.get<Restaurant>(
            `/api/restaurants/${restaurantId}`
          );
          const menuPromise = api.get<MenuItem[]>(
            `/api/restaurants/${restaurantId}/menu`
          );
          const [resResponse, menuResponse] = await Promise.all([
            resPromise,
            menuPromise,
          ]);

          setRestaurant(resResponse.data);
          setMenu(menuResponse.data);
        } catch (err) {
          setError("Không thể tải thông tin nhà hàng.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchRestaurantData();
    }
  }, [isOpen, restaurantId]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? "Đang tải..." : restaurant?.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {loading ? (
              <div className="text-center p-10">
                <Spin tip="Đang tải..." />
              </div>
            ) : error ? (
              <Alert message="Lỗi" description={error} type="error" showIcon />
            ) : (
              restaurant && (
                <>
                  {/* 1. Phần Banner/Thông tin Nhà hàng */}
                  <div className="relative mb-4">
                    <div style={{ textAlign: "center" }}>
                      <Image
                        src={getRestaurantImageUrl(restaurant?.coverImageUri)}
                        alt={restaurant.name}
                        className="h-48 object-cover rounded-lg"
                        preview={false}
                      />
                    </div>
                    <Tag
                      color="green"
                      className="absolute top-4 left-4 font-bold"
                    >
                      {restaurant.status.toUpperCase()}
                    </Tag>
                  </div>
                  <Title level={3}>{restaurant.name}</Title>
                  <div className="flex items-center gap-1 text-md text-gray-600 mb-2">
                    <MapPin size={18} className="text-red-500" />
                    {restaurant.address}
                  </div>
                  <div className="flex items-center gap-1 text-md text-gray-600 mb-4">
                    <Star
                      size={18}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="font-semibold">
                      {restaurant.rating || "Mới"}
                    </span>
                    <span className="text-gray-500">(50+ đánh giá)</span>
                  </div>
                  <Paragraph type="secondary">
                    {restaurant.description}
                  </Paragraph>

                  <Divider />

                  {/* 2. Phần Thực đơn (Menu) */}
                  <Title level={4}>Thực đơn</Title>
                  {menu.length === 0 ? (
                    <Alert
                      message="Nhà hàng này hiện chưa có món ăn nào."
                      type="info"
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {menu.map((item) => (
                        <ProductCard key={item.itemId} product={item} />
                      ))}
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
