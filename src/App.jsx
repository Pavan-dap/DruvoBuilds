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

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
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
      onClick: () => {
        console.log("Logout clicked");
      },
    },
  ];

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
        }}
      >
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            borderBottom: "1px solid #f0f0f0",
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
            padding: "0 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "2px 1px 4px rgba(0,0,0,0.1)",
            position: "fixed",
            width: "100%",
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Title level={4} style={{ margin: 0 }}>
              Welcome User
            </Title>
          </div>
          <Space>
            <Badge count={0}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar>U</Avatar>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            marginTop: 64,
            padding: 16,
            background: "#f5f5f5",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* <Route path="/timeline" element={<GanttChart />} /> */}
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      {/* <GlobalStateProvider> */}
      {/* <DataProvider> */}
      <Routes>
        <Route path="/*" element={<AppContent />} />
      </Routes>
      {/* </DataProvider> */}
      {/* </GlobalStateProvider> */}
    </Router>
  );
}

export default App;
