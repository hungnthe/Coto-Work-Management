import React from 'react';
import UserProfileFeature from '../features/users/UserProfileFeature';

const ProfilePage = () => {
    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Chỉ việc nhúng Nhạc trưởng vào đây, mọi thứ tự động chạy */}
            <UserProfileFeature />
        </div>
    );
};

export default ProfilePage;