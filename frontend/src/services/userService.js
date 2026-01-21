import api from './api';

export const userService = {
  // Get all users
  async getAllUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get current user profile
  async getCurrentUserProfile() {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Create new user
  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Update current user profile
  async updateCurrentUserProfile(userData) {
    try {
      const response = await api.put('/users/me', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Change password
  async changePassword(id, oldPassword, newPassword) {
    try {
      const response = await api.patch(`/users/${id}/password`, {
        oldPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get users by unit
  async getUsersByUnit(unitId) {
    try {
      const response = await api.get(`/users/unit/${unitId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get users by role
  async getUsersByRole(role) {
    try {
      const response = await api.get(`/users/role/${role}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Search users
  async searchUsers(keyword) {
    try {
      const response = await api.get(`/users/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Handle API errors
  handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'Đã xảy ra lỗi';
      return new Error(message);
    } else if (error.request) {
      return new Error('Không thể kết nối đến server');
    } else {
      return new Error(error.message || 'Đã xảy ra lỗi không xác định');
    }
  }
};