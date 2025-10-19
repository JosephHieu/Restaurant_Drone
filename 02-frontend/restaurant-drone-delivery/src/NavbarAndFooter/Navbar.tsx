"use client";

import { useState } from "react";
import { MapPin, Search, ShoppingCart, User } from "lucide-react";

// 1. Định nghĩa kiểu cho props mới
interface HeaderProps {
  onLoginClick: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
  const [cartCount] = useState(2);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/75 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold">
              <span className="text-red-500">Meal</span>
              <span className="text-black">Drone</span>
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
            <div className="relative cursor-pointer">
              <ShoppingCart size={24} className="text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            {/* 2. Thêm sự kiện onClick vào biểu tượng User */}
            <div onClick={onLoginClick} className="cursor-pointer">
              <User size={24} className="text-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
