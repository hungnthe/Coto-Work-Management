    // src/App.jsx
// ★ Chỉ thêm 2 dòng so với App.jsx gốc:
//   1. import NotificationPage
//   2. <Route path="/notifications" element={<NotificationPage />} />

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout
import AdminLayout from './components/layout/AdminLayout/AdminLayout.jsx';
import ClientLayout from './components/layout/ClientLayout/ClientLayout.jsx';

// Pages (Client)
import ClientLoginPage from './pages/ClientLoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ProfilePage from './pages/ProfilePage';
import TaskManagementPage from './pages/TaskManagementPage';
import NotificationPage from './pages/NotificationPage'; // ★ THÊM

// Pages (Admin)
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserList from './pages/Admin/UserList';
import CreateUser from './pages/Admin/CreateUser';
import UnitManagementPage from './pages/Admin/UnitManagementPage';
import UserDetailPage     from './pages/Admin/UserDetailPage';

// ── Protected routes (giữ nguyên) ────────────────────────────
const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
                <p className="text-gray-500">Đang tải...</p>
            </div>
        </div>
    );
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminProtectedRoute = () => {
    const { isAuthenticated, hasRole, loading } = useAuth();
    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
                <p className="text-gray-500">Đang tải...</p>
            </div>
        </div>
    );
    if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
    if (!hasRole('ADMIN') && !hasRole('MANAGER')) return <Navigate to="/" replace />;
    return <Outlet />;
};

const PublicRoute = ({ children, redirectTo = '/' }) => {
    const { isAuthenticated, hasRole, loading } = useAuth();
    if (loading) return null;
    if (isAuthenticated) {
        if (hasRole('ADMIN') || hasRole('MANAGER')) return <Navigate to="/admin" replace />;
        return <Navigate to={redirectTo} replace />;
    }
    return children;
};

// ── App ───────────────────────────────────────────────────────
function App() {
    return (
        <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>

                    {/* Login */}
                    <Route path="/login" element={<PublicRoute><ClientLoginPage /></PublicRoute>} />
                    <Route path="/admin/login" element={<PublicRoute redirectTo="/admin"><AdminLoginPage /></PublicRoute>} />

                    {/* Client routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<ClientLayout />}>
                            <Route path="/"              element={<HomePage />} />
                            <Route path="/profile"       element={<ProfilePage />} />
                            <Route path="/tasks"         element={<TaskManagementPage />} />
                            <Route path="/notifications" element={<NotificationPage />} /> {/* ★ THÊM */}
                        </Route>
                    </Route>

                    {/* Admin routes */}
                    <Route element={<AdminProtectedRoute />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/admin"              element={<AdminDashboard />} />
                            <Route path="/admin/users"        element={<UserList />} />
                            <Route path="/admin/users/create" element={<CreateUser />} />
                            <Route path="/admin/users/:id"    element={<UserDetailPage />} />
                            <Route path="/admin/units"        element={<UnitManagementPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;