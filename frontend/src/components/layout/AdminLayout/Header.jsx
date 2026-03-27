import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import NotificationBell from '../../../features/notifications/NotificationBell';
import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import React from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'ADMIN': 'Quản trị viên',
      'MANAGER': 'Quản lý',
      'UNIT_MANAGER': 'Trưởng đơn vị',
      'STAFF': 'Nhân viên',
      'VIEWER': 'Người xem'
    };
    return roleNames[role] || role;
  };

  return (
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Hệ thống Quản lý Cô Tô
              </h1>
              <span className="ml-3 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                Admin
              </span>
            </div>

            <div className="relative flex items-center space-x-4">
              <NotificationBell  />
              <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.fullName || user?.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getRoleDisplayName(user?.role)}
                    </div>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </div>
              </button>

              {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <div className="font-medium">{user?.fullName}</div>
                        <div className="text-xs text-gray-500">{user?.email}</div>
                      </div>

                      <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate('/profile');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <UserIcon className="h-4 w-4 mr-3" />
                        Hồ sơ cá nhân
                      </button>

                      <button
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-3" />
                        Cài đặt
                      </button>

                      <div className="border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>

        {dropdownOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
        )}
      </header>
  );
};

export default Header;