/// <reference types="vite/client" />
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// ============================================================
// TYPES
// ============================================================

// Lỗi đã transform để frontend dùng
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
  validationErrors: ValidationError[];
  duplicateField?: string;   // Field nào bị trùng (409)
  duplicateValue?: string;   // Giá trị bị trùng
}

// Lỗi validation từng field (backend trả về trong details.validationErrors)
export interface ValidationError {
  field: string;
  rejectedValue: unknown;
  message: string;
}

// Format lỗi backend trả về
interface BackendErrorResponse {
  error_code?: string;
  error_message?: string;
  message?: string;
  error?: string;
  http_status?: number;
  status?: number;
  path?: string;
  timestamp?: string;
  details?: {
    validationErrors?: ValidationError[];
    duplicateField?: string;    // Từ DuplicateDataException
    duplicateValue?: string;    // Từ DuplicateDataException
    method?: string;
    requestId?: string;
    errorCount?: number;
  };
}

// ============================================================
// AXIOS INSTANCE
// ============================================================
const BASE_URL: string = 'https://hedgiest-kasandra-semianatomic.ngrok-free.dev/api';
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// ============================================================
// REQUEST INTERCEPTOR - Thêm Token
// ============================================================
api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// ============================================================
// RESPONSE INTERCEPTOR - Refresh Token & Transform Error
// ============================================================
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Nếu lỗi 401 và chưa thử retry
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return api(originalRequest);
          }
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(transformError(error as AxiosError<BackendErrorResponse>));
    }
);

// ============================================================
// TRANSFORM ERROR - Giữ lại validationErrors từ backend
// ============================================================
// Backend trả lỗi 400 dạng:
// {
//   "error_code": "VAL_001",
//   "error_message": "Dữ liệu không hợp lệ",
//   "http_status": 400,
//   "details": {
//     "validationErrors": [
//       { "field": "password", "rejectedValue": "123", "message": "..." }
//     ]
//   }
// }
function transformError(error: AxiosError<BackendErrorResponse>): ApiError {
  if (error.response) {
    const data: BackendErrorResponse | undefined = error.response.data;
    return {
      message: data?.error_message || data?.message || 'Có lỗi xảy ra từ máy chủ',
      statusCode: error.response.status,
      error: data?.error || data?.error_code,
      validationErrors: data?.details?.validationErrors || [],
      duplicateField: data?.details?.duplicateField,
      duplicateValue: data?.details?.duplicateValue,
    };
  } else if (error.request) {
    return {
      message: 'Không thể kết nối đến máy chủ',
      statusCode: 0,
      validationErrors: [],
    };
  } else {
    return {
      message: error.message || 'Lỗi không xác định',
      validationErrors: [],
    };
  }
}

// ============================================================
// API CLIENT WRAPPER
// ============================================================
export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
      api.get<T>(url, config).then((res: AxiosResponse<T>) => res.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
      api.post<T>(url, data, config).then((res: AxiosResponse<T>) => res.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
      api.put<T>(url, data, config).then((res: AxiosResponse<T>) => res.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
      api.patch<T>(url, data, config).then((res: AxiosResponse<T>) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
      api.delete<T>(url, config).then((res: AxiosResponse<T>) => res.data),
};

export default api;