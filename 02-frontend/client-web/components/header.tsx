"use client";

import { useState } from "react";
import { MapPin, Search, ShoppingCart, User } from "lucide-react";
import LoginModal from "./login-modal";
import CartModal from "./cart-modal";
import UserProfileModal from "./user-profile-modal";
import CheckoutModal from "./checkout-modal";
import MyOrdersModal from "./my-orders-modal";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";

export default function Header() {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); // <-- STATE MỚI
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false); // Đóng giỏ hàng
    setIsCheckoutOpen(true); // Mở thanh toán
  };

  // Hàm này dùng khi nhấn "Thanh toán" (checkout) mà chưa đăng nhập
  const handleLoginAndCheckout = () => {
    setIsCartOpen(false);
    setIsLoginOpen(true);
    // (Sau khi login thành công, bạn có thể thêm logic để tự động mở checkout)
  };

  const handleOpenMyOrders = () => {
    setIsProfileOpen(false); // Đóng Profile
    setIsMyOrdersOpen(true); // Mở Đơn hàng
  };

  // === 3. HÀM MỚI (SAU KHI ĐẶT HÀNG COD) ===
  const handleCheckoutSuccess = () => {
    setIsCheckoutOpen(false); // Đóng Checkout
    setIsMyOrdersOpen(true); // Mở Đơn hàng
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold">
                <span className="text-red-500">Meal</span>
                <span className="text-black">MATE</span>
              </h1>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={20} className="text-red-500" />
              <div>
                <p className="text-xs text-gray-500">Giao đến</p>
                <p className="font-semibold">Quận 1, TP.HCM</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn, nhà hàng..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Cart and User */}
            <div className="flex items-center gap-6">
              <div
                className="relative cursor-pointer"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart
                  size={24}
                  className="text-gray-700 hover:text-red-500 transition"
                />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <User
                size={24}
                className="text-gray-700 cursor-pointer hover:text-red-500 transition"
                onClick={() =>
                  isAuthenticated
                    ? setIsProfileOpen(true)
                    : setIsLoginOpen(true)
                }
              />
            </div>
          </div>
        </div>
      </header>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        // 1. Truyền hàm xử lý khi "Chưa đăng nhập"
        onOpenLogin={handleLoginAndCheckout}
        // 2. Truyền hàm xử lý khi "Đã đăng nhập"
        onProceedToCheckout={handleProceedToCheckout}
      />
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenMyOrders={handleOpenMyOrders}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onCheckoutSuccess={handleCheckoutSuccess} // <-- 5. TRUYỀN HÀM XUỐNG
      />

      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
      />
    </>
  );
}
