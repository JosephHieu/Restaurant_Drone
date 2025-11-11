"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import ProductCard from "./product-card";
import AllProductsModal from "./all-products-modal";
import api from "@/services/api";
import type { MenuItem, Restaurant } from "@/types"; // <-- 1. IMPORT "Restaurant"
import { Select, Spin, Alert } from "antd"; // <-- 2. IMPORT "Select"

const { Option } = Select;

export default function FoodSection() {
  const [isAllProductsOpen, setIsAllProductsOpen] = useState(false);

  // 3. TẠO STATE MỚI
  const [products, setProducts] = useState<MenuItem[]>([]); // State cho món ăn
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]); // State cho bộ lọc
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    number | "all"
  >("all"); // State cho giá trị lọc

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 4. TẠO useEffect (MỚI) ĐỂ TẢI DANH SÁCH NHÀ HÀNG (CHO BỘ LỌC)
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        // Gọi API public lấy các quán đang 'open'
        // (API này đã có trong RestaurantController)
        const response = await api.get<Restaurant[]>("/api/restaurants");
        setRestaurants(response.data);
      } catch (err) {
        console.error("Lỗi khi tải nhà hàng:", err);
        // Không báo lỗi nặng, chỉ là không có bộ lọc
      }
    };
    fetchRestaurants();
  }, []); // Chạy 1 lần khi tải

  // 5. SỬA LẠI useEffect (CŨ) ĐỂ TẢI MÓN ĂN DỰA TRÊN BỘ LỌC
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setIsLoading(true);
      setError("");
      try {
        // Xây dựng URL động
        let url = "/api/menu-items/public/all";

        // Nếu không phải "Tất cả", thêm tham số
        if (selectedRestaurantId !== "all") {
          url += `?restaurantId=${selectedRestaurantId}`;
        }

        const response = await api.get<MenuItem[]>(url);
        // Lấy 8 món đầu tiên (giới hạn của bạn)
        setProducts(response.data.slice(0, 8));
      } catch (err) {
        console.error("Lỗi khi tải món ăn nổi bật:", err);
        setError("Không thể tải món ăn.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, [selectedRestaurantId]); // <-- 6. CHẠY LẠI KHI BỘ LỌC THAY ĐỔI

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          {/* Tiêu đề */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <h2 className="text-2xl font-bold text-gray-800">Hôm nay ăn gì?</h2>
          </div>

          {/* 7. THÊM BỘ LỌC (SELECTOR) */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Lọc theo:</span>
            <Select
              style={{ width: 250 }}
              value={selectedRestaurantId}
              onChange={(value) => setSelectedRestaurantId(value)} // <-- Cập nhật state
            >
              <Option value="all">Tất cả nhà hàng</Option>
              {restaurants.map((r) => (
                <Option key={r.restaurantId} value={r.restaurantId}>
                  {r.name}
                </Option>
              ))}
            </Select>

            <button
              onClick={() => setIsAllProductsOpen(true)}
              className="text-red-500 font-semibold flex items-center gap-1 hover:text-red-600 transition-colors ml-4"
            >
              Xem tất cả <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* XỬ LÝ LOADING VÀ LỖI */}
        {isLoading ? (
          <div className="text-center p-10">
            <Spin size="large" />
          </div>
        ) : error ? (
          <div className="p-10">
            <Alert message="Lỗi" description={error} type="error" showIcon />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.itemId} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* (Bạn cũng cần cập nhật 'all-products-modal' để nhận 'selectedRestaurantId' làm prop) */}
      <AllProductsModal
        isOpen={isAllProductsOpen}
        onClose={() => setIsAllProductsOpen(false)}
      />
    </>
  );
}
