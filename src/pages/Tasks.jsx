import React from 'react';
import { Card, Table, Button, Space, Tag, Typography, Progress } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Tasks = () => {
  const mockTasks = [
    {
      key: '1',
      title: 'Design Homepage',
      project: 'E-Commerce Platform',
      assignee: 'John Doe',
      priority: 'High',
      status: 'In Progress',
      progress: 60,
      dueDate: '2024-02-15'
    },
    {
      key: '2',
      title: 'Database Setup',
      project: 'Mobile App Development',
      assignee: 'Jane Smith',
      priority: 'Medium',
      status: 'Todo',
      progress: 0,
      dueDate: '2024-02-20'
    },
    {
      key: '3',
      title: 'Testing Phase',
      project: 'Data Migration',
      assignee: 'Mike Johnson',
      priority: 'Low',
      status: 'Completed',
      progress: 100,
      dueDate: '2024-01-30'
    }
  ];

  const columns = [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Project',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: 'Assignee',
      dataIndex: 'assignee',
      key: 'assignee',
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        let color = priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'Completed' ? 'green' : status === 'In Progress' ? 'blue' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress} size="small" />,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
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
        <Title level={2}>Tasks</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Add Task
        </Button>
      </div>
      
      <Card>
        <Table 
          columns={columns} 
          dataSource={mockTasks}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default Tasks;
