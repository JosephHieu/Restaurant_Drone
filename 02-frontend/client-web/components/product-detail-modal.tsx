"use client"

import { X, Star, ShoppingCart, Heart } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/context/cart-context"

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

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const { addToCart } = useCart()

  if (!isOpen || !product) return null

  const discountPercent = product.discount ? Number.parseInt(product.discount) : 0
  const totalPrice = product.price * quantity

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      discount: discountPercent,
      originalPrice: product.originalPrice,
    })
    // Reset quantity and close modal
    setQuantity(1)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b flex items-center justify-between p-4 z-10">
            <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Image */}
            <div className="relative mb-6 rounded-lg overflow-hidden bg-gray-100 h-80">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.discount && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-lg">
                  {product.discount}
                </div>
              )}
            </div>

            {/* Restaurant Info */}
            {product.restaurant && (
              <p className="text-sm text-gray-600 mb-4">
                Từ: <span className="font-semibold">{product.restaurant}</span>
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < (product.rating || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating || 4}.0 ({product.reviews || 128} đánh giá)
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-6 leading-relaxed">
              {product.description ||
                "Món ăn ngon, hấp dẫn với hương vị đặc trưng. Được chế biến từ những nguyên liệu tươi sạch, chất lượng cao."}
            </p>

            {/* Price Section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-red-500">{product.price.toLocaleString("vi-VN")}₫</span>
                {product.originalPrice !== product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    {product.originalPrice.toLocaleString("vi-VN")}₫
                  </span>
                )}
              </div>
              {discountPercent > 0 && (
                <p className="text-sm text-green-600 font-semibold">
                  Tiết kiệm {((product.originalPrice - product.price) * quantity).toLocaleString("vi-VN")}₫
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-gray-700 font-semibold">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  −
                </button>
                <span className="px-6 py-2 font-semibold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center justify-between">
              <span className="text-gray-700 font-semibold">Tổng cộng:</span>
              <span className="text-2xl font-bold text-red-500">{totalPrice.toLocaleString("vi-VN")}₫</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isFavorite
                    ? "bg-red-100 text-red-500 hover:bg-red-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                {isFavorite ? "Đã thích" : "Thích"}
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
              >
                <ShoppingCart size={20} />
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
