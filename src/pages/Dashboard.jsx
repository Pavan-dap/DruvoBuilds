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
      <Card size="small" style={{ marginBottom: 16 }} bodyStyle={{ padding: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={3} style={{ color: '#52c41a', margin: '8px 0' }}>
            🎉 Welcome to DruvoBuilds!
          </Title>
          <Text style={{ fontSize: '14px', color: '#666' }}>
            You have successfully logged in as <strong>{user?.name}</strong>
          </Text>
          <div style={{ marginTop: 12 }}>
            <Tag color={getRoleColor(user?.role)} size="small">
              Role: {user?.role?.toUpperCase()}
            </Tag>
          </div>
        </div>
      </Card>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Total Projects"
              value={25}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Active Tasks"
              value={156}
              prefix={<CheckSquareOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Team Members"
              value={42}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Reports Generated"
              value={18}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="User Information" size="small" style={{ marginBottom: 16 }} bodyStyle={{ padding: '12px' }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={6}>
            <Text strong>User ID:</Text>
            <div style={{ marginTop: 2 }}>
              <Text code>{user?.user_id}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Name:</Text>
            <div style={{ marginTop: 2 }}>
              <Text>{user?.name}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Role:</Text>
            <div style={{ marginTop: 2 }}>
              <Tag color={getRoleColor(user?.role)} size="small">
                {user?.role?.toUpperCase()}
              </Tag>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Status:</Text>
            <div style={{ marginTop: 2 }}>
              <Tag color="green" size="small">{user?.status}</Tag>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="Quick Actions" size="small" style={{ marginBottom: 16 }} bodyStyle={{ padding: '12px' }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              block
              size="small"
              icon={<ProjectOutlined />}
              onClick={() => navigate('/projects')}
            >
              Manage Projects
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              block
              size="small"
              icon={<CheckSquareOutlined />}
              onClick={() => navigate('/tasks')}
            >
              View Tasks
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              block
              size="small"
              icon={<BarChartOutlined />}
              onClick={() => navigate('/reports')}
            >
              Generate Reports
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              block
              size="small"
              icon={<TeamOutlined />}
              onClick={() => navigate('/users')}
            >
              User Management
            </Button>
          </Col>
        </Row>
      </Card>

      <Card title="System Status" size="small" bodyStyle={{ padding: '12px' }}>
        <div style={{ textAlign: 'center', padding: '12px' }}>
          <Text style={{ color: '#52c41a', fontSize: '14px' }}>
            ✅ All systems operational
          </Text>
          <div style={{ marginTop: 4 }}>
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
