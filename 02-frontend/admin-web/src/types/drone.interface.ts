/**
 * Định nghĩa cấu trúc Drone
 */
export interface Drone {
  droneId: number;
  model: string;
  battery: number;
  status: "idle" | "delivering" | "charging";
  // ... thêm các trường khác
}
