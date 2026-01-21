import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import UserList from './components/users/UserList';
import UserForm from './components/users/UserForm';
import UserDetail from './components/users/UserDetail';
import UserProfile from './components/users/UserProfile';
import UnitList from './components/units/UnitList';
import TestComponent from './components/test/TestComponent';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('test'); // Start with test component
  const [currentView, setCurrentView] = useState('list'); // list, form, detail
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setCurrentView('detail');
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setCurrentView('form');
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setCurrentView('form');
  };

  const handleUserSave = (user) => {
    setCurrentView('list');
    setSelectedUser(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedUser(null);
    setSelectedUnit(null);
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setCurrentView('detail');
  };

  const handleCreateUnit = () => {
    setSelectedUnit(null);
    setCurrentView('form');
  };

  const handleEditUnit = (unit) => {
    setSelectedUnit(unit);
    setCurrentView('form');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'test':
        return <TestComponent />;
      case 'users':
        switch (currentView) {
          case 'form':
            return (
              <UserForm
                user={selectedUser}
                onSave={handleUserSave}
                onCancel={handleCancel}
              />
            );
          case 'detail':
            return (
              <UserDetail
                user={selectedUser}
                onEdit={() => handleEditUser(selectedUser)}
                onClose={handleCancel}
              />
            );
          default:
            return (
              <UserList
                onUserSelect={handleUserSelect}
                onCreateUser={handleCreateUser}
                onEditUser={handleEditUser}
              />
            );
        }
      case 'units':
        return (
          <UnitList
            onUnitSelect={handleUnitSelect}
            onCreateUnit={handleCreateUnit}
            onEditUnit={handleEditUnit}
          />
        );
      case 'profile':
        return <UserProfile />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">
              Chọn một mục từ menu bên trái
            </h2>
          </div>
        );
    }
  };

  // For testing, show the test component without authentication
  if (activeSection === 'test') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              User Service Frontend - Test Mode
            </h1>
            <button
              onClick={() => setActiveSection('users')}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Switch to App Mode
            </button>
          </div>
        </div>
        <TestComponent />
      </div>
    );
  }

  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex">
            <Sidebar 
              activeSection={activeSection} 
              onSectionChange={(section) => {
                setActiveSection(section);
                setCurrentView('list');
                setSelectedUser(null);
                setSelectedUnit(null);
              }} 
            />
            <main className="flex-1 p-6">
              {renderContent()}
            </main>
          </div>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;