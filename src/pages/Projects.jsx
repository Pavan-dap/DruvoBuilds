import React from 'react';
import { Card, Table, Button, Space, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Projects = () => {
  const mockProjects = [
    {
      key: '1',
      name: 'E-Commerce Platform',
      status: 'In Progress',
      deadline: '2024-03-15',
      team: 5,
      budget: '$45,000'
    },
    {
      key: '2',
      name: 'Mobile App Development',
      status: 'Planning',
      deadline: '2024-04-20',
      team: 3,
      budget: '$32,000'
    },
    {
      key: '3',
      name: 'Data Migration',
      status: 'Completed',
      deadline: '2024-01-30',
      team: 2,
      budget: '$18,000'
    }
  ];

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'Completed' ? 'green' : status === 'In Progress' ? 'blue' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
    },
    {
      title: 'Team Size',
      dataIndex: 'team',
      key: 'team',
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
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
        <Title level={2}>Projects</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Add Project
        </Button>
      </div>
      
      <Card>
        <Table 
          columns={columns} 
          dataSource={mockProjects}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default Projects;
