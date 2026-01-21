import React, { useState, useEffect } from 'react';
import { unitService } from '../../services/unitService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const UnitList = ({ onUnitSelect, onCreateUnit, onEditUnit }) => {
  const { hasPermission } = useAuth();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUnits, setFilteredUnits] = useState([]);

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    // Filter units based on search term
    if (searchTerm.trim() === '') {
      setFilteredUnits(units);
    } else {
      const filtered = units.filter(unit =>
        unit.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (unit.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUnits(filtered);
    }
  }, [units, searchTerm]);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const data = await unitService.getAllUnits();
      setUnits(data);
      setError('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn vị này?')) {
      return;
    }

    try {
      await unitService.deleteUnit(unitId);
      await loadUnits(); // Reload the list
    } catch (error) {
      alert('Lỗi khi xóa đơn vị: ' + error.message);
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Hoạt động
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Không hoạt động
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý đơn vị</h2>
        {hasPermission('unit:create') && (
          <button
            onClick={onCreateUnit}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Thêm đơn vị
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Tìm kiếm đơn vị..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Units table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredUnits.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              {searchTerm ? 'Không tìm thấy đơn vị nào' : 'Chưa có đơn vị nào'}
            </li>
          ) : (
            filteredUnits.map((unit) => (
              <li key={unit.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {unit.unitName}
                        </p>
                        {getStatusBadge(unit.isActive)}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        Mã: {unit.unitCode}
                      </p>
                      {unit.description && (
                        <p className="text-xs text-gray-400 truncate">
                          {unit.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUnitSelect(unit)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      title="Xem chi tiết"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    
                    {hasPermission('unit:update') && (
                      <button
                        onClick={() => onEditUnit(unit)}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                    
                    {hasPermission('unit:delete') && (
                      <button
                        onClick={() => handleDeleteUnit(unit.id)}
                        className="inline-flex items-center p-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Xóa"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default UnitList;