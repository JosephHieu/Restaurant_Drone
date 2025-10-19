"use client"; // 1. Thêm dòng này để biến nó thành Client Component

import { useState } from "react"; // 2. Import useState
import Navbar from "@/NavbarAndFooter/Navbar";
import PromoBar from "@/NavbarAndFooter/promo-bar";
import CategorySection from "./components/category-section";
import FoodSection from "./components/food-section";
import Footer from "@/NavbarAndFooter/Footer";
import LoginModal from "./components/login-modal"; // 3. Import LoginModal
export default function HomePage() {
  // 4. Tạo state và các hàm xử lý cho modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <>
      <PromoBar />
      {/* 5. Truyền hàm mở modal xuống cho Navbar */}
      <Navbar onLoginClick={handleOpenLoginModal} />
      <CategorySection />
      <FoodSection />
      <Footer />

      {/* 6. Render LoginModal và truyền state, hàm đóng xuống */}
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
    </>
  );
}
