import React, { useState } from 'react';
import {
  Card,
  Steps,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Typography,
  Tabs,
  message,
  Row,
  Col,
  Divider
} from 'antd';
import {
  ProjectOutlined,
  SettingOutlined,
  BuildOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_PROJECTS, API_PROJECT_DETAILS } from '../utils/constants/Config';

const { Title, Text } = Typography;

const NewProject = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [projectId, setProjectId] = useState(null);
  const [towerCount, setTowerCount] = useState(0);
  const [towerData, setTowerData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const steps = [
    {
      title: 'Basic Details',
      icon: <ProjectOutlined />,
      description: 'Project information'
    },
    {
      title: 'Tower Setup',
      icon: <SettingOutlined />,
      description: 'Configure towers'
    },
    {
      title: 'Floor Details',
      icon: <BuildOutlined />,
      description: 'Add floors and units'
    },
    {
      title: 'Complete',
      icon: <CheckCircleOutlined />,
      description: 'Project created'
    }
  ];

  const next = () => setCurrentStep(prev => prev + 1);
  const prev = () => setCurrentStep(prev => prev - 1);

  // Step 1: Create basic project
  const handleBasicDetails = async (values) => {
    setLoading(true);
    try {
      const payload = {
        Project_Name: values.name,
        Customer_Name: values.customer,
        Location: values.location,
        Contact_No: values.contact,
        Mail_Id: values.mail,
      };

      const response = await axios.post(API_PROJECTS, payload);
      const newProjectId = response.data?.Project_ID;

      if (newProjectId) {
        setProjectId(newProjectId);
        message.success('Project created successfully!');
        next();
      } else {
        message.error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      message.error('Error creating project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Setup towers
  const handleTowerSetup = (values) => {
    const count = values.towerCount || 0;
    setTowerCount(count);
    
    const towers = {};
    for (let i = 0; i < count; i++) {
      const towerName = `Tower ${String.fromCharCode(65 + i)}`;
      towers[towerName] = {
        floors: values[`tower_${i}_floors`] || 0,
        units: {}
      };
    }
    setTowerData(towers);
    next();
  };

  // Step 3: Save floor and unit details
  const handleFloorDetails = async (values) => {
    setLoading(true);
    try {
      const towerPayload = [];

      Object.entries(towerData).forEach(([towerName, towerInfo]) => {
        for (let floor = 1; floor <= towerInfo.floors; floor++) {
          const units = values[`${towerName}_floor_${floor}_units`] || 0;
          const unitType = values[`${towerName}_floor_${floor}_type`] || 'Standard';
          
          if (units > 0) {
            towerPayload.push({
              Project_ID: projectId,
              Towers: towerName,
              Floors: `${floor} Floor`,
              Units: units,
              Units_Type: unitType,
            });
          }
        }
      });

      if (towerPayload.length === 0) {
        message.warning('Please add at least one unit');
        return;
      }

      await axios.post(API_PROJECT_DETAILS, towerPayload);
      message.success('Project details saved successfully!');
      next();
    } catch (error) {
      console.error('Error saving project details:', error);
      message.error('Error saving project details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="Basic Project Information" className="step-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleBasicDetails}
              size="large"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Project Name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter project name' }]}
                  >
                    <Input placeholder="Enter project name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Customer Name"
                    name="customer"
                    rules={[{ required: true, message: 'Please enter customer name' }]}
                  >
                    <Input placeholder="Enter customer name" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Location"
                    name="location"
                    rules={[{ required: true, message: 'Please enter location' }]}
                  >
                    <Input placeholder="Enter project location" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Contact Number"
                    name="contact"
                    rules={[{ required: true, message: 'Please enter contact number' }]}
                  >
                    <Input placeholder="Enter contact number" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email Address"
                name="mail"
                rules={[
                  { required: true, message: 'Please enter email address' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button onClick={() => navigate('/projects')}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Next Step
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        );

      case 1:
        return (
          <Card title="Tower Configuration" className="step-card">
            <Form
              layout="vertical"
              onFinish={handleTowerSetup}
              size="large"
              initialValues={{ towerCount }}
            >
              <Form.Item
                label="Number of Towers"
                name="towerCount"
                rules={[{ required: true, message: 'Please enter number of towers' }]}
              >
                <InputNumber
                  min={1}
                  max={26}
                  placeholder="Enter number of towers"
                  style={{ width: '100%' }}
                  onChange={(value) => setTowerCount(value || 0)}
                />
              </Form.Item>

              <Divider>Tower Floor Configuration</Divider>

              <Row gutter={[16, 16]}>
                {Array.from({ length: towerCount }, (_, i) => (
                  <Col xs={24} md={12} lg={8} key={i}>
                    <Form.Item
                      label={`Tower ${String.fromCharCode(65 + i)} - Number of Floors`}
                      name={`tower_${i}_floors`}
                      rules={[{ required: true, message: 'Enter number of floors' }]}
                    >
                      <InputNumber
                        min={1}
                        placeholder="Floors"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                ))}
              </Row>

              <Form.Item>
                <Space>
                  <Button onClick={prev}>
                    Previous
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Next Step
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        );

      case 2:
        return (
          <Card title="Floor & Unit Details" className="step-card">
            <Form
              layout="vertical"
              onFinish={handleFloorDetails}
              size="large"
            >
              <Tabs type="card">
                {Object.entries(towerData).map(([towerName, towerInfo]) => (
                  <Tabs.TabPane tab={towerName} key={towerName}>
                    <div style={{ padding: '16px 0' }}>
                      <Title level={4}>{towerName} Configuration</Title>
                      <Row gutter={[16, 16]}>
                        {Array.from({ length: towerInfo.floors }, (_, floorIndex) => {
                          const floorNumber = floorIndex + 1;
                          return (
                            <Col xs={24} md={12} key={floorNumber}>
                              <Card size="small" title={`Floor ${floorNumber}`}>
                                <Form.Item
                                  label="Number of Units"
                                  name={`${towerName}_floor_${floorNumber}_units`}
                                  rules={[{ required: true, message: 'Enter number of units' }]}
                                >
                                  <InputNumber
                                    min={0}
                                    placeholder="Units"
                                    style={{ width: '100%' }}
                                  />
                                </Form.Item>
                                <Form.Item
                                  label="Unit Type"
                                  name={`${towerName}_floor_${floorNumber}_type`}
                                  initialValue="Standard"
                                >
                                  <Input placeholder="e.g. 2BHK, 3BHK, etc." />
                                </Form.Item>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    </div>
                  </Tabs.TabPane>
                ))}
              </Tabs>

              <Form.Item style={{ marginTop: 24 }}>
                <Space>
                  <Button onClick={prev}>
                    Previous
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save Project
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        );

      case 3:
        return (
          <Card className="step-card success-card">
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CheckCircleOutlined 
                style={{ fontSize: '72px', color: '#52c41a', marginBottom: '24px' }} 
              />
              <Title level={2} style={{ color: '#52c41a' }}>
                Project Created Successfully!
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Your project has been created and all details have been saved.
              </Text>
              <div style={{ marginTop: '32px' }}>
                <Space size="large">
                  <Button 
                    size="large" 
                    onClick={() => navigate('/projects')}
                  >
                    View All Projects
                  </Button>
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={() => {
                      setCurrentStep(0);
                      form.resetFields();
                      setTowerData({});
                      setProjectId(null);
                      setTowerCount(0);
                    }}
                  >
                    Create Another Project
                  </Button>
                </Space>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="new-project-container">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Create New Project</Title>
        <Text type="secondary">
          Follow the steps below to create a new project with all necessary details.
        </Text>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Steps
          current={currentStep}
          items={steps}
          size="small"
          style={{ padding: '20px 0' }}
        />
      </Card>

      {renderStepContent()}

      <style jsx>{`
        .new-project-container {
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .step-card {
          min-height: 400px;
        }
        
        .success-card {
          border: 2px solid #52c41a;
          background: linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%);
        }
        
        @media (max-width: 768px) {
          .step-card {
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default NewProject;
