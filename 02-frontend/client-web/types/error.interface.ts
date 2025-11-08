// Định nghĩa Lỗi (khớp với backend)
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
