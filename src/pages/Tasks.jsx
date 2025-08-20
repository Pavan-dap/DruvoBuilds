import React, { useState, useEffect } from "react";
import { Card, Table, Button, Space, Typography, Tag, message, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import taskMethods from "../config/task.config.js";

const { Title } = Typography;

function Tasks() {
    const { user, hasRole } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const canEdit = hasRole('manager');
    const canDelete = hasRole('admin');

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const result = await taskMethods.getTasks();

            if (result.success) {
                setTasks(result.data);
            } else {
                // Fallback to demo data if API fails
                setTasks([
                    {
                        id: 1,
                        title: 'Setup Development Environment',
                        description: 'Configure development tools and environment',
                        status: 'in_progress',
                        priority: 'high',
                        assignee: 'John Doe',
                        dueDate: '2024-12-25',
                        createdAt: '2024-12-20'
                    },
                    {
                        id: 2,
                        title: 'Database Design',
                        description: 'Design and create database schema',
                        status: 'pending',
                        priority: 'medium',
                        assignee: 'Jane Smith',
                        dueDate: '2024-12-30',
                        createdAt: '2024-12-21'
                    }
                ]);
                message.warning('Unable to load tasks from server. Showing demo data.');
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            message.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'orange',
            in_progress: 'blue',
            completed: 'green',
            on_hold: 'red'
        };
        return colors[status] || 'default';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'green',
            medium: 'orange',
            high: 'red',
            urgent: 'magenta'
        };
        return colors[priority] || 'default';
    };

    const columns = [
        {
            title: 'Task',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <span style={{ fontWeight: 'bold' }}>{text}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>{record.description}</span>
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)} style={{ textTransform: 'capitalize' }}>
                    {status.replace('_', ' ')}
                </Tag>
            ),
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => (
                <Tag color={getPriorityColor(priority)} style={{ textTransform: 'capitalize' }}>
                    {priority}
                </Tag>
            ),
        },
        {
            title: 'Assignee',
            dataIndex: 'assignee',
            key: 'assignee',
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {canEdit && (
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => message.info('Edit functionality coming soon')}
                        />
                    )}
                    {canDelete && (
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => message.info('Delete functionality coming soon')}
                        />
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>Tasks Management</Title>
                {canEdit && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('Add task functionality coming soon')}>
                        Add New Task
                    </Button>
                )}
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={tasks}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tasks`,
                    }}
                />
            </Card>
        </div>
    );
}

export default Tasks;
