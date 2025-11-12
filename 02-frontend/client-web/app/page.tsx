"use client"; // <-- BẮT BUỘC: Phải là Client Component để quản lý state

import { useState } from "react"; // <-- 1. Import useState
import Header from "@/components/header";
import PromoBar from "@/components/promo-bar";
import CategorySection from "@/components/category-section";
import RestaurantSection from "@/components/restaurant-section";
import PromoCarousel from "@/components/promo-carousel";
import FoodSection from "@/components/food-section";
import Footer from "@/components/footer";
import RestaurantDetailModal from "@/components/restaurant-detail-modal"; // <-- 2. Import Modal mới

export default function Home() {
  // 3. TẠO STATE QUẢN LÝ
  // State này sẽ lưu ID của nhà hàng được chọn
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    number | null
  >(null);

  return (
    <main className="min-h-screen bg-white">
      <PromoBar />
      <Header />
      <PromoCarousel />
      <CategorySection />

      {/* 4. SỬA LỖI: TRUYỀN HÀM XUỐNG */}
      {/* Gửi hàm 'setSelectedRestaurantId' xuống cho 'RestaurantSection' */}
      <RestaurantSection
        onRestaurantClick={(id) => setSelectedRestaurantId(id)}
      />

      <FoodSection />
      <Footer />

      {/* 5. RENDER MODAL */}
      {/* Render Modal chi tiết. Nó sẽ tự động "mở" khi có ID */}
      <RestaurantDetailModal
        restaurantId={selectedRestaurantId}
        isOpen={selectedRestaurantId !== null}
        onClose={() => setSelectedRestaurantId(null)}
      />
    </main>
  );
}
