import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Progress,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/config';

const { Title } = Typography;
const { Option } = Select;

const Tasks = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.TASKS, { params: { Emp_No: user.user_id } });
      setTasks(res.data || []);
    } catch (error) {
      console.error(error);
      message.error('Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.USERS_LIST);
      // exclude designation === Manager
      const EXCLUDED_ROLES = ["Manager", "Admin", "CEO"];
      setUsers((res.data || []).filter(u => !EXCLUDED_ROLES.includes(u.designation)))
    } catch (error) {
      console.error(error);
      message.error('Error fetching users');
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.TASKS_PROJECTS);
      setProjects(res.data || []);
    } catch (error) {
      console.error(error);
      message.error('Error fetching projects');
    }
  };

  const handleAddTask = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [projectId, towerName, floors] = values.projectTower.split('|');

      const payload = {
        Project_ID: projectId,
        Assigned_By: user.user_id, // current logged-in user
        Assigned_To: values.assignee,
        Towers: towerName,
        Floors: Number(floors), // ensure number
        Task_Name: values.title,
        Priority: values.priority,
        Due_Date: values.dueDate.format('YYYY-MM-DD'),
      };

      await axios.post(API_ENDPOINTS.TASKS, payload);
      message.success('Task added successfully');
      setModalVisible(false);
      fetchTasks();
    } catch (error) {
      console.error(error);
      message.error('Failed to add task');
    }
  };

  const columns = [
    {
      title: 'Task Name',
      dataIndex: 'Task_Name',
      key: 'Task_Name',
    },
    {
      title: 'Project ID',
      dataIndex: 'Project_ID',
      key: 'Project_ID',
    },
    {
      title: 'Tower',
      dataIndex: 'Towers',
      key: 'Towers',
    },
    {
      title: 'Floors',
      dataIndex: 'Floors',
      key: 'Floors',
    },
    {
      title: 'Assigned To',
      dataIndex: 'Assigned_To',
      key: 'Assigned_To',
    },
    {
      title: 'Assigned By',
      dataIndex: 'Assigned_By',
      key: 'Assigned_By',
    },
    {
      title: 'Priority',
      dataIndex: 'Priority',
      key: 'Priority',
      render: (priority) => {
        let color = priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'Due_Date',
      key: 'Due_Date',
    },
    {
      title: 'Created At',
      dataIndex: 'Created_At',
      key: 'Created_At',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" disabled />
          <Button icon={<DeleteOutlined />} size="small" danger disabled />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Tasks
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTask}>
          Add Task
        </Button>
      </div>

      <Card size="small">
        <Table
          columns={columns}
          dataSource={tasks}
          loading={loading}
          rowKey={(record) => record.Task_ID || record.key}
          size="small"
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add Task Modal */}
      <Modal
        title="Add Task"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText="Submit"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Assign To"
            name="assignee"
            rules={[{ required: true, message: 'Please select assignee' }]}
          >
            <Select placeholder="Select user">
              {users?.map((u) => (
                <Option key={u.emp_id} value={u.emp_id}>
                  {u.name} ({u.designation})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Project & Tower"
            name="projectTower"
            rules={[{ required: true, message: 'Please select project tower' }]}
          >
            <Select placeholder="Select Project Tower">
              {projects.map((proj) =>
                proj.Towers.map((tower) => (
                  <Option
                    key={`${proj.Project_ID}|${tower.Towers}|${tower.Floor_Count}`}
                    value={`${proj.Project_ID}|${tower.Towers}|${tower.Floor_Count}`}
                    disabled={tower.Assign_Tower_Status === 'Completed'}
                  >
                    {proj.Project_Name} - {tower.Towers} (Floors: {tower.Floor_Count}, {tower.Assign_Tower_Status})
                  </Option>
                ))
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true, message: 'Please select priority' }]}
          >
            <Select>
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Due Date"
            name="dueDate"
            rules={[{ required: true, message: 'Please select due date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Tasks;
