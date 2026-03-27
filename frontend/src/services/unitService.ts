import { apiClient } from './api';

export interface UnitDto {
    id?: number;
    unitCode: string;
    unitName: string;
    parentUnitId?: number | null;
    description?: string;
    address?: string;
    phoneNumber?: string;
}

const unitService = {
    // GET /api/units
    getAllUnits: async () => apiClient.get('/units'),

    // GET /api/units/{id}
    getUnitById: async (id: number) => apiClient.get(`/units/${id}`),

    // POST /api/units
    createUnit: async (data: UnitDto) => apiClient.post('/units', data),

    // PUT /api/units/{id}
    updateUnit: async (id: number, data: UnitDto) => apiClient.put(`/units/${id}`, data),

    // DELETE /api/units/{id}
    deleteUnit: async (id: number) => apiClient.delete(`/units/${id}`),

    // GET /api/users/unit/{unitId}
    getUnitMembers: async (unitId: number) => apiClient.get(`/users/unit/${unitId}`),
};

export default unitService;