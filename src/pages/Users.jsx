import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Typography, Avatar, message, Spin, Modal, Form, Input, Select, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/config';
const { Title } = Typography;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.USERS);
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Submit user form
  const handleSubmit = async (values) => {
    if (values.password !== values.confirm_password) {
      message.error("Password and Confirm Password do not match");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(API_ENDPOINTS.USERS, values);
      message.success('User added successfully');
      setModalVisible(false);
      form.resetFields();
      fetchUsers(); // refresh data
    } catch (error) {
      console.error(error);
      message.error('Failed to add user');
    } finally {
      setSubmitting(false);
    }
  };

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
            <div style={{ fontSize: '12px', color: '#999' }}>{record.emp_id}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Password',
      dataIndex: 'password',
      key: 'password',
      render: (password) => (
        <Tooltip title={password}>
          <span style={{ userSelect: 'none', cursor: 'pointer' }}>{'*'.repeat(password?.length || 6)}</span>
        </Tooltip>
      )
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      render: (designation) => {
        const colors = {
          'Manager': 'blue',
          'Incharge': 'green',
          'Executive': 'orange',
          'Admin': 'red',
        };
        return <Tag color={colors[designation] || 'default'}>{designation}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'Emp_Status',
      key: 'Emp_Status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button disabled size="small" icon={<EditOutlined />} />
          <Button disabled size="small" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>User Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Add User
        </Button>
      </div>

      <Card size="small">
        {loading ? (
          <Spin tip="Loading users..." />
        ) : (
          <Table
            columns={columns}
            dataSource={users.map(u => ({ ...u, key: u.id }))}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>

      {/* Add User Modal */}
      <Modal
        title="Add User"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input autoComplete="off" />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password autoComplete="off" />
          </Form.Item>

          <Form.Item name="confirm_password" label="Confirm Password" rules={[{ required: true }]}>
            <Input.Password autoComplete="off" />
          </Form.Item>

          <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Manager">Manager</Select.Option>
              <Select.Option value="Incharge">Incharge</Select.Option>
              <Select.Option value="Executive">Executive</Select.Option>
              <Select.Option value="Admin">Admin</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="Emp_Status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>Submit</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
