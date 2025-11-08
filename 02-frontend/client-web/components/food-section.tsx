"use client";

import { useState, useEffect } from "react"; // <-- THÊM useEffect
import { ChevronRight } from "lucide-react";
import ProductCard from "./product-card";
import AllProductsModal from "./all-products-modal";
import api from "@/services/api"; // <-- IMPORT API
import type { MenuItem } from "@/types"; // <-- IMPORT KIỂU THẬT

// XÓA BỎ MẢNG "featuredProducts" (DỮ LIỆU GIẢ)

export default function FoodSection() {
  const [isAllProductsOpen, setIsAllProductsOpen] = useState(false);

  // TẠO STATE MỚI ĐỂ LƯU DỮ LIỆU THẬT
  const [featuredProducts, setFeaturedProducts] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // GỌI API KHI TẢI TRANG
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setIsLoading(true);
      try {
        // Gọi API mới tạo (lấy TẤT CẢ món)
        const response = await api.get<MenuItem[]>(
          "/api/menu-items/public/all"
        );

        // Chỉ lấy 4 món đầu tiên để làm "Nổi bật"
        setFeaturedProducts(response.data.slice(0, 8));
      } catch (err) {
        console.error("Lỗi khi tải món ăn nổi bật:", err);
        setError("Không thể tải món ăn.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []); // Chạy 1 lần khi tải

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <h2 className="text-2xl font-bold text-gray-800">Hôm nay ăn gì?</h2>
          </div>
          <button
            onClick={() => setIsAllProductsOpen(true)}
            className="text-red-500 font-semibold flex items-center gap-1 hover:text-red-600 transition-colors"
          >
            Xem tất cả <ChevronRight size={20} />
          </button>
        </div>

        {/* XỬ LÝ LOADING VÀ LỖI */}
        {isLoading ? (
          <div className="text-center p-10">Đang tải...</div>
        ) : error ? (
          <div className="text-center p-10 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* DÙNG DỮ LIỆU THẬT TỪ STATE */}
            {featuredProducts.map((product) => (
              <ProductCard key={product.itemId} product={product} />
            ))}
          </div>
        )}
      </section>

      <AllProductsModal
        isOpen={isAllProductsOpen}
        onClose={() => setIsAllProductsOpen(false)}
      />
    </>
  );
}
