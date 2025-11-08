import axios, { type InternalAxiosRequestConfig, type AxiosError } from "axios";

// 1. Chỉ định địa chỉ API Gateway của bạn
const API_GATEWAY_URL = "http://localhost:8080";

// 2. Tạo một phiên bản (instance) axios
const api = axios.create({
  baseURL: API_GATEWAY_URL,
});

// 3. Cấu hình "Interceptor" để tự động đính kèm Token
api.interceptors.request.use(
  // Thêm kiểu "InternalAxiosRequestConfig" cho config
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("client_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  // Thêm kiểu "AxiosError" cho error
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default api;
