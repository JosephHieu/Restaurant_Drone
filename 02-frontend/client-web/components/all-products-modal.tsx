"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import ProductCard from "./product-card"

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

interface AllProductsModalProps {
  isOpen: boolean
  onClose: () => void
}

const allProducts: Product[] = [
  {
    id: 1,
    name: "Cơm gà xối mỡ",
    image: "/c-m-g--x-i-m-.jpg",
    discount: "-10%",
    price: 45000,
    originalPrice: 50000,
    description: "Cơm gà xối mỡ thơm ngon, gà mềm, cơm dẻo.",
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
    description: "Bún bò Huế nổi tiếng với nước dùng đậm đà.",
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
    description: "Phở bò tái nóng hổi với nước dùng đặc biệt.",
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
    description: "Cơm sườn bì chả với sườn nướng vàng ươm.",
    rating: 4.6,
    reviews: 198,
    restaurant: "Cơm Sườn Bì Chả",
  },
  {
    id: 5,
    name: "Bánh mì thịt nạc",
    image: "/banh-mi-thit-nac.jpg",
    discount: "-5%",
    price: 25000,
    originalPrice: 28000,
    description: "Bánh mì thịt nạc giòn, chả cua, pâté.",
    rating: 4.5,
    reviews: 145,
    restaurant: "Bánh Mì Sài Gòn",
  },
  {
    id: 6,
    name: "Mì Quảng",
    image: "/mi-quang.jpg",
    discount: null,
    price: 40000,
    originalPrice: 40000,
    description: "Mì Quảng với nước dùng đặc trưng Quảng Nam.",
    rating: 4.7,
    reviews: 167,
    restaurant: "Mì Quảng Ngon",
  },
  {
    id: 7,
    name: "Cơm tấm sườn nướng",
    image: "/com-tam-suon-nuong.jpg",
    discount: "-8%",
    price: 38000,
    originalPrice: 42000,
    description: "Cơm tấm sườn nướng thơm lừng.",
    rating: 4.6,
    reviews: 201,
    restaurant: "Cơm Tấm Ngon",
  },
  {
    id: 8,
    name: "Hủ tiếu Nam Vang",
    image: "/hu-tieu-nam-vang.jpg",
    discount: null,
    price: 48000,
    originalPrice: 48000,
    description: "Hủ tiếu Nam Vang với nước dùng thanh ngọt.",
    rating: 4.8,
    reviews: 234,
    restaurant: "Hủ Tiếu Nam Vang",
  },
  {
    id: 9,
    name: "Gỏi cuốn tôm",
    image: "/goi-cuon-tom.jpg",
    discount: "-12%",
    price: 32000,
    originalPrice: 36000,
    description: "Gỏi cuốn tôm tươi, rau sống.",
    rating: 4.4,
    reviews: 98,
    restaurant: "Gỏi Cuốn Ngon",
  },
  {
    id: 10,
    name: "Cơm chiên dương châu",
    image: "/com-chien-duong-chau.jpg",
    discount: null,
    price: 45000,
    originalPrice: 45000,
    description: "Cơm chiên dương châu với tôm, cua, trứng.",
    rating: 4.7,
    reviews: 178,
    restaurant: "Cơm Chiên Ngon",
  },
  {
    id: 11,
    name: "Bún chả Hà Nội",
    image: "/bun-cha-ha-noi.jpg",
    discount: "-10%",
    price: 42000,
    originalPrice: 47000,
    description: "Bún chả Hà Nội với thịt nướng thơm.",
    rating: 4.6,
    reviews: 156,
    restaurant: "Bún Chả Hà Nội",
  },
  {
    id: 12,
    name: "Canh chua cá",
    image: "/canh-chua-ca.jpg",
    discount: null,
    price: 52000,
    originalPrice: 52000,
    description: "Canh chua cá với cà chua, dứa tươi.",
    rating: 4.5,
    reviews: 112,
    restaurant: "Canh Chua Ngon",
  },
  {
    id: 13,
    name: "Lẩu Thái",
    image: "/lau-thai.jpg",
    discount: "-15%",
    price: 65000,
    originalPrice: 75000,
    description: "Lẩu Thái cay nồng với nước dùng đặc biệt.",
    rating: 4.8,
    reviews: 289,
    restaurant: "Lẩu Thái Ngon",
  },
  {
    id: 14,
    name: "Tôm hùm nướng",
    image: "/tom-hum-nuong.jpg",
    discount: null,
    price: 120000,
    originalPrice: 120000,
    description: "Tôm hùm nướng tươi sống.",
    rating: 4.9,
    reviews: 267,
    restaurant: "Hải Sản Ngon",
  },
  {
    id: 15,
    name: "Cơm cà ri gà",
    image: "/com-ca-ri-ga.jpg",
    discount: "-7%",
    price: 48000,
    originalPrice: 52000,
    description: "Cơm cà ri gà thơm lừng.",
    rating: 4.6,
    reviews: 134,
    restaurant: "Cà Ri Ngon",
  },
  {
    id: 16,
    name: "Bánh xèo",
    image: "/banh-xeo.jpg",
    discount: "-10%",
    price: 35000,
    originalPrice: 39000,
    description: "Bánh xèo giòn rụm với tôm, thịt.",
    rating: 4.7,
    reviews: 189,
    restaurant: "Bánh Xèo Ngon",
  },
  {
    id: 17,
    name: "Mực nướng muối ớt",
    image: "/muc-nuong-muoi-ot.jpg",
    discount: null,
    price: 85000,
    originalPrice: 85000,
    description: "Mực nướng muối ớt tươi ngon.",
    rating: 4.8,
    reviews: 201,
    restaurant: "Hải Sản Tươi",
  },
  {
    id: 18,
    name: "Cơm tấm trứng ốp la",
    image: "/com-tam-trung-op-la.jpg",
    discount: "-6%",
    price: 32000,
    originalPrice: 35000,
    description: "Cơm tấm trứng ốp la nóng hổi.",
    rating: 4.5,
    reviews: 145,
    restaurant: "Cơm Tấm Sài Gòn",
  },
  {
    id: 19,
    name: "Chả cá Lã Vọng",
    image: "/cha-ca-la-vong.jpg",
    discount: "-12%",
    price: 58000,
    originalPrice: 66000,
    description: "Chả cá Lã Vọng với nước mắm chua ngọt.",
    rating: 4.7,
    reviews: 178,
    restaurant: "Chả Cá Lã Vọng",
  },
  {
    id: 20,
    name: "Cơm chiên cua",
    image: "/placeholder.svg?height=160&width=160",
    discount: "-9%",
    price: 50000,
    originalPrice: 55000,
    description: "Cơm chiên cua với thịt cua tươi.",
    rating: 4.6,
    reviews: 167,
    restaurant: "Cơm Chiên Ngon",
  },
]

export default function AllProductsModal({ isOpen, onClose }: AllProductsModalProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const totalPages = Math.ceil(allProducts.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = allProducts.slice(startIndex, endIndex)

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold text-gray-800">Tất cả sản phẩm</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Products Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
              Trước
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                    currentPage === page ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Page Info */}
          <div className="text-center mt-4 text-gray-600">
            Trang {currentPage} / {totalPages}
          </div>
        </div>
      </div>
    </div>
  )
}
