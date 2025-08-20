import React from 'react';
import { Card, Descriptions, Tag, Avatar, Space, Typography } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const UserProfile = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleColor = (role) => {
    const colors = {
      admin: 'red',
      manager: 'blue',
      executive: 'green',
      incharge: 'orange'
    };
    return colors[role] || 'default';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  return (
    <Card style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar size={80} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
        <Title level={3} style={{ margin: 0 }}>
          {user.name}
        </Title>
        <Space>
          <Tag color={getRoleColor(user.role)} style={{ textTransform: 'capitalize' }}>
            {user.role}
          </Tag>
          <Tag color={getStatusColor(user.status)} style={{ textTransform: 'capitalize' }}>
            {user.status}
          </Tag>
        </Space>
      </div>

      <Descriptions bordered column={1}>
        <Descriptions.Item label="Employee Number">
          {user.emp_no}
        </Descriptions.Item>
        <Descriptions.Item label="Designation">
          {user.designation}
        </Descriptions.Item>
        <Descriptions.Item label="Department">
          <Space>
            <TeamOutlined />
            {user.department}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          <Space>
            <MailOutlined />
            {user.email}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Join Date">
          <Space>
            <CalendarOutlined />
            {new Date(user.joinDate).toLocaleDateString()}
          </Space>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default UserProfile;