import React from 'react';
import { Card, Button, Typography, Space, Tag, Layout, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Header, Content } = Layout;

function Dashboard({ user, onLogout }) {
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DashboardOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: 12 }} />
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            CRM-ERP Dashboard
          </Title>
        </div>
        
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text strong>{user?.name}</Text>
            <Tag color={getRoleColor(user?.role)} size="small">
              {user?.role?.toUpperCase()}
            </Tag>
          </Space>
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            onClick={onLogout}
            danger
          >
            Logout
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card style={{ marginBottom: 24 }}>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Title level={2} style={{ color: '#52c41a', marginBottom: 16 }}>
                🎉 Welcome to CRM-ERP System!
              </Title>
              <Text style={{ fontSize: '16px', color: '#666' }}>
                You have successfully logged in as <strong>{user?.name}</strong>
              </Text>
              <div style={{ marginTop: 16 }}>
                <Tag color={getRoleColor(user?.role)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                  Role: {user?.role?.toUpperCase()}
                </Tag>
              </div>
            </div>
          </Card>

          <Card title="User Information" style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <Text strong>User ID:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text code>{user?.user_id}</Text>
                </div>
              </div>
              <div>
                <Text strong>Name:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{user?.name}</Text>
                </div>
              </div>
              <div>
                <Text strong>Role:</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color={getRoleColor(user?.role)}>
                    {user?.role?.toUpperCase()}
                  </Tag>
                </div>
              </div>
              <div>
                <Text strong>Status:</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color="green">{user?.status}</Tag>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Quick Actions" style={{ marginBottom: 24 }}>
            <Space wrap>
              <Button type="primary">Manage Projects</Button>
              <Button>View Tasks</Button>
              <Button>Generate Reports</Button>
              <Button>User Management</Button>
            </Space>
          </Card>

          <Card title="System Status">
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text style={{ color: '#52c41a', fontSize: '16px' }}>
                ✅ All systems operational
              </Text>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  Login system working correctly with HashRouter
                </Text>
              </div>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}

export default Dashboard;
