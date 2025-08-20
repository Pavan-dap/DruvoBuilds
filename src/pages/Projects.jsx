import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Tabs,
  InputNumber,
  Divider,
  Tag,
  Popconfirm,
  message,
  Collapse,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BuildOutlined,
  HomeOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import projectService from '../services/project.service';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

// Demo data for projects
const initialProjects = [
  {
    id: 1,
    projectName: 'Sunrise Residency',
    customerName: 'ABC Developers',
    location: 'Whitefield',
    address: '123 Main Street, Whitefield, Bangalore',
    mobile: '+91 9876543210',
    email: 'contact@abcdev.com',
    status: 'active',
    towers: [
      {
        id: 1,
        name: 'Tower A',
        floors: 15,
        unitsPerFloor: 4,
        totalUnits: 60
      },
      {
        id: 2,
        name: 'Tower B',
        floors: 12,
        unitsPerFloor: 6,
        totalUnits: 72
      }
    ],
    totalTowers: 2,
    totalUnits: 132,
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    projectName: 'Green Valley Apartments',
    customerName: 'XYZ Constructions',
    location: 'Electronic City',
    address: '456 Tech Park Road, Electronic City, Bangalore',
    mobile: '+91 8765432109',
    email: 'info@xyzcons.com',
    status: 'planning',
    towers: [
      {
        id: 1,
        name: 'Block A',
        floors: 20,
        unitsPerFloor: 8,
        totalUnits: 160
      }
    ],
    totalTowers: 1,
    totalUnits: 160,
    createdAt: '2024-02-10'
  }
];

