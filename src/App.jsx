import React, { useState, useEffect, useCallback } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Space,
  Typography,
  Badge,
  message,
} from "antd";
import {
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  CalendarOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import LoginPage from "./pages/LoginPage";
import UserProfile from "./components/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
// import GanttChart from "./pages/GanttChart";

// import { DataProvider } from "./contexts/DataContext";
// import { GlobalStateProvider } from "./contexts/GlobalStateContext";

// import "./styles/App.css";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

// --- Menu items ---
const menuItems = [
  {
    key: "dashboard",
    path: "/dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "timeline",
    path: "/timeline",
    icon: <CalendarOutlined />,
    label: "Timeline",
  },
  {
    key: "projects",
    path: "/projects",
    icon: <ProjectOutlined />,
    label: "Projects",
  },
  {
    key: "tasks",
    path: "/tasks",
    icon: <CheckSquareOutlined />,
    label: "Tasks",
  },
  {
    key: "reports",
    path: "/reports",
    icon: <FileTextOutlined />,
    label: "Reports",
  },
];

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [isAuthenticated, location.pathname, navigate]);
  const getActiveMenuKey = () => {
    const item = menuItems.find((i) => i.path === location.pathname);
    return item ? item.key : "dashboard";
  };

  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) setCollapsed(true);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [checkMobile]);

  const handleLogout = () => {
    logout();
    message.success('Logged out successfully');
    navigate('/login');
  };
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate('/profile'),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={240}
        collapsedWidth={isMobile ? 0 : 80}
        style={{
          position: isMobile ? "fixed" : "relative",
          zIndex: isMobile ? 1000 : "auto",
          height: "100vh",
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: isMobile ? "2px 0 8px rgba(0,0,0,0.15)" : "none",
        }}
      >
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          }}
        >
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            {collapsed ? "CRM" : "CRM-ERP"}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getActiveMenuKey()]}
          items={menuItems.map((i) => ({
            key: i.key,
            icon: i.icon,
            label: i.label,
            onClick: () => {
              navigate(i.path);
              if (isMobile) setCollapsed(true);
            },
          }))}
        />
      </Sider>

      {/* Main */}
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            position: "fixed",
            width: `calc(100% - ${isMobile ? 0 : collapsed ? 80 : 240}px)`,
            right: 0,
            zIndex: 100,
            transition: "width 0.2s",
          }}
        >
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "16px",
            flex: 1,
            minWidth: 0
          }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ 
                display: isMobile ? "inline-flex" : "none",
                alignItems: "center",
                justifyContent: "center"
              }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <Title 
                level={4} 
                style={{ 
                  margin: 0,
                  fontSize: isMobile ? "16px" : "20px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                Welcome, {user?.name || 'User'}
              </Title>
              {!isMobile && (
                <div style={{ 
                  fontSize: "12px", 
                  color: "#666",
                  textTransform: "capitalize"
                }}>
                  {user?.designation} • {user?.role}
                </div>
              )}
            </div>
          </div>
          
          <Space size="middle">
            <Badge count={0}>
              <Button 
                type="text" 
                icon={<BellOutlined />}
                style={{ 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              />
            </Badge>
            <Dropdown 
              menu={{ items: userMenuItems }} 
              placement="bottomRight"
              trigger={['click']}
            >
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "6px",
                transition: "background-color 0.2s"
              }}>
                <Avatar 
                  size={isMobile ? 32 : 36}
                  style={{ 
                    backgroundColor: "#1890ff",
                    fontSize: isMobile ? "14px" : "16px"
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                {!isMobile && (
                  <div style={{ 
                    marginLeft: "8px",
                    textAlign: "left",
                    minWidth: 0
                  }}>
                    <div style={{ 
                      fontSize: "14px", 
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "120px"
                    }}>
                      {user?.name}
                    </div>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#666",
                      textTransform: "capitalize"
                    }}>
                      {user?.role}
                    </div>
                  </div>
                )}
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            marginTop: 64,
            padding: isMobile ? 16 : 24,
            background: "#f5f5f5",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            {/* <Route path="/timeline" element={<GanttChart />} /> */}
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute requiredRole="manager">
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* <GlobalStateProvider> */}
        {/* <DataProvider> */}
        <Routes>
          <Route path="/*" element={<AppContent />} />
        </Routes>
        {/* </DataProvider> */}
        {/* </GlobalStateProvider> */}
      </Router>
    </AuthProvider>
  );
}

export default App;
