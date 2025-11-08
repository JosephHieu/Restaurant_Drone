"use client"

import ProductCard from "./product-card"

const allProducts = [
  {
    id: 1,
    name: "Cơm gà xối mỡ",
    image: "/c-m-g--x-i-m-.jpg",
    discount: null,
    price: 45000,
    originalPrice: 45000,
  },
  {
    id: 2,
    name: "Bún bò Huế",
    image: "/b-n-b--hu-.jpg",
    discount: null,
    price: 55000,
    originalPrice: 55000,
  },
  {
    id: 3,
    name: "Phở bò tái",
    image: "/ph--b--t-i.jpg",
    discount: null,
    price: 50000,
    originalPrice: 50000,
  },
  {
    id: 4,
    name: "Cơm sườn bì chả",
    image: "/c-m-s--n-b--ch-.jpg",
    discount: null,
    price: 42000,
    originalPrice: 42000,
  },
]

export default function ProductGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12 bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {allProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
