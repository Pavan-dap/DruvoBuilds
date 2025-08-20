import React from "react";
import { Form, Input, Button, Card, Alert, Typography, Space, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const onFinish = async (values) => {
        setLoading(true);
        setError('');

        const result = await login(values.user_id, values.password);

        if (result.success) {
            navigate("/dashboard");
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "20px"
        }}>
            <Card 
                style={{ 
                    width: "100%", 
                    maxWidth: 400, 
                    borderRadius: 12,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <Title level={2} style={{ color: "#1890ff", marginBottom: 8 }}>
                        CRM-ERP System
                    </Title>
                    <Text type="secondary">Sign in to your account</Text>
                </div>

                {error && (
                    <Alert 
                        message={error} 
                        type="error" 
                        showIcon 
                        style={{ marginBottom: 16 }}
                    />
                )}

                <Form 
                    form={form}
                    layout="vertical" 
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="user_id"
                        rules={[{ required: true, message: "Please enter user ID" }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="User ID"
                        />
                    </Form.Item>
                    
                    <Form.Item 
                        name="password" 
                        rules={[{ required: true, message: "Please enter password" }]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined />}
                            placeholder="Password"
                        />
                    </Form.Item>
                    
                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            block 
                            loading={loading}
                            style={{ height: 45 }}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </Form.Item>
                </Form>

                <Divider>Demo Accounts</Divider>
                
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        <strong>Example:</strong> User ID: 10002, Password: Pavan@1
                    </div>
                </Space>
            </Card>
        </div>
    );
}

export default LoginPage;
