import { apiClient } from './api';
import {
  UserResponseDto,
  CreateUserDto,
  UpdateUserDto
} from '../types/api/user.types';


const ADMIN_ROOT = '/admin';

class userService {

  // ==========================================
  // 1. GET ALL USERS
  // URL: http://localhost:8083/api/admin/users
  // ==========================================
  async getAllUsers(): Promise<UserResponseDto[]> {
    return apiClient.get<UserResponseDto[]>('/users');
  }

  // ==========================================
  // 2. CREATE USER
  // URL: POST /api/admin/users
  // ==========================================
  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    return apiClient.post<UserResponseDto>(`${ADMIN_ROOT}/users`, data);
  }

  // ==========================================
  // 3. UPDATE USER
  // URL: PUT /api/admin/users/{id}
  // ==========================================
  async updateUser(userId: number, data: UpdateUserDto): Promise<UserResponseDto> {
    return apiClient.put<UserResponseDto>(`${ADMIN_ROOT}/users/${userId}`, data);
  }

  // ==========================================
  // 4. CHANGE ROLE
  // URL: PATCH /api/admin/users/{id}/role (Dựa theo tên trong ảnh)
  // ==========================================
  async changeUserRole(userId: number, newRole: string): Promise<void> {
    // Body tùy thuộc backend quy định, thường là { role: 'ADMIN' }
    return apiClient.patch<void>(`${ADMIN_ROOT}/users/${userId}/role`, { role: newRole });
  }

  // ==========================================
  // 5. ACTIVATE USER
  // URL: PATCH /api/admin/users/{id}/activate (Dựa theo ảnh Swagger)
  // ==========================================
  async activateUser(userId: number): Promise<void> {
    return apiClient.patch<void>(`${ADMIN_ROOT}/users/${userId}/activate`);
  }

  // ==========================================
  // 6. DEACTIVATE USER
  // URL: PATCH /api/admin/users/{id}/deactivate (Dựa theo ảnh Swagger)
  // ==========================================
  async deactivateUser(userId: number): Promise<void> {
    return apiClient.patch<void>(`${ADMIN_ROOT}/users/${userId}/deactivate`);
  }

  // Helper function: Tự động chọn Activate hoặc Deactivate dựa trên trạng thái hiện tại
  // Dùng cho nút gạt (Toggle) ở giao diện
  async toggleUserStatus(userId: number, isCurrentlyActive: boolean): Promise<void> {
    if (isCurrentlyActive) {
      return this.deactivateUser(userId);
    } else {
      return this.activateUser(userId);
    }
  }

  // ==========================================
  // 7. RESET PASSWORD
  // URL: PATCH /api/admin/users/{id}/reset-password
  // ==========================================
  async resetPassword(userId: number): Promise<void> {
    return apiClient.patch<void>(`${ADMIN_ROOT}/users/${userId}/reset-password`);
  }

  // ==========================================
  // 8. FORCE PASSWORD CHANGE
  // URL: PATCH /api/admin/users/{id}/force-password-change
  // ==========================================
  async forcePasswordChange(userId: number): Promise<void> {
    return apiClient.patch<void>(`${ADMIN_ROOT}/users/${userId}/force-password-change`);
  }

  // ==========================================
  // 9. GET USER PERMISSIONS
  // URL: GET /api/admin/users/{id}/permissions
  // ==========================================
  async getUserPermissions(userId: number): Promise<any> {
    return apiClient.get(`${ADMIN_ROOT}/users/${userId}/permissions`);
  }

  // ==========================================
  // 10. USER STATS
  // URL: GET /api/admin/users/stats
  // ==========================================
  async getUserStats(): Promise<any> {
    return apiClient.get(`${ADMIN_ROOT}/users/stats`);
  }

  // 11. GET CURRENT USER PROFILE
  // URL: GET /api/users/me
  // ==========================================
  async getCurrentUserProfile(): Promise<UserResponseDto> {
    return apiClient.get<UserResponseDto>('/users/me');
  }

  // 12. UPDATE CURRENT USER PROFILE
  // URL: PUT /api/users/me
  // ==========================================
  async updateCurrentUserProfile(data: UpdateUserDto): Promise<UserResponseDto> {
    return apiClient.put<UserResponseDto>('/users/me', data);
  }

  // 13. CHANGE PASSWORD
  // URL: PATCH /api/users/{id}/password
  // ==========================================
  async changePassword(userId: number, data: { oldPassword: string; newPassword: string }): Promise<void> {
    return apiClient.patch<void>(`/users/${userId}/password`, data);
  }
  // 14. CHANGE PASSWORD
  // URL: get /api/users/
  // ==========================================
  async getUserById(userId: number): Promise<UserResponseDto> {
    return apiClient.get<UserResponseDto>(`/users/${userId}`);
  }
}

export default new userService();