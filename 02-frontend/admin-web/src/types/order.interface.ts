// Interface này khớp với OrderItem.java (trong order-service)
export interface OrderItem {
  orderItemId: number;
  itemId: number;
  name: string; // Tên (snapshot)
  price: number; // Giá (snapshot)
  quantity: number;
  note: string | null;
}

// Interface này khớp với Order.java (trong order-service)
export interface Order {
  orderId: number;
  customerId: number;
  restaurantId: number;
  totalPrice: number;
  deliveryAddress: string;
  status: string; // "PENDING", "CONFIRMED", "READY_FOR_DELIVERY"
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[]; // Danh sách các món ăn lồng nhau
}
