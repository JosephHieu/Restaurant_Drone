import { useContext } from "react";
// Import AuthContext từ file trước
import { AuthContext } from "../context/AuthContext";

// Đây là code bạn vừa xóa từ file AuthContext.tsx
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
