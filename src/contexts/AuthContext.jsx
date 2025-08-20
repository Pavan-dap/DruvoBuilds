import React, { createContext, useContext, useState, useEffect } from 'react';
import authMethods from '../config/auth.config.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);

        // Validate token is not expired
        try {
          const tokenData = JSON.parse(atob(token));
          if (tokenData.expires && Date.now() > tokenData.expires) {
            // Token expired
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setLoading(false);
            return;
          }
        } catch (tokenError) {
          // Invalid token format, treat as valid for API tokens
        }

        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (user_id, password) => {
    try {
      setLoading(true);

      // Call the real API
      const result = await authMethods.login(user_id, password);

      if (result.success) {
        const userData = result.data;

        // Map API response to user object
        const userObj = {
          id: userData.user_id,
          user_id: userData.user_id,
          name: userData.name,
          designation: userData.designation,
          status: userData.Emp_Status,
          role: getRole(userData.designation), // Map designation to role
        };

        // Generate a token for this session
        const tokenData = {
          userId: userData.user_id,
          timestamp: Date.now(),
          expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };

        const token = btoa(JSON.stringify(tokenData));

        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('token', token);

        return { success: true, user: userObj };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map designation to role
  const getRole = (designation) => {
    const designationLower = designation?.toLowerCase() || '';

    if (designationLower.includes('admin')) return 'admin';
    if (designationLower.includes('manager')) return 'manager';
    if (designationLower.includes('executive')) return 'executive';
    if (designationLower.includes('incharge')) return 'incharge';

    // Default role
    return 'incharge';
  };

  const logout = async () => {
    try {
      await authMethods.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;

    const roleHierarchy = {
      admin: 4,
      manager: 3,
      executive: 2,
      incharge: 1
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  const value = {
    user,
    login,
    logout,
    hasRole,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
