import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const AdminLoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userData = await login(credentials);

            // Kiểm tra role: chỉ ADMIN và MANAGER mới được vào admin
            const adminRoles = ['ADMIN', 'MANAGER'];
            if (!adminRoles.includes(userData.role)) {
                setError('Tài khoản của bạn không có quyền truy cập trang quản trị.');
                return;
            }

            navigate('/admin');
        } catch (err) {
            setError(err.message || 'Tài khoản hoặc mật khẩu không chính xác!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 opacity-90"></div>

            <div className="relative z-10">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center">
                        <div className="bg-indigo-600 p-3 rounded-xl shadow-lg">
                            <ShieldCheckIcon className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Trang Quản trị
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Hệ thống Quản lý Cô Tô — Dành cho Quản trị viên
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-gray-800 py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-gray-700">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                                    Tên đăng nhập
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="appearance-none block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="admin"
                                        value={credentials.username}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                    Mật khẩu
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="appearance-none block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="••••••••"
                                        value={credentials.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                                >
                                    <LockClosedIcon className="h-4 w-4" />
                                    {loading ? 'Đang xác thực...' : 'Đăng nhập Quản trị'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                            >
                                ← Về trang đăng nhập người dùng
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;