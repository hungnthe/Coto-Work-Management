import { apiClient } from './api';
import {
  LoginRequestDto,
  LoginResponseDto,
  TokenRefreshResponseDto, // Bỏ RefreshTokenRequestDto nếu không dùng làm type
} from '../types/api/auth.types';
import { UserRole, Permission } from '../types/api/common.types';
import { validateResponse } from './validators';

class AuthService {
  /**
   * Login user with credentials
   */
  async login(credentials: LoginRequestDto): Promise<LoginResponseDto> {
    // SỬA: Chỉ truyền <LoginResponseDto>
    const response = await apiClient.post<LoginResponseDto>(
        '/auth/login',
        credentials
    );

    // Validate response structure
    const validated = validateResponse<LoginResponseDto>(
        response,
        ['accessToken', 'refreshToken', 'tokenType', 'expiresIn', 'userId',
          'username', 'fullName', 'email', 'role', 'unitId', 'unitName', 'permissions'],
        'LoginResponseDto'
    );

    // Store tokens and user data
    localStorage.setItem('accessToken', validated.accessToken);
    localStorage.setItem('refreshToken', validated.refreshToken);
    localStorage.setItem('user', JSON.stringify(validated));

    return validated;
  }

  /**
   * Logout user and clear stored data
   */
  async logout(): Promise<void> {
    try {
      // SỬA: Chỉ truyền <void> hoặc bỏ trống nếu không cần type trả về
      await apiClient.post<void>('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): LoginResponseDto | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as LoginResponseDto;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: Permission): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<TokenRefreshResponseDto> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // SỬA: Chỉ truyền <TokenRefreshResponseDto>
    const response = await apiClient.post<TokenRefreshResponseDto>(
        '/auth/refresh',
        { refreshToken }
    );

    // Validate response structure
    const validated = validateResponse<TokenRefreshResponseDto>(
        response,
        ['accessToken', 'refreshToken', 'tokenType', 'expiresIn'],
        'TokenRefreshResponseDto'
    );

    // Update stored tokens
    localStorage.setItem('accessToken', validated.accessToken);
    localStorage.setItem('refreshToken', validated.refreshToken);

    return validated;
  }
}

export default new AuthService();