function Projects() {
  const { user, hasRole } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const canEdit = hasRole('manager');
  const canDelete = hasRole('admin');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const result = await projectService.getProjects();

      if (result.success) {
        setProjects(result.data);
      } else {
        // Fallback to demo data if API fails
        setProjects(initialProjects);
        message.warning('Unable to load projects from server. Showing demo data.');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects(initialProjects);
      message.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = () => {
    setEditingProject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    form.setFieldsValue({
      ...project,
      towers: project.towers || []
    });
    setIsModalVisible(true);
  };

  const handleViewProject = (project) => {
    setViewingProject(project);
    setIsViewModalVisible(true);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const result = await projectService.deleteProject(projectId);
      if (result.success) {
        setProjects(projects.filter(p => p.id !== projectId));
        message.success('Project deleted successfully');
      } else {
        message.error('Failed to delete project: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      message.error('Failed to delete project');
    }
  };

  const handleModalOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Calculate totals
      const towers = values.towers || [];
      const totalTowers = towers.length;
      const totalUnits = towers.reduce((sum, tower) => sum + (tower.floors * tower.unitsPerFloor), 0);
      
      const projectData = {
        ...values,
        totalTowers,
        totalUnits,
        towers: towers.map((tower, index) => ({
          ...tower,
          id: tower.id || index + 1,
          totalUnits: tower.floors * tower.unitsPerFloor
        }))
      };

      if (editingProject) {
        // Update existing project
        const result = await projectService.updateProject(editingProject.id, projectData);
        if (result.success) {
          setProjects(projects.map(p =>
            p.id === editingProject.id
              ? { ...p, ...projectData }
              : p
          ));
          message.success('Project updated successfully');
        } else {
          message.error('Failed to update project: ' + result.error);
          return;
        }
      } else {
        // Add new project
        const newProjectData = {
          ...projectData,
          status: 'planning',
          createdAt: new Date().toISOString().split('T')[0]
        };

        const result = await projectService.createProject(newProjectData);
        if (result.success) {
          const newProject = {
            id: result.data.id || Date.now(),
            ...newProjectData
          };
          setProjects([...projects, newProject]);
          message.success('Project created successfully');
        } else {
          message.error('Failed to create project: ' + result.error);
          return;
        }
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingProject(null);
    form.resetFields();
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      planning: 'processing',
      completed: 'default',
      onhold: 'warning'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <EnvironmentOutlined /> {record.location}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px' }}>{record.mobile}</Text>
          <Text style={{ fontSize: '12px' }}>{record.email}</Text>
        </Space>
      ),
    },
    {
      title: 'Towers',
      dataIndex: 'totalTowers',
      key: 'totalTowers',
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a' }}>
          <BuildOutlined style={{ fontSize: '16px' }} />
        </Badge>
      ),
    },
    {
      title: 'Total Units',
      dataIndex: 'totalUnits',
      key: 'totalUnits',
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: '#1890ff' }}>
          <HomeOutlined style={{ fontSize: '16px' }} />
        </Badge>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ textTransform: 'capitalize' }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewProject(record)}
          />
          {canEdit && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditProject(record)}
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Are you sure you want to delete this project?"
              onConfirm={() => handleDeleteProject(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Projects Management</Title>
        {canEdit && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProject}>
            Add New Project
          </Button>
        )}
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} projects`,
          }}
        />
      </Card>

      {/* Add/Edit Project Modal */}
      <Modal
        title={editingProject ? 'Edit Project' : 'Add New Project'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Tabs 
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: "Basic Details",
                children: (
                  <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="projectName"
                    label="Project Name"
                    rules={[{ required: true, message: 'Please enter project name' }]}
                  >
                    <Input placeholder="Enter project name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="customerName"
                    label="Customer Name"
                    rules={[{ required: true, message: 'Please enter customer name' }]}
                  >
                    <Input placeholder="Enter customer name" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="location"
                    label="Location"
                    rules={[{ required: true, message: 'Please enter location' }]}
                  >
                    <Input placeholder="Enter location" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select placeholder="Select status">
                      <Option value="planning">Planning</Option>
                      <Option value="active">Active</Option>
                      <Option value="completed">Completed</Option>
                      <Option value="onhold">On Hold</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please enter address' }]}
              >
                <TextArea rows={3} placeholder="Enter complete address" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="mobile"
                    label="Mobile Number"
                    rules={[
                      { required: true, message: 'Please enter mobile number' },
                      { pattern: /^[+]?[0-9\s-()]+$/, message: 'Please enter valid mobile number' }
                    ]}
                  >
                    <Input placeholder="Enter mobile number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please enter email' },
                      { type: 'email', message: 'Please enter valid email' }
                    ]}
                  >
                    <Input placeholder="Enter email address" />
                  </Form.Item>
                </Col>
              </Row>
                  </>
                )
              },
              {
                key: "2", 
                label: "Tower Details",
                children: (
              <Form.List name="towers">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card
                        key={key}
                        size="small"
                        title={`Tower ${name + 1}`}
                        extra={
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        }
                        style={{ marginBottom: 16 }}
                      >
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'name']}
                              label="Tower Name"
                              rules={[{ required: true, message: 'Enter tower name' }]}
                            >
                              <Input placeholder="e.g., Tower A" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'floors']}
                              label="Number of Floors"
                              rules={[{ required: true, message: 'Enter number of floors' }]}
                            >
                              <InputNumber
                                min={1}
                                max={100}
                                placeholder="Enter floors"
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'unitsPerFloor']}
                              label="Units per Floor"
                              rules={[{ required: true, message: 'Enter units per floor' }]}
                            >
                              <InputNumber
                                min={1}
                                max={20}
                                placeholder="Enter units"
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Tower
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
                )
              }
            ]}
          />
        </Form>
      </Modal>

      {/* View Project Modal */}
      <Modal
        title="Project Details"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {viewingProject && (
          <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Card size="small" title="Basic Information">
                  <p><strong>Project Name:</strong> {viewingProject.projectName}</p>
                  <p><strong>Customer:</strong> {viewingProject.customerName}</p>
                  <p><strong>Location:</strong> {viewingProject.location}</p>
                  <p><strong>Status:</strong> 
                    <Tag color={getStatusColor(viewingProject.status)} style={{ marginLeft: 8, textTransform: 'capitalize' }}>
                      {viewingProject.status}
                    </Tag>
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Contact Information">
                  <p><strong>Mobile:</strong> {viewingProject.mobile}</p>
                  <p><strong>Email:</strong> {viewingProject.email}</p>
                  <p><strong>Address:</strong> {viewingProject.address}</p>
                </Card>
              </Col>
            </Row>

            <Card size="small" title="Project Summary">
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <BuildOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 20, fontWeight: 'bold' }}>{viewingProject.totalTowers}</div>
                      <div>Total Towers</div>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <HomeOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 20, fontWeight: 'bold' }}>{viewingProject.totalUnits}</div>
                      <div>Total Units</div>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <EnvironmentOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                        {Math.max(...(viewingProject.towers?.map(t => t.floors) || [0]))}
                      </div>
                      <div>Max Floors</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {viewingProject.towers && viewingProject.towers.length > 0 && (
              <Card size="small" title="Tower Details" style={{ marginTop: 16 }}>
                <Collapse>
                  {viewingProject.towers.map((tower, index) => (
                    <Panel
                      header={
                        <Space>
                          <BuildOutlined />
                          <span>{tower.name}</span>
                          <Tag>{tower.floors} floors</Tag>
                          <Tag color="blue">{tower.totalUnits} units</Tag>
                        </Space>
                      }
                      key={index}
                    >
                      <Row gutter={16}>
                        <Col span={8}>
                          <p><strong>Floors:</strong> {tower.floors}</p>
                        </Col>
                        <Col span={8}>
                          <p><strong>Units per Floor:</strong> {tower.unitsPerFloor}</p>
                        </Col>
                        <Col span={8}>
                          <p><strong>Total Units:</strong> {tower.totalUnits}</p>
                        </Col>
                      </Row>
                    </Panel>
                  ))}
                </Collapse>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Projects;
