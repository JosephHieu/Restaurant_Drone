"use client";

import { useState } from "react";
import ProductDetailModal from "./product-detail-modal";
import type { MenuItem } from "@/types";
import { Image, message } from "antd";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";

// Không cần getImageUrl nữa – Cloudinary đã trả URL hoàn chỉnh
const safeImage = (uri?: string) =>
  uri || "https://via.placeholder.com/160?text=No+Image";

interface ProductCardProps {
  product: MenuItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn modal mở
    try {
      addToCart(product, 1);
      message.success("Đã thêm vào giỏ hàng!");
    } catch {
      message.error("Không thể thêm vào giỏ hàng.");
    }
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group"
      >
        <div className="relative overflow-hidden bg-gray-100 h-40">
          <Image
            src={safeImage(product.imageUri)}
            alt={product.name}
            preview={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "0.25s",
            }}
            className="group-hover:scale-105"
          />

          <button className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow">
            <Heart size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <span className="font-bold text-red-500">
              {product.price.toLocaleString("vi-VN")}₫
            </span>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ProductDetailModal
          product={product}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
