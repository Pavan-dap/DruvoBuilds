import React from 'react';
import { Card, Button, Typography, Space, Tag, Row, Col, Statistic } from 'antd';
import { ProjectOutlined, CheckSquareOutlined, TeamOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function Dashboard({ user }) {
  const navigate = useNavigate();

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
    <div>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Title level={2} style={{ color: '#52c41a', marginBottom: 16 }}>
            🎉 Welcome to DruvoBuilds!
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

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={25}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Tasks"
              value={156}
              prefix={<CheckSquareOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Team Members"
              value={42}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Reports Generated"
              value={18}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="User Information" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Text strong>User ID:</Text>
            <div style={{ marginTop: 4 }}>
              <Text code>{user?.user_id}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Name:</Text>
            <div style={{ marginTop: 4 }}>
              <Text>{user?.name}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Role:</Text>
            <div style={{ marginTop: 4 }}>
              <Tag color={getRoleColor(user?.role)}>
                {user?.role?.toUpperCase()}
              </Tag>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Status:</Text>
            <div style={{ marginTop: 4 }}>
              <Tag color="green">{user?.status}</Tag>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="Quick Actions" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              block
              icon={<ProjectOutlined />}
              onClick={() => navigate('/projects')}
            >
              Manage Projects
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              block
              icon={<CheckSquareOutlined />}
              onClick={() => navigate('/tasks')}
            >
              View Tasks
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              block
              icon={<BarChartOutlined />}
              onClick={() => navigate('/reports')}
            >
              Generate Reports
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              block
              icon={<TeamOutlined />}
              onClick={() => navigate('/users')}
            >
              User Management
            </Button>
          </Col>
        </Row>
      </Card>

      <Card title="System Status">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Text style={{ color: '#52c41a', fontSize: '16px' }}>
            ✅ All systems operational
          </Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              Responsive sidebar layout with HashRouter navigation
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Dashboard;
