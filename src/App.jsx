import React, { useState, useEffect } from 'react';
import {
  createHashRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { ConfigProvider } from 'antd';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import NewProject from './pages/NewProject.jsx';
import Tasks from './pages/Tasks.jsx';
import Reports from './pages/Reports.jsx';
import Timeline from './pages/Timeline.jsx';
import Users from './pages/Users.jsx';
import AppLayout from './components/Layout.jsx';
import './App.css';
import Supply from './pages/Supply.jsx';
import Installation from './pages/Installation.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        Loading...
      </div>
    );
  }

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    return user ? (
      children
    ) : (
      <Navigate to="/login" replace />
    );
  };

  const router = createHashRouter(
    [
      {
        path: '/login',
        element: user ? (
          <Navigate to="/dashboard" replace />
        ) : (
          <LoginPage onLogin={handleLogin} />
        ),
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <AppLayout user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        ),
        children: [
          { path: 'dashboard', element: <Dashboard user={user} /> },
          { path: 'projects', element: <Projects user={user} /> },
          { path: 'new-project', element: <NewProject user={user} /> },
          { path: 'supply', element: <Supply user={user} /> },
          { path: 'installation', element: <Installation user={user} /> },
          { path: 'tasks', element: <Tasks user={user} /> },
          { path: 'reports', element: <Reports user={user} /> },
          { path: 'timeline', element: <Timeline user={user} /> },
          { path: 'users', element: <Users user={user} /> },
          // Default redirect
          { index: true, element: <Navigate to="dashboard" replace /> },
        ],
      },
    ],
    {
      future: {
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      },
    }
  );

  return (
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
