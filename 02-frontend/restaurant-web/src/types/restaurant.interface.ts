export interface Restaurant {
  restaurantId: number;
  ownerId: number;
  name: string;
  description: string;
  phone: string;
  address: string;
  rating: number;
  status: "pending" | "open" | "closed";
  createdAt: string;
  updatedAt: string;
}
