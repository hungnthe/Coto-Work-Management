import api from './api';

export const unitService = {
  // Get all units
  async getAllUnits() {
    try {
      const response = await api.get('/units');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get unit by ID
  async getUnitById(id) {
    try {
      const response = await api.get(`/units/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get unit by code
  async getUnitByCode(unitCode) {
    try {
      const response = await api.get(`/units/code/${unitCode}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Create new unit
  async createUnit(unitData) {
    try {
      const response = await api.post('/units', unitData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Update unit
  async updateUnit(id, unitData) {
    try {
      const response = await api.put(`/units/${id}`, unitData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Delete unit
  async deleteUnit(id) {
    try {
      const response = await api.delete(`/units/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get child units
  async getChildUnits(parentId) {
    try {
      const response = await api.get(`/units/parent/${parentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get root units
  async getRootUnits() {
    try {
      const response = await api.get('/units/roots');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Search units
  async searchUnits(keyword) {
    try {
      const response = await api.get(`/units/search?keyword=${encodeURIComponent(keyword)}`);
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