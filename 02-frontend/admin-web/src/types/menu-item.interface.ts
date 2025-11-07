export interface MenuItem {
  itemId: number;
  restaurantId: number; // (Thực chất là khóa ngoại)
  name: string;
  description: string;
  price: number;
  imageUri: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}
