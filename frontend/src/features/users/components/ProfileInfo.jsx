import React from 'react';
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { getRoleDisplayName } from '../../../utils/constants';

const ProfileInfo = ({ user }) => {
    if (!user) return null;

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.fullName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <UserIcon className="h-8 w-8 text-indigo-600" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            {user.fullName}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            @{user.username}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
              {getRoleDisplayName(user.role)}
            </span>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200">
                <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                            <EnvelopeIcon className="h-4 w-4 mr-2" />
                            Email
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {user.email}
                        </dd>
                    </div>

                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            Số điện thoại
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {user.phoneNumber || <span className="text-gray-400">Chưa có thông tin</span>}
                        </dd>
                    </div>

                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                            <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                            Đơn vị
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {user.unit ? (
                                <div>
                                    <div className="font-medium">{user.unit.unitName}</div>
                                    <div className="text-gray-500 text-xs">Mã: {user.unit.unitCode}</div>
                                </div>
                            ) : (
                                <span className="text-gray-400">Chưa có đơn vị</span>
                            )}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
};

export default ProfileInfo;