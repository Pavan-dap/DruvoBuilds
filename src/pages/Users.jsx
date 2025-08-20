import React from 'react';
import { Card, Table, Button, Space, Tag, Typography, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Users = () => {
  const mockUsers = [
    {
      key: '1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'Admin',
      department: 'IT',
      status: 'Active',
      lastLogin: '2024-02-10'
    },
    {
      key: '2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: 'Manager',
      department: 'Sales',
      status: 'Active',
      lastLogin: '2024-02-09'
    },
    {
      key: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      role: 'Executive',
      department: 'Marketing',
      status: 'Inactive',
      lastLogin: '2024-01-25'
    },
    {
      key: '4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      role: 'User',
      department: 'HR',
      status: 'Active',
      lastLogin: '2024-02-10'
    }
  ];

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{name}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colors = {
          'Admin': 'red',
          'Manager': 'blue',
          'Executive': 'green',
          'User': 'default'
        };
        return <Tag color={colors[role]}>{role}</Tag>;
      },
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<EditOutlined />} size="small" />
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>User Management</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Add User
        </Button>
      </div>
      
      <Card>
        <Table 
          columns={columns} 
          dataSource={mockUsers}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default Users;
