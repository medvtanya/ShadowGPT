import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' ? `${window.location.origin}` : 'http://localhost:3001');

export const axiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 20000,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Нормализуем ошибку сети/таймаутов
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Превышено время ожидания запроса'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Сетевая ошибка. Проверьте соединение.'));
    }
    return Promise.reject(error);
  }
);