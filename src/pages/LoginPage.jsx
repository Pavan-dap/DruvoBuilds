import React, { useState } from 'react';
import { Card, Form, Input, Button, Alert, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_ENDPOINTS, APP_CONFIG } from '../utils/config';

const { Title, Text } = Typography;

// Demo accounts for testing
const DEMO_ACCOUNTS = [
  { user_id: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' },
  { user_id: 'manager', password: 'manager123', name: 'Project Manager', role: 'manager' },
  { user_id: 'executive', password: 'exec123', name: 'Executive', role: 'executive' }
];

function LoginPage({ onLogin }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      setError('');

      const { user_id, password } = values;

      // First try API login
      try {
        const response = await axios.post(API_ENDPOINTS.LOGIN, {
          user_id,
          password
        }, {
          timeout: APP_CONFIG.TIMEOUT,
          headers: APP_CONFIG.DEFAULT_HEADERS
        });

        if (response.data) {
          const userData = response.data;
          
          // Create user object
          const userObj = {
            id: userData.user_id || user_id,
            user_id: userData.user_id || user_id,
            name: userData.name || user_id,
            designation: userData.designation || 'User',
            status: userData.Emp_Status || 'Active',
            role: mapDesignationToRole(userData.designation) || 'user',
          };

          // Store in localStorage
          localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, userData.token || `token_${Date.now()}`);
          localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, JSON.stringify(userObj));

          // Call parent callback
          onLogin(userObj);
          return;
        }
      } catch (apiError) {
        console.warn('API login failed, trying demo accounts:', apiError.message);
      }

      // Fallback to demo accounts
      const demoUser = DEMO_ACCOUNTS.find(
        account => account.user_id === user_id && account.password === password
      );

      if (demoUser) {
        const userObj = {
          id: demoUser.user_id,
          user_id: demoUser.user_id,
          name: demoUser.name,
          designation: demoUser.role,
          status: 'Active',
          role: demoUser.role,
        };

        // Store in localStorage
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, `demo_token_${Date.now()}`);
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, JSON.stringify(userObj));

        // Call parent callback
        onLogin(userObj);
      } else {
        setError('Invalid credentials. Please check your user ID and password.');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map designation to role
  const mapDesignationToRole = (designation) => {
    const designationLower = designation?.toLowerCase() || '';
    
    if (designationLower.includes('admin')) return 'admin';
    if (designationLower.includes('manager')) return 'manager';
    if (designationLower.includes('executive')) return 'executive';
    if (designationLower.includes('incharge')) return 'incharge';
    
    return 'user';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            DruvoBuilds
          </Title>
          <Text type="secondary">Please sign in to continue</Text>
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
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="user_id"
            label="User ID"
            rules={[
              { required: true, message: 'Please input your user ID!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your user ID"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 40 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>Demo Accounts</Divider>
        
        <div style={{ fontSize: '12px', color: '#666' }}>
          <Text strong>Test Credentials:</Text>
          <div style={{ marginTop: 8 }}>
            {DEMO_ACCOUNTS.map((account, index) => (
              <div key={index} style={{ marginBottom: 4 }}>
                <Text code>{account.user_id}</Text> / <Text code>{account.password}</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>({account.role})</Text>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
