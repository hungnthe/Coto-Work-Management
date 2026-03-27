import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';

// ============================================================
// 1. TẠO CONTEXT
// ============================================================
const AuthContext = createContext(null);

// ============================================================
// 2. CUSTOM HOOK - dùng ở mọi component cần auth
// ============================================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  }
  return context;Admin
};

// ============================================================
// 3. PROVIDER - bọc toàn bộ App
// ============================================================
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------
  // KHỞI TẠO: Check localStorage khi app load lần đầu
  // ----------------------------------------------------------
  useEffect(() => {
    try {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        const savedUser = JSON.parse(userStr);
        // Kiểm tra data có hợp lệ không (phải có username và role)
        if (savedUser && savedUser.username && savedUser.role) {
          setUser(savedUser);
        } else {
          // Data bị corrupt → clear hết
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      // localStorage bị corrupt → clear hết, không crash app
      console.error('Lỗi đọc dữ liệu đăng nhập:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------------------------------------------
  // LOGIN
  // ----------------------------------------------------------
  const login = useCallback(async (credentials) => {
    const userData = await authService.login(credentials);
    // authService.login() đã lưu vào localStorage rồi
    // Giờ chỉ cần sync vào React state
    setUser(userData);
    return userData; // Trả về để component biết role → redirect
  }, []);

  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      // authService.logout() đã clear localStorage rồi
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn clear localStorage nếu API lỗi
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } finally {
      // LUÔN clear React state bất kể API thành công hay thất bại
      setUser(null);
    }
  }, []);

  // ----------------------------------------------------------
  // KIỂM TRA QUYỀN - Đọc từ React state (KHÔNG từ localStorage)
  // → Đảm bảo đồng bộ, re-render đúng khi state thay đổi
  // ----------------------------------------------------------
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((role) => {
    if (!user) return false;
    return user.role === role;
  }, [user]);

  // ----------------------------------------------------------
  // isAuthenticated là BOOLEAN (không phải function)
  // → Dùng trực tiếp: isAuthenticated ? <X/> : <Y/>
  // → Không cần gọi isAuthenticated()
  // ----------------------------------------------------------
  const isAuthenticated = useMemo(() => {
    return !!(user && localStorage.getItem('accessToken'));
  }, [user]);

  // ----------------------------------------------------------
  // GIÁ TRỊ CUNG CẤP CHO CONTEXT
  // ----------------------------------------------------------
  const value = useMemo(() => ({
    user,           // Object user hiện tại hoặc null
    loading,        // true khi đang check localStorage lần đầu
    isAuthenticated,// BOOLEAN - true/false (không phải function)
    login,          // async function(credentials) → userData
    logout,         // async function() → void
    hasPermission,  // function(permission) → boolean
    hasRole,        // function(role) → boolean
  }), [user, loading, isAuthenticated, login, logout, hasPermission, hasRole]);

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
};