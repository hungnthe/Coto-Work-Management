// src/pages/Admin/UserList.jsx — thêm điều hướng vào trang chi tiết
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userService from '../../services/userService';

const UserList = () => {
    const [users,   setUsers]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();
            if (response?.content && Array.isArray(response.content)) setUsers(response.content);
            else if (Array.isArray(response)) setUsers(response);
            else setUsers([]);
        } catch (err) {
            setError(err?.message || 'Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleToggleStatus = async (e, userId, currentStatus) => {
        e.stopPropagation(); // Không trigger row click
        if (!window.confirm(`Bạn có chắc muốn ${currentStatus ? 'khóa' : 'mở khóa'} tài khoản này?`)) return;
        try {
            await userService.toggleUserStatus(userId, currentStatus);
            fetchUsers();
        } catch { alert('Lỗi khi cập nhật trạng thái'); }
    };

    const handleEditClick = (e, userId) => {
        e.stopPropagation(); // Không trigger row click
        navigate(`/admin/users/${userId}`);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
    if (error)   return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
                <Link to="/admin/users/create"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <span>+ Thêm mới</span>
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold">ID</th>
                        <th className="p-4 font-semibold">Tài khoản</th>
                        <th className="p-4 font-semibold">Email</th>
                        <th className="p-4 font-semibold">Vai trò</th>
                        <th className="p-4 font-semibold">Trạng thái</th>
                        <th className="p-4 font-semibold text-right">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                        <tr
                            key={user.id}
                            onClick={() => navigate(`/admin/users/${user.id}`)} // ← Click row
                            className="hover:bg-indigo-50/40 transition-colors cursor-pointer"
                            title="Xem chi tiết"
                        >
                            <td className="p-4 text-gray-500">#{user.id}</td>
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                                        {(user.fullName || user.username || '?')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 text-sm">{user.fullName || user.username}</div>
                                        <div className="text-xs text-gray-400">@{user.username}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-gray-600 text-sm">{user.email}</td>
                            <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                        ${user.role === 'ADMIN'        ? 'bg-purple-100 text-purple-700' :
                                        user.role === 'UNIT_MANAGER' ? 'bg-blue-100 text-blue-700' :
                                            user.role === 'MANAGER'      ? 'bg-sky-100 text-sky-700' :
                                                'bg-gray-100 text-gray-600'}`}>
                                        {user.role}
                                    </span>
                            </td>
                            <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                        ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                        {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                                    </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                                <button
                                    onClick={(e) => handleToggleStatus(e, user.id, user.isActive)}
                                    className={`text-xs px-3 py-1 rounded border transition-colors
                                            ${user.isActive
                                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                                        : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                                >
                                    {user.isActive ? 'Khóa' : 'Mở'}
                                </button>
                                <button
                                    onClick={(e) => handleEditClick(e, user.id)}
                                    className="text-gray-400 hover:text-indigo-600 transition-colors inline-flex"
                                    title="Chỉnh sửa"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {users.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-500">Chưa có người dùng nào.</div>
                )}
            </div>
        </div>
    );
};

export default UserList;