import axios from "axios";

const isDev = import.meta.env.DEV;
// Если задан VITE_API_URL — используем его всегда; иначе в dev используем относительные пути (прокси Vite)
const baseURL = import.meta.env.VITE_API_URL || (isDev ? '' : (typeof window !== 'undefined' ? `${window.location.origin}` : ''));
const timeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000);

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: timeoutMs,
});

// Если отправляем FormData, убираем Content-Type, чтобы браузер сам проставил boundary
axiosInstance.interceptors.request.use((config) => {
  try {
    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
    if (isFormData) {
      if (config.headers && ('Content-Type' in config.headers)) {
        delete config.headers['Content-Type'];
      }
    } else {
      // Для остальных запросов убедимся, что тип JSON (если не задан явно)
      if (config.headers && !('Content-Type' in config.headers)) {
        config.headers['Content-Type'] = 'application/json';
      }
    }
  } catch {
    console.error('error')
  }
  return config;
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