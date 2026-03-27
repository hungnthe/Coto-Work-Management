import React, { useState, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import NotebookTransition from '../../NotebookTransition.jsx';
import NotificationBell from '../../../features/notifications/NotificationBell';

const ClientLayout = () => {
    const { user, logout, hasRole } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const [showNotebook, setShowNotebook] = useState(
        sessionStorage.getItem('showNotebook') === 'true'
    );

    const handleAnimationComplete = useCallback(() => {
        setShowNotebook(false);
    }, []);

    const handleLogout = async () => {
        sessionStorage.removeItem('showNotebook');
        await logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Trang chủ', path: '/' },
        { name: 'Công việc', path: '/tasks' },
        { name: 'Hồ sơ', path: '/profile' },
    ];

    return (
        <>
            <NotebookTransition show={showNotebook} onComplete={handleAnimationComplete} />

            <div className={`min-h-screen bg-gray-50 flex flex-col transition-opacity duration-500 ${showNotebook ? 'opacity-0' : 'opacity-100'}`}>

                {/* ===== HEADER ===== */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">

                            {/* Logo */}
                            <div className="flex items-center space-x-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                    </svg>
                                </div>
                                <h1 className="text-lg font-semibold text-gray-900">Quản lý Cô Tô</h1>
                            </div>

                            {/* Navigation - Desktop */}
                            <nav className="hidden md:flex items-center space-x-1">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === '/'}
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-indigo-50 text-indigo-700'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`
                                        }
                                    >
                                        {item.name}
                                    </NavLink>
                                ))}

                                {(hasRole('ADMIN') || hasRole('MANAGER')) && (
                                    <NavLink
                                        to="/admin"
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    >
                                        Quản trị ↗
                                    </NavLink>
                                )}
                            </nav>

                            {/* ── Right side: Bell + User menu ── */}
                            <div className="flex items-center gap-1">

                                {/* ★ NOTIFICATION BELL - thêm vào đây */}
                                <NotificationBell />

                                {/* User menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setMenuOpen(!menuOpen)}
                                        className="flex items-center space-x-2 text-sm focus:outline-none ml-1"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <span className="text-indigo-600 font-medium text-sm">
                                                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || '?'}
                                            </span>
                                        </div>
                                        <span className="hidden md:block text-gray-700 font-medium">
                                            {user?.fullName || user?.username}
                                        </span>
                                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </button>

                                    {menuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 py-1">
                                                <div className="px-4 py-2 border-b border-gray-100">
                                                    <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                                </div>
                                                <NavLink
                                                    to="/profile"
                                                    onClick={() => setMenuOpen(false)}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Hồ sơ cá nhân
                                                </NavLink>
                                                <NavLink
                                                    to="/notifications"
                                                    onClick={() => setMenuOpen(false)}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Thông báo
                                                </NavLink>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Đăng xuất
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Mobile menu button */}
                            <button
                                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>

                        </div>
                    </div>
                </header>

                {/* ===== MAIN ===== */}
                <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </main>

                {/* ===== FOOTER ===== */}
                <footer className="bg-white border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <p className="text-center text-sm text-gray-500">
                            © 2025 Hệ thống Quản lý Cô Tô
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default ClientLayout;