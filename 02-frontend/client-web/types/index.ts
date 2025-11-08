// Định nghĩa Role (khớp với backend)
export interface Role {
  roleId: number;
  name: string;
}

// Định nghĩa User (khớp với backend)
export interface User {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa Lỗi (khớp với backend)
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
