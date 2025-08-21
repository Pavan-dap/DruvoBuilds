import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Space, Typography, Tag, Drawer } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout = ({ children, user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 992;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'Projects',
    },
    {
      key: '/new-project',
      icon: <PlusOutlined />,
      label: 'New Project',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: 'Tasks',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
    {
      key: '/timeline',
      icon: <ClockCircleOutlined />,
      label: 'Timeline',
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: 'Users',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setMobileDrawerVisible(false);
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'red',
      manager: 'blue',
      executive: 'green',
      incharge: 'orange',
      user: 'default'
    };
    return colors[role] || 'default';
  };

  const SidebarContent = () => (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ border: 'none', height: 'calc(100vh - 64px)', overflow: 'hidden' }}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          breakpoint="lg"
          collapsedWidth="80"
          width={250}
          style={{
            overflow: 'hidden',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
          }}
          className="desktop-sidebar"
        >
          <div style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? '16px' : '18px',
            fontWeight: 'bold',
            borderBottom: '1px solid #434343'
          }}>
            {collapsed ? 'DB' : 'DruvoBuilds'}
          </div>
          <SidebarContent />
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title="DruvoBuilds"
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        styles={{
          body: { padding: 0, backgroundColor: '#001529' },
          header: { backgroundColor: '#001529', color: 'white', borderBottom: '1px solid #434343' }
        }}
        width={250}
        className="mobile-drawer"
      >
        <SidebarContent />
      </Drawer>

      <Layout style={{ marginLeft: !isMobile ? (collapsed ? 80 : 250) : 0 }}>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => {
                if (isMobile) {
                  setMobileDrawerVisible(true);
                } else {
                  setCollapsed(!collapsed);
                }
              }}
              style={{ marginRight: 16 }}
            />
            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
              DruvoBuilds Dashboard
            </Text>
          </div>

          <Space>
            <Avatar icon={<UserOutlined />} />
            {!isMobile && (
              <Space direction="vertical" size={0}>
                <Text strong>{user?.name}</Text>
                {/* <Tag color={getRoleColor(user?.role)} size="small">
                  {user?.role?.toUpperCase()}
                </Tag> */}
              </Space>
            )}
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={onLogout}
              danger
            >
              {!isMobile ? 'Logout' : ''}
            </Button>
          </Space>
        </Header>

        <Content style={{
          margin: isMobile ? '12px' : '16px',
          padding: isMobile ? '12px' : '16px',
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 96px)',
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
