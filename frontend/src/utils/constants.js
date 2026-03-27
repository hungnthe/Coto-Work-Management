// Role List
export const ROLES = [
    { value: 'ADMIN', label: 'Quản trị viên' },
    { value: 'MANAGER', label: 'Trưởng đơn vị' },
    { value: 'USER', label: 'Nhân viên' },
    { value: 'VIEWER', label: 'Người xem' }
];

// get Role
export const getRoleDisplayName = (role) => {
    const roleObj = ROLES.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
};