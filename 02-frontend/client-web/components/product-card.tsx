"use client"

import { useState } from "react"
import ProductDetailModal from "./product-detail-modal"

interface Product {
  id: number
  name: string
  image: string
  discount?: string | null
  price: number
  originalPrice: number
  description?: string
  rating?: number
  reviews?: number
  restaurant?: string
}

export default function ProductCard({ product }: { product: Product }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      >
        <div className="relative overflow-hidden bg-gray-100 h-40">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          {product.discount && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded font-bold text-sm">
              {product.discount}
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-500">{product.price.toLocaleString("vi-VN")}₫</span>
            {product.originalPrice !== product.price && (
              <span className="text-xs text-gray-400 line-through">
                {product.originalPrice.toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>
        </div>
      </div>

      <ProductDetailModal product={product} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
