// File: src/types/RestaurantStatsDto.interface.ts

/**
 * Khớp với RestaurantStatsDto.java (từ order-service)
 */
export interface RestaurantStatsDto {
  totalOrders: number;
  pendingOrders: number;
  deliveringOrders: number;
  totalRevenue: number;
}
