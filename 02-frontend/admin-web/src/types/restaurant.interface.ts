/**
 * Định nghĩa cấu trúc Restaurant
 */
export interface Restaurant {
  restaurantId: number;
  ownerId: number;
  name: string;
  address: string;
  status: "pending" | "open" | "closed";
  // ... thêm các trường khác
}
