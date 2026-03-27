import React, { useState, useEffect } from 'react';
import { KeyIcon } from '@heroicons/react/24/outline';
import userService from '../../services/userService';

// Import 3 mảnh ghép giao diện
import ProfileInfo from './components/ProfileInfo';
import EditProfileForm from './components/EditProfileForm';
import ChangePasswordForm from './components/ChangePasswordForm';

const UserProfileFeature = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false); // Nút loading khi đang lưu API
    const [error, setError] = useState('');

    // Quản lý trạng thái màn hình: 'VIEW' (Xem) | 'EDIT' (Sửa) | 'PASSWORD' (Đổi pass)
    const [viewMode, setViewMode] = useState('VIEW');

    // Load dữ liệu lần đầu tiên
    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const data = await userService.getCurrentUserProfile();
            setUser(data);
            setError('');
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tải thông tin');
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý khi form Edit bấm Lưu
    const handleUpdateProfile = async (formData) => {
        try {
            setActionLoading(true);
            setError('');
            const updatedUser = await userService.updateCurrentUserProfile(formData);
            setUser(updatedUser);
            setViewMode('VIEW'); // Xong việc thì quay về màn hình Xem
        } catch (err) {
            setError(err.message || 'Lỗi khi cập nhật thông tin');
        } finally {
            setActionLoading(false);
        }
    };

    // Hàm xử lý khi form Đổi Pass bấm Lưu
    const handleChangePassword = async (passwordData) => {
        try {
            setActionLoading(true);
            setError('');
            await userService.changePassword(user.id, passwordData);
            setViewMode('VIEW'); // Xong việc thì quay về màn hình Xem
            alert('Đổi mật khẩu thành công!'); // Tạm thời dùng alert, sau này ta sẽ cài Toast xịn xò
        } catch (err) {
            setError(err.message || 'Lỗi khi đổi mật khẩu');
        } finally {
            setActionLoading(false);
        }
    };

    // Màn hình Loading xoay xoay
    if (loading && !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h2>
                <div className="flex space-x-3">
                    {viewMode === 'VIEW' && (
                        <>
                            <button
                                onClick={() => setViewMode('PASSWORD')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <KeyIcon className="h-4 w-4 mr-2" />
                                Đổi mật khẩu
                            </button>
                            <button
                                onClick={() => setViewMode('EDIT')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Chỉnh sửa
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* --- THÔNG BÁO LỖI CHUNG --- */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* --- LẮP RÁP CÁC MẢNH GHÉP --- */}
            {viewMode === 'VIEW' && <ProfileInfo user={user} />}

            {viewMode === 'EDIT' && (
                <EditProfileForm
                    user={user}
                    onSubmit={handleUpdateProfile}
                    onCancel={() => setViewMode('VIEW')}
                    loading={actionLoading}
                />
            )}

            {viewMode === 'PASSWORD' && (
                <ChangePasswordForm
                    onSubmit={handleChangePassword}
                    onCancel={() => setViewMode('VIEW')}
                    loading={actionLoading}
                />
            )}
        </div>
    );
};

export default UserProfileFeature;