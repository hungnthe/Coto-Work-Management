import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UsersIcon, 
  BuildingOfficeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BellIcon,
  FolderIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const { hasPermission } = useAuth();

  const menuItems = [
    {
      id: 'users',
      name: 'Quản lý người dùng',
      icon: UsersIcon,
      permission: 'user:read'
    },
    {
      id: 'units',
      name: 'Quản lý đơn vị',
      icon: BuildingOfficeIcon,
      permission: 'unit:read'
    },
    {
      id: 'profile',
      name: 'Hồ sơ cá nhân',
      icon: DocumentTextIcon,
      permission: null // Always available for authenticated users
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Menu</h2>
        <nav className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;