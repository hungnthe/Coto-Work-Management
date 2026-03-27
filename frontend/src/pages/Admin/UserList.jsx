import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';


const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm load dữ liệu
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();

            console.log("Check data backend trả về:", response); // Luôn log ra để nhìn

            // TRƯỜNG HỢP 1: Backend trả về Page (có chứa content)
            if (response && response.content && Array.isArray(response.content)) {
                setUsers(response.content);
            }
            // TRƯỜNG HỢP 2: Backend trả về Mảng luôn (ít gặp nếu dùng Pageable)
            else if (Array.isArray(response)) {
                setUsers(response);
            }
            // TRƯỜNG HỢP 3: Không có dữ liệu
            else {
                setUsers([]);
            }

        } catch (err) {
            // ... giữ nguyên
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Xử lý khóa/mở khóa nhanh (Optional)
    const handleToggleStatus = async (userId, currentStatus) => {
        if(!window.confirm(`Bạn có chắc muốn ${currentStatus ? 'khóa' : 'mở khóa'} tài khoản này?`)) return;

        try {
            await userService.toggleUserStatus(userId, !currentStatus);
            fetchUsers(); // Load lại danh sách sau khi update
        } catch (err) {
            alert("Lỗi khi cập nhật trạng thái");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
                <Link
                    to="/admin/users/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
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
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-gray-500">#{user.id}</td>
                            <td className="p-4 font-medium text-gray-900">{user.username}</td>
                            <td className="p-4 text-gray-600">{user.email}</td>
                            <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium 
                    ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role}
                  </span>
                            </td>
                            <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium 
                    ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                                <button
                                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                                    className={`text-xs px-3 py-1 rounded border transition-colors
                    ${user.isActive
                                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                                        : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                                >
                                    {user.isActive ? 'Khóa' : 'Mở'}
                                </button>
                                <button className="text-gray-400 hover:text-blue-600 transition-colors">
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