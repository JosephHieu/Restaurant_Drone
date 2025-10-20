"use client";

import { ChevronRight } from "lucide-react";
import ProductCard from "./product-card";
import ProductDetailModal from "./product-detail-modal"; // 1. Import Modal
import { useState, useEffect } from "react";
import { MenuItem } from "@/models/menuitem";

export default function FoodSection() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Tạo state để quản lý món ăn đang được chọn
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    // ... logic fetch dữ liệu của bạn giữ nguyên ...
    const fetchMenuItems = async () => {
      try {
        const restaurantId = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
        const apiUrl = `http://localhost:8080/api/restaurants/${restaurantId}/menu-items`;
        const response = await fetch(apiUrl);
        if (!response.ok)
          throw new Error(`Lỗi HTTP! Status: ${response.status}`);
        const dataFromApi: MenuItem[] = await response.json();
        setMenuItems(dataFromApi);
      } catch (error: unknown) {
        if (error instanceof Error) setError(error.message);
        else setError("Đã xảy ra một lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  // 3. Tạo các hàm để xử lý việc mở và đóng modal
  const handleOpenModal = (menuItem: MenuItem) => {
    setSelectedItem(menuItem);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  if (loading)
    return <p className="text-center py-8">Đang tải các món ngon...</p>;
  if (error)
    return (
      <p className="text-center py-8 text-red-500">Đã xảy ra lỗi: {error}</p>
    );

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* ... Tiêu đề section giữ nguyên ... */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {menuItems.map((item) => (
          <ProductCard
            key={item.id}
            menuItem={item}
            // 4. Truyền hàm xử lý click xuống cho mỗi ProductCard
            onCardClick={() => handleOpenModal(item)}
          />
        ))}
      </div>

      {/* 5. Render Modal ở đây */}
      <ProductDetailModal
        isOpen={!!selectedItem} // Modal sẽ mở nếu selectedItem không phải là null
        onClose={handleCloseModal}
        menuItem={selectedItem}
      />
    </section>
  );
}
