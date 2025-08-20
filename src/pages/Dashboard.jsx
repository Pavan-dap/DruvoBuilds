import React from "react";
import { Card, Row, Col, Statistic, Typography, Space, Tag } from "antd";
import { UserOutlined, ProjectOutlined, CheckSquareOutlined, FileTextOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";

const { Title } = Typography;

function Dashboard() {
    const { user } = useAuth();

    const getRoleColor = (role) => {
        const colors = {
            admin: 'red',
            manager: 'blue', 
            executive: 'green',
            incharge: 'orange'
        };
        return colors[role] || 'default';
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Dashboard</Title>
                <Space>
                    <span>Welcome back, <strong>{user?.name}</strong></span>
                    <Tag color={getRoleColor(user?.role)} style={{ textTransform: 'capitalize' }}>
                        {user?.role}
                    </Tag>
                </Space>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Projects"
                            value={12}
                            prefix={<ProjectOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Tasks"
                            value={28}
                            prefix={<CheckSquareOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Team Members"
                            value={15}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Reports"
                            value={8}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card title="Recent Activity" style={{ height: 400 }}>
                        <p>Recent project updates and activities will be displayed here.</p>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Quick Actions" style={{ height: 400 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <p>Quick action buttons and shortcuts will be available here.</p>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default Dashboard;