import axios from "axios";

// Giả sử API Gateway của bạn chạy ở port 8080
const API_GATEWAY_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: API_GATEWAY_URL,
});

export default api;
