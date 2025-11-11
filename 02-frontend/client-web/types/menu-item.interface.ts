/**
 * Định nghĩa cấu trúc MenuItem (Món ăn)
 * Phải khớp với MenuItem.java ở backend
 */
export interface MenuItem {
  itemId: number;
  restaurantId: number; // (Thực chất là khóa ngoại)
  name: string;
  description: string;
  price: number;
  imageUri: string;
  isAvailable: boolean;
  restaurantName: string; // Tên nhà hàng (không bắt buộc)
  createdAt: string;
  updatedAt: string;
}
