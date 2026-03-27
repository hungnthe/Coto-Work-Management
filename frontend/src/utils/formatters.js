// Date Format
export const formatDateTime = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long', // Hiển thị "tháng 1" thay vì "01"
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};


export const getInitials = (fullName) => {
    if (!fullName) return '?';
    return fullName.charAt(0).toUpperCase();
};