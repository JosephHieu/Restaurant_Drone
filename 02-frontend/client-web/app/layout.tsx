import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google"; // (Bạn có thể giữ Geist_Mono nếu muốn)
import "./globals.css"; // (Lỗi này sẽ hết sau khi tạo file .d.ts)

// 1. IMPORT CÁC PROVIDER
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import AntdRegistry from "@/components/AntdRegistry"; // <-- 2. IMPORT FILE MỚI

// 3. CẤU HÌNH FONT
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist", // Đặt tên biến CSS
});

export const metadata: Metadata = {
  title: "FoodFast Drone Delivery", // Sửa Title
  description: "Giao hàng bằng Drone",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      {/* 4. ÁP DỤNG FONT VÀO BODY */}
      <body className={geist.variable}>
        {/* 5. BỌC CÁC PROVIDER */}
        <AuthProvider>
          <CartProvider>
            <AntdRegistry>
              {" "}
              {/* <-- BỌC BẰNG AntD REGISTRY */}
              {children}
            </AntdRegistry>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
