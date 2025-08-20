import React from "react";
import { Form, Input, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();

    const onFinish = (values) => {
        console.log("Login Success:", values);
        // Normally: validate with API before navigating
        navigate("/app");
    };

    return (
        <div style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f0f2f5"
        }}>
            <Card title="CRM + ERP Login" style={{ width: 350, borderRadius: 8 }}>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item label="Username" name="username" rules={[{ required: true, message: "Please enter username" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please enter password" }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default LoginPage;
