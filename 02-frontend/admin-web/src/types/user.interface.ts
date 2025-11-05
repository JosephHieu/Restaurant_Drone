/**
 * Định nghĩa cấu trúc Role (để lồng vào User)
 */
export interface Role {
  roleId: number; // <-- Thêm trường này
  name: string;
}

/**
 * Định nghĩa cấu trúc User (Đầy đủ)
 * Phải khớp với User.java ở backend
 */
export interface User {
  userId: number;
  fullName: string;
  email: string;
  phone: string; // <-- Thêm trường bị thiếu
  address: string; // <-- Thêm luôn trường này
  status: string; // <-- Thêm trường bị thiếu
  role: Role; // <-- Dùng Interface Role ở trên
  createdAt: string;
  updatedAt: string;
}
