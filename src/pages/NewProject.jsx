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
  message,
  Row,
  Col,
  Select,
  Tabs
} from 'antd';
import {
  ProjectOutlined,
  SettingOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Internal API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

const API_ENDPOINTS = {
  PROJECTS: `${API_BASE_URL}Project_View/`,
  PROJECT_DETAILS: `${API_BASE_URL}Project_Details_View/`,
};

const { Title, Text } = Typography;
const { Option } = Select;

const NewProject = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [projectId, setProjectId] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [towerDetails, setTowerDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const unitTypes = ['3B3T', '3B2T', 'Office'];

  const steps = [
    { title: 'Basic Details', icon: <ProjectOutlined />, description: 'Project information' },
    { title: 'Tower & Floor Details', icon: <SettingOutlined />, description: 'Configure towers, floors & units' },
    { title: 'Complete', icon: <CheckCircleOutlined />, description: 'Project created' }
  ];

  const next = () => setCurrentStep(prev => prev + 1);
  const prev = () => setCurrentStep(prev => prev - 1);

  // Step 1: Create basic project
  const handleBasicDetails = async (values) => {
    setLoading(true);
    try {
      const payload = {
        Project_Name: values.projectName,
        Customer_Name: values.customerName,
        Location: values.location,
        Contact_No: parseInt(values.contactNo),
        Mail_Id: values.mailId,
        Towers: parseInt(values.towers),
        Floors: parseInt(values.floors)
      };

      const response = await axios.post(API_ENDPOINTS.PROJECTS, payload);

      if (response.data && response.data.Project_ID) {
        setProjectId(response.data.Project_ID);
        setProjectData(response.data);
        message.success('Project created successfully!');
        next();
      } else {
        message.error('Failed to create project - No Project ID returned');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      message.error('Error creating project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate tower names automatically
  const generateTowerNames = (count) => {
    const names = [];
    for (let i = 0; i < count; i++) {
      names.push(`Tower-${String.fromCharCode(65 + i)}`);
    }
    return names;
  };

  // Step 2: Save tower and floor details
  const handleTowerUnitsSubmit = async (values) => {
    setLoading(true);
    try {
      const towerPayload = [];

      const towerNames = generateTowerNames(projectData.Towers);

      towerNames.forEach(towerName => {
        for (let floor = 1; floor <= projectData.Floors; floor++) {
          const floorUnits = values[`${towerName}_floor_${floor}_units`] || [];

          floorUnits.forEach((unitEntry) => {
            if (unitEntry && unitEntry.count > 0) {
              towerPayload.push({
                Project_ID: projectId,
                Towers: towerName,
                Floors: `${floor}${floor === 1 ? 'st' : floor === 2 ? 'nd' : floor === 3 ? 'rd' : 'th'} Floor`,
                Units: unitEntry.unit_names
                  ? unitEntry.unit_names
                    .split(",")
                    .map(u => u.trim()) // remove spaces
                    .filter(u => u !== "") // skip empty values
                  : [],
                Units_Type: unitEntry.type,
                Count: parseInt(unitEntry.count),
              });
            }
          });
        }
      });

      if (towerPayload.length === 0) {
        message.warning('Please enter units for at least one floor');
        return;
      }

      await axios.post(API_ENDPOINTS.PROJECT_DETAILS, towerPayload);
      setTowerDetails(towerPayload);
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
            <Form form={form} layout="vertical" onFinish={handleBasicDetails} size="large">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Project Name"
                    name="projectName"
                    rules={[{ required: true, message: 'Please enter project name' }]}
                  >
                    <Input placeholder="e.g. Mithra Apartments" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Customer Name"
                    name="customerName"
                    rules={[{ required: true, message: 'Please enter customer name' }]}
                  >
                    <Input placeholder="e.g. Mani" />
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
                    <Input placeholder="e.g. Hyderabad" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Contact Number"
                    name="contactNo"
                    rules={[{ required: true, message: 'Please enter contact number' }]}
                  >
                    <Input placeholder="e.g. 9848032949" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Email Address"
                    name="mailId"
                    rules={[
                      { required: true, message: 'Please enter email address' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input placeholder="e.g. druvo.mani@gmail.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    label="Number of Towers"
                    name="towers"
                    rules={[{ required: true, message: 'Please enter number of towers' }]}
                  >
                    <InputNumber min={1} max={26} placeholder="e.g. 2" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    label="Floors (each tower)"
                    name="floors"
                    rules={[{ required: true, message: 'Please enter floors' }]}
                  >
                    <InputNumber min={1} max={100} placeholder="e.g. 20" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button onClick={() => navigate('/projects')}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Next: Configure Towers
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        );

      case 1:
        return (
          <Card title="Tower & Floor Units Configuration" className="step-card">
            <div style={{ marginBottom: '24px' }}>
              <Text type="secondary">
                Configure units for each tower and floor. Each tower has {projectData?.Floors} floors.
              </Text>
            </div>

            <Form layout="vertical" onFinish={handleTowerUnitsSubmit} size="large">
              <Tabs defaultActiveKey="0">
                {projectData &&
                  generateTowerNames(projectData.Towers).map((towerName, towerIndex) => (
                    <Tabs.TabPane tab={towerName} key={towerIndex}>
                      {Array.from({ length: projectData.Floors }, (_, floorIndex) => {
                        const floorNumber = floorIndex + 1;
                        const floorName = `${floorNumber}${floorNumber === 1 ? 'st' : floorNumber === 2 ? 'nd' : floorNumber === 3 ? 'rd' : 'th'
                          } Floor`;

                        return (
                          <Card size="small" title={floorName} style={{ marginBottom: '16px' }} key={floorNumber}>
                            <Form.List name={`${towerName}_floor_${floorNumber}_units`}>
                              {(fields, { add, remove }) => (
                                <>
                                  {fields.map(({ key, name, ...restField }) => (
                                    <Row gutter={8} key={key} align="middle">
                                      <Col span={10}>
                                        <Form.Item
                                          {...restField}
                                          name={[name, 'count']}
                                          label="Units Count"
                                          rules={[{ required: true, message: 'Enter units count' }]}
                                        >
                                          <InputNumber min={1} max={10} style={{ width: '100%' }} />
                                        </Form.Item>
                                      </Col>
                                      <Col span={10}>
                                        <Form.Item
                                          {...restField}
                                          name={[name, 'type']}
                                          label="Unit Type"
                                          initialValue="3B3T"
                                        >
                                          <Select placeholder="Select type">
                                            {unitTypes.map((type) => (
                                              <Option key={type} value={type}>
                                                {type}
                                              </Option>
                                            ))}
                                          </Select>
                                        </Form.Item>
                                      </Col>
                                      <Col span={4}>
                                        <Button danger onClick={() => remove(name)}>
                                          Remove
                                        </Button>
                                      </Col>
                                      <Col span={14}>
                                        <Form.Item
                                          {...restField}
                                          name={[name, 'unit_names']}
                                          label="Unit Names"
                                          rules={[{ required: true, message: 'Enter units names' }]}
                                        >
                                          <Input style={{ width: '100%' }} placeholder='101, 102, 103..' />
                                        </Form.Item>
                                      </Col>
                                    </Row>
                                  ))}

                                  <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block>
                                      + Add Unit Type
                                    </Button>
                                  </Form.Item>
                                </>
                              )}
                            </Form.List>
                          </Card>
                        );
                      })}
                    </Tabs.TabPane>
                  ))}
              </Tabs>

              <Form.Item style={{ marginTop: '24px' }}>
                <Space>
                  <Button onClick={prev}>Previous</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save Project
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        );

      case 2:
        return (
          <Card className="step-card success-card">
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CheckCircleOutlined style={{ fontSize: '72px', color: '#52c41a', marginBottom: '24px' }} />
              <Title level={2} style={{ color: '#52c41a' }}>
                Project Created Successfully!
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Project ID: <strong>{projectId}</strong>
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Your project has been created with {towerDetails.length} tower detail(s).
              </Text>
              <div style={{ marginTop: '32px' }}>
                <Space size="large">
                  <Button size="large" onClick={() => navigate('/projects')}>
                    View All Projects
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => {
                      setCurrentStep(0);
                      form.resetFields();
                      setTowerDetails([]);
                      setProjectId(null);
                      setProjectData(null);
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
          Follow the two-step process to create a new project with detailed tower and floor configuration.
        </Text>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Steps current={currentStep} items={steps} size="small" style={{ padding: '20px 0' }} />
      </Card>

      {renderStepContent()}

      <style jsx>{`
        .new-project-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .step-card {
          min-height: 500px;
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
