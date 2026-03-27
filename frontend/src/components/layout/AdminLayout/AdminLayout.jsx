import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar bên trái */}
            <Sidebar />

            {/* Phần nội dung bên phải */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;