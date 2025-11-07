// Định nghĩa interface cho lỗi trả về từ Spring Boot
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string; // Tên lỗi (e.g., "Forbidden")
  message: string; // <-- Đây là trường bạn cần
  path: string;
}
