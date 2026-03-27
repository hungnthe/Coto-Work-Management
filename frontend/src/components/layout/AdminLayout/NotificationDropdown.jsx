import React, { useState } from 'react';
import { BellIcon, CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Công việc mới được giao',
      message: 'Bạn đã được giao nhiệm vụ "Thiết kế giao diện Admin"',
      time: '5 phút trước',
      read: false,
      type: 'info'
    },
    {
      id: 2,
      title: 'Hạn chót sắp đến',
      message: 'Nhiệm vụ "Báo cáo tháng 10" sẽ hết hạn trong 2 giờ tới',
      time: '1 giờ trước',
      read: false,
      type: 'warning'
    },
    {
      id: 3,
      title: 'Đã hoàn thành',
      message: 'Nhiệm vụ "Cập nhật tài liệu" đã được đánh dấu hoàn thành',
      time: '1 ngày trước',
      read: true,
      type: 'success'
    },
    {
      id: 4,
      title: 'Thông báo hệ thống',
      message: 'Hệ thống sẽ bảo trì vào lúc 22:00 hôm nay',
      time: '2 ngày trước',
      read: true,
      type: 'info'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full hover:bg-gray-100"
      >
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full ring-2 ring-white bg-red-500 text-xs text-white font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="origin-top-right absolute right-0 mt-2 w-80 sm:w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
            <div className="py-2 px-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">Thông báo</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Đánh dấu đã đọc tất cả
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  Không có thông báo nào
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <li 
                      key={notification.id} 
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 pt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0 self-center">
                            <span className="block h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="py-2 px-4 bg-gray-50 border-t border-gray-200 text-center">
              <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                Xem tất cả thông báo
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
