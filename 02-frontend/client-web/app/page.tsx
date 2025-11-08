import Header from "@/components/header"
import PromoBar from "@/components/promo-bar"
import CategorySection from "@/components/category-section"
import FoodSection from "@/components/food-section"
import ProductGrid from "@/components/product-grid"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <PromoBar />
      <Header />
      <CategorySection />
      <FoodSection />
      <ProductGrid />
      <Footer />
    </main>
  )
}
