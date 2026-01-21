import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { unitService } from '../../services/unitService';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const UserForm = ({ user, onSave, onCancel }) => {
  const isEdit = !!user;
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    unitId: '',
    role: 'STAFF',
    phoneNumber: '',
    avatarUrl: '',
    isActive: true
  });
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    { value: 'ADMIN', label: 'Quản trị viên' },
    { value: 'UNIT_MANAGER', label: 'Trưởng đơn vị' },
    { value: 'STAFF', label: 'Nhân viên' },
    { value: 'VIEWER', label: 'Người xem' }
  ];

  useEffect(() => {
    loadUnits();
    if (isEdit) {
      setFormData({
        username: user.username || '',
        fullName: user.fullName || '',
        email: user.email || '',
        password: '', // Never pre-fill password
        unitId: user.unit?.id || '',
        role: user.role || 'STAFF',
        phoneNumber: user.phoneNumber || '',
        avatarUrl: user.avatarUrl || '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    }
  }, [user, isEdit]);

  const loadUnits = async () => {
    try {
      const data = await unitService.getAllUnits();
      setUnits(data);
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isEdit) {
        // For updates, don't send password if it's empty
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        delete updateData.username; // Username cannot be changed
        result = await userService.updateUser(user.id, updateData);
      } else {
        result = await userService.createUser(formData);
      }
      
      onSave(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Thông tin cơ bản
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Thông tin đăng nhập và liên hệ của người dùng.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Tên đăng nhập *
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    required
                    disabled={isEdit} // Username cannot be changed
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    required
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mật khẩu {!isEdit && '*'}
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="password"
                      required={!isEdit}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={isEdit ? 'Để trống nếu không đổi mật khẩu' : ''}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Phân quyền
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Đơn vị và vai trò của người dùng trong hệ thống.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="unitId" className="block text-sm font-medium text-gray-700">
                    Đơn vị *
                  </label>
                  <select
                    name="unitId"
                    id="unitId"
                    required
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.unitId}
                    onChange={handleChange}
                  >
                    <option value="">Chọn đơn vị</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.unitName} ({unit.unitCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Vai trò *
                  </label>
                  <select
                    name="role"
                    id="role"
                    required
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6">
                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Tài khoản hoạt động
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang lưu...
              </div>
            ) : (
              isEdit ? 'Cập nhật' : 'Tạo mới'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;