import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const ChangePasswordForm = ({ onSubmit, onCancel, loading }) => {
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const [localError, setLocalError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (localError) setLocalError(''); // Xóa lỗi khi người dùng gõ lại
    };

    const toggleVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate sương sương ngay tại UI trước khi gọi API
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setLocalError('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }
        onSubmit({
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword
        });
    };

    // Helper function để render input password cho gọn code
    const renderPasswordInput = (id, label, fieldType) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="mt-1 relative">
                <input
                    type={showPasswords[fieldType] ? 'text' : 'password'}
                    name={id}
                    id={id}
                    required
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    value={passwordData[id]}
                    onChange={handleChange}
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleVisibility(fieldType)}
                >
                    {showPasswords[fieldType] ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Đổi mật khẩu
                </h3>

                {localError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{localError}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:w-1/2">
                    {renderPasswordInput('oldPassword', 'Mật khẩu hiện tại', 'old')}
                    {renderPasswordInput('newPassword', 'Mật khẩu mới', 'new')}
                    {renderPasswordInput('confirmPassword', 'Xác nhận mật khẩu mới', 'confirm')}
                </div>
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </button>
            </div>
        </form>
    );
};

export default ChangePasswordForm;