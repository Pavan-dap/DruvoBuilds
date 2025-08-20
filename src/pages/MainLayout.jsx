import React from "react";
import { Layout, Menu, Button } from "antd";
import { EditOutlined, LogoutOutlined } from "@ant-design/icons"
import { useNavigate, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./Dashboard";
import Projects from "./Projects";
import Tasks from "./Tasks";
import Reports from "./Reports";

const { Header, Sider, Content, Footer } = Layout;

function MainLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const items = [
        {
            key: "1",
            icon: <EditOutlined />,
            label: <Link to="/app/dashboard">Dashboard</Link>,
        },
        {
            key: "2",
            icon: <EditOutlined />,
            label: <Link to="/app/projects">Projects</Link>,
        },
        {
            key: "3",
            icon: <EditOutlined />,
            label: <Link to="/app/tasks">Tasks</Link>,
        },
        {
            key: "4",
            icon: <EditOutlined />,
            label: <Link to="/app/reports">Reports</Link>,
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                style={{
                    overflow: "hidden",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <div
                    className="logo"
                    style={{
                        color: "white",
                        padding: "1rem",
                        textAlign: "center",
                        fontWeight: "bold",
                    }}
                >
                    CRM-ERP
                </div>

                <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]} items={items} />

                <div style={{ padding: "1rem", textAlign: "center" }}>
                    <Button type="primary" danger block onClick={handleLogout} icon={<LogoutOutlined />} />
                </div>
            </Sider>

            {/* Main Layout */}
            <Layout style={{ marginLeft: 200 }}>
                <Header style={{ background: "#fff", padding: "0 16px" }}>
                    <h3>Welcome to CRM + ERP System</h3>
                </Header>

                <Content style={{ margin: "16px" }}>
                    <div
                        style={{
                            padding: 24,
                            background: "#fff",
                            minHeight: "80vh",
                            borderRadius: "8px",
                        }}
                    >
                        {/* Nested Routes */}
                        <Routes>
                            <Route path="/app/dashboard" element={<Dashboard />} />
                            <Route path="/app/projects" element={<Projects />} />
                            <Route path="/app/tasks" element={<Tasks />} />
                            <Route path="/app/reports" element={<Reports />} />
                            {/* fallback */}
                            <Route path="*" element={<Dashboard />} />
                        </Routes>
                    </div>
                </Content>

                <Footer style={{ textAlign: "center" }}>
                    © {new Date().getFullYear()} CRM + ERP System
                </Footer>
            </Layout>
        </Layout >
    );
}

export default MainLayout;
