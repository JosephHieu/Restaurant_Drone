"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import ProductCard from "./product-card"
import AllProductsModal from "./all-products-modal"

const featuredProducts = [
  {
    id: 1,
    name: "Cơm gà xối mỡ",
    image: "/c-m-g--x-i-m-.jpg",
    discount: "-10%",
    price: 45000,
    originalPrice: 50000,
    description: "Cơm gà xối mỡ thơm ngon, gà mềm, cơm dẻo. Được nấu theo công thức truyền thống với gia vị đặc biệt.",
    rating: 4.8,
    reviews: 256,
    restaurant: "Cơm Tấm Sài Gòn",
  },
  {
    id: 2,
    name: "Bún bò Huế",
    image: "/b-n-b--hu-.jpg",
    discount: null,
    price: 55000,
    originalPrice: 55000,
    description: "Bún bò Huế nổi tiếng với nước dùng đậm đà, bò mềm, bún tươi. Ăn kèm rau sống và chả cua.",
    rating: 4.9,
    reviews: 312,
    restaurant: "Bún Bò Huế Ngon",
  },
  {
    id: 3,
    name: "Phở bò tái",
    image: "/ph--b--t-i.jpg",
    discount: null,
    price: 50000,
    originalPrice: 50000,
    description: "Phở bò tái nóng hổi với nước dùng được nấu từ xương bò suốt 12 tiếng, bò tái mềm, bánh phở mềm.",
    rating: 4.7,
    reviews: 189,
    restaurant: "Phở Gia Truyền",
  },
  {
    id: 4,
    name: "Cơm sườn bì chả",
    image: "/c-m-s--n-b--ch-.jpg",
    discount: "-16%",
    price: 42000,
    originalPrice: 50000,
    description: "Cơm sườn bì chả với sườn nướng vàng ươm, bì thơm, chả cua ngon. Ăn kèm nước mắm chua ngọt.",
    rating: 4.6,
    reviews: 198,
    restaurant: "Cơm Sườn Bì Chả",
  },
]

export default function FoodSection() {
  const [isAllProductsOpen, setIsAllProductsOpen] = useState(false)

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <AllProductsModal isOpen={isAllProductsOpen} onClose={() => setIsAllProductsOpen(false)} />
    </>
  )
}
