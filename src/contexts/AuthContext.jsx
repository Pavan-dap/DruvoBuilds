import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Demo users for different roles
const demoUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: 'John Admin',
    emp_no: 'EMP001',
    designation: 'System Administrator',
    role: 'admin',
    status: 'active',
    email: 'admin@company.com',
    department: 'IT',
    joinDate: '2020-01-15'
  },
  {
    id: 2,
    username: 'manager',
    password: 'manager123',
    name: 'Sarah Manager',
    emp_no: 'EMP002',
    designation: 'Project Manager',
    role: 'manager',
    status: 'active',
    email: 'manager@company.com',
    department: 'Operations',
    joinDate: '2021-03-10'
  },
  {
    id: 3,
    username: 'executive',
    password: 'exec123',
    name: 'Mike Executive',
    emp_no: 'EMP003',
    designation: 'Senior Executive',
    role: 'executive',
    status: 'active',
    email: 'executive@company.com',
    department: 'Sales',
    joinDate: '2022-06-20'
  },
  {
    id: 4,
    username: 'incharge',
    password: 'incharge123',
    name: 'Lisa Incharge',
    emp_no: 'EMP004',
    designation: 'Team Incharge',
    role: 'incharge',
    status: 'active',
    email: 'incharge@company.com',
    department: 'Marketing',
    joinDate: '2023-02-14'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Demo login - find user in demo data
      const foundUser = demoUsers.find(
        u => u.username === username && u.password === password
      );

      if (!foundUser) {
        throw new Error('Invalid username or password');
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Generate a demo token
      const token = `demo_token_${foundUser.id}_${Date.now()}`;
      
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      localStorage.setItem('token', token);
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
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