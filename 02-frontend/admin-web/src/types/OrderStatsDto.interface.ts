// File: src/types/OrderStatsDto.interface.ts

/**
 * Khớp với OrderStatsDto.java (từ order-service)
 */
export interface OrderStatsDto {
  totalOrders: number;
  pendingOrders: number;
  deliveringOrders: number;
  totalRevenue: number;
}
