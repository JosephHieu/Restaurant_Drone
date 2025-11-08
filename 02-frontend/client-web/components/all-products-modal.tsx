"use client";

import { useState, useEffect } from "react"; // <-- THÊM useEffect
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./product-card";
import api from "@/services/api"; // <-- 1. IMPORT API SERVICE
import type { MenuItem } from "@/types"; // <-- 2. IMPORT INTERFACE THẬT

interface AllProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 3. XÓA BỎ TOÀN BỘ MẢNG "allProducts" (DỮ LIỆU GIẢ)

export default function AllProductsModal({
  isOpen,
  onClose,
}: AllProductsModalProps) {
  // 4. TẠO STATE CHO DỮ LIỆU THẬT
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 5. GỌI API KHI COMPONENT MỞ RA
  useEffect(() => {
    if (isOpen) {
      const fetchAllProducts = async () => {
        setIsLoading(true);
        setError("");
        try {
          // 6. GỌI API BACKEND THẬT
          // (Giả sử bạn có API GET /api/menu-items trả về tất cả món ăn)
          const response = await api.get<MenuItem[]>(
            "/api/menu-items/public/all"
          ); // <-- Sửa đường dẫn API nếu cần
          setProducts(response.data);
        } catch (err) {
          console.error("Lỗi khi tải sản phẩm:", err);
          setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchAllProducts();
    }
  }, [isOpen]); // Chạy lại khi modal được mở

  // 7. TÍNH TOÁN DỰA TRÊN DỮ LIỆU THẬT (STATE)
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold text-gray-800">Tất cả sản phẩm</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 8. XỬ LÝ TRẠNG THÁI LOADING VÀ LỖI */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center p-10">Đang tải sản phẩm...</div> // (Hoặc dùng component Spin)
          ) : error ? (
            <div className="text-center p-10 text-red-500">{error}</div> // (Hoặc dùng component Alert)
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {currentProducts.map((product) => (
                  // 9. TRUYỀN DỮ LIỆU "MenuItem" VÀO "ProductCard"
                  // (Bạn cần sửa ProductCard để nó nhận props của MenuItem)
                  <ProductCard key={product.itemId} product={product} />
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                          currentPage === page
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
