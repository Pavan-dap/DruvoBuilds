import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Typography, Space, Tag, Spin } from "antd";
import { UserOutlined, ProjectOutlined, CheckSquareOutlined, FileTextOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import dashboardMethods from "../config/dashboard.config.js";

const { Title } = Typography;

function Dashboard() {
    const { user } = useAuth();
    const [dashboardStats, setDashboardStats] = useState({
        totalProjects: 0,
        activeTasks: 0,
        teamMembers: 0,
        reports: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);
            const result = await dashboardMethods.getDashboardStats();

            if (result.success) {
                setDashboardStats(result.data);
            } else {
                // Fallback to demo data if API fails
                setDashboardStats({
                    totalProjects: 12,
                    activeTasks: 28,
                    teamMembers: 15,
                    reports: 8
                });
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            // Fallback to demo data
            setDashboardStats({
                totalProjects: 12,
                activeTasks: 28,
                teamMembers: 15,
                reports: 8
            });
        } finally {
            setLoading(false);
        }
    };

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
                            value={dashboardStats.totalProjects}
                            prefix={<ProjectOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Tasks"
                            value={dashboardStats.activeTasks}
                            prefix={<CheckSquareOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Team Members"
                            value={dashboardStats.teamMembers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Reports"
                            value={dashboardStats.reports}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                            loading={loading}
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
