"use client";

import {
  ChefHat,
  Soup,
  Flame,
  Utensils,
  Droplet,
  Bot as Pot,
  Crown,
  Trash2,
} from "lucide-react";

const categories = [
  { id: 1, name: "Cơm trưa", icon: ChefHat, count: 45 },
  { id: 2, name: "Bún/Phở", icon: Soup, count: 32 },
  { id: 3, name: "Món chay", icon: Flame, count: 28 },
  { id: 4, name: "Ăn vặt", icon: Utensils, count: 56 },
  { id: 5, name: "Nước uống", icon: Droplet, count: 38 },
  { id: 6, name: "Lẩu", icon: Pot, count: 15 },
  { id: 7, name: "Bánh ngọt", icon: Crown, count: 24 },
  { id: 8, name: "Đồ ăn sáng", icon: Trash2, count: 20 },
];

export default function CategorySection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh mục món ăn</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.id}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-red-600 transition-colors">
                <Icon size={32} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-800 text-center">
                {category.name}
              </p>
              <p className="text-xs text-gray-500">{category.count} món</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
