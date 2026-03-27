import React from 'react';
import { NavLink } from 'react-router-dom'; // Thêm "bảo bối" chuyển trang này vào
import { useAuth } from '../../../contexts/AuthContext.jsx';
import {
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  FolderIcon,
  UserPlusIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  // Xóa các props (activeSection, onSectionChange) đi vì không cần nữa
  const { hasPermission } = useAuth();

  // Bổ sung thêm thuộc tính "path" vào từng item để Router biết đường chuyển trang
  const menuItems = [
    // Admin Section
    {
      id: 'admin-dashboard',
      name: 'Admin Dashboard',
      icon: ChartBarIcon,
      permission: 'user:manage_all',
      section: 'admin',
      path: '/admin'
    },
    {
      id: 'admin-users',
      name: 'Quản lý người dùng',
      icon: UsersIcon,
      permission: 'user:manage_all',
      section: 'admin',
      path: '/admin/users'
    },
    {
      id: 'admin-create-user',
      name: 'Tạo người dùng',
      icon: UserPlusIcon,
      permission: 'user:manage_all',
      section: 'admin',
      path: '/admin/users/create'
    },

    // Regular User Management
    {
      id: 'users',
      name: 'Danh sách người dùng',
      icon: UsersIcon,
      permission: 'user:read',
      path: '/users'
    },
    {
      id: 'units',
      name: 'Quản lý đơn vị',
      icon: BuildingOfficeIcon,
      permission: 'unit:read',
      path: '/units'
    },
    {
      id: 'profile',
      name: 'Hồ sơ cá nhân',
      icon: DocumentTextIcon,
      permission: null, // Always available for authenticated users
      path: '/profile'
    },
    {
      id: 'tasks',
      name: 'Quản lý công việc',
      icon: FolderIcon,
      permission: null,
      path: '/tasks'
    },
    {
      id: 'admin-units',
      name: 'Quản lý đơn vị',
      icon: BuildingOfficeIcon,
      permission: 'user:manage_all',
      section: 'admin',
      path: '/admin/units'
    }
  ];

  const filteredMenuItems = menuItems.filter(item =>
      !item.permission || hasPermission(item.permission)
  );

  // Group menu items by section
  const adminItems = filteredMenuItems.filter(item => item.section === 'admin');
  const regularItems = filteredMenuItems.filter(item => !item.section);

  const renderMenuSection = (items, title = null) => {
    if (items.length === 0) return null;

    return (
        <div className="mb-6">
          {title && (
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {title}
                </h3>
              </div>
          )}
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                  // Đổi <button> thành <NavLink>
                  <NavLink
                      key={item.id}
                      to={item.path}
                      // NavLink tự động cấp biến isActive để ta set class màu sắc
                      className={({ isActive }) =>
                          `w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              isActive
                                  ? 'bg-indigo-600 text-white' // Màu khi đang chọn menu này
                                  : 'text-gray-300 hover:bg-gray-700 hover:text-white' // Màu mặc định
                          }`
                      }
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </NavLink>
              );
            })}
          </nav>
        </div>
    );
  };

  return (
      <div className="bg-gray-800 text-white w-64 min-h-screen">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-6">
            <ShieldCheckIcon className="h-8 w-8 text-indigo-400" />
            <h2 className="text-lg font-semibold">CoTo Admin</h2>
          </div>

          {renderMenuSection(adminItems, 'Quản trị')}
          {renderMenuSection(regularItems, 'Chung')}
        </div>
      </div>
  );
};

export default Sidebar;