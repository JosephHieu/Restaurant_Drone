export interface Restaurant {
  restaurantId: number;
  ownerId: number;
  name: string;
  description: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  status: "pending" | "open" | "closed";
  coverImageUri?: string;
  createdAt: string;
  updatedAt: string;
}
