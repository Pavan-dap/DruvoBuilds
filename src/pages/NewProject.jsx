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
  Tabs,
  Modal,
  Table,
  Divider,
  Alert,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  ProjectOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/config';

const { Title, Text } = Typography;
const { Option } = Select;

const NewProject = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [projectId, setProjectId] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [floorTemplates, setFloorTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [towerFloorData, setTowerFloorData] = useState({});
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [finalProjectData, setFinalProjectData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const unitTypes = ['3B3T', '3B2T', 'Office', 'Shop', 'Duplex'];

  const steps = [
    { title: 'Basic Details', icon: <ProjectOutlined />, description: 'Project information' },
    { title: 'Floor Design', icon: <SettingOutlined />, description: 'Design floor templates' },
    { title: 'Review & Submit', icon: <EyeOutlined />, description: 'Review and confirm' },
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
        
        // Initialize tower floor data structure
        const towerNames = generateTowerNames(payload.Towers);
        const initialTowerData = {};
        towerNames.forEach(tower => {
          initialTowerData[tower] = {};
          for (let floor = 1; floor <= payload.Floors; floor++) {
            initialTowerData[tower][floor] = [];
          }
        });
        setTowerFloorData(initialTowerData);
        
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

  // Create floor template
  const createFloorTemplate = (templateName, units) => {
    if (!templateName || !units || units.length === 0) {
      message.error('Please provide template name and units');
      return;
    }

    const template = {
      name: templateName,
      units: units.filter(unit => unit && unit.count > 0),
      createdAt: new Date().toISOString()
    };

    setFloorTemplates(prev => ({
      ...prev,
      [templateName]: template
    }));

    message.success(`Floor template "${templateName}" created successfully!`);
  };

  // Apply template to floor
  const applyTemplateToFloor = (tower, floor, templateName) => {
    const template = floorTemplates[templateName];
    if (!template) return;

    setTowerFloorData(prev => ({
      ...prev,
      [tower]: {
        ...prev[tower],
        [floor]: [...template.units]
      }
    }));

    message.success(`Template "${templateName}" applied to ${tower} Floor ${floor}`);
  };

  // Apply template to all floors in tower
  const applyTemplateToTower = (tower, templateName) => {
    const template = floorTemplates[templateName];
    if (!template) return;

    setTowerFloorData(prev => {
      const newData = { ...prev };
      Object.keys(newData[tower]).forEach(floor => {
        newData[tower][floor] = [...template.units];
      });
      return newData;
    });

    message.success(`Template "${templateName}" applied to all floors in ${tower}`);
  };

  // Apply template to all towers
  const applyTemplateToAllTowers = (templateName) => {
    const template = floorTemplates[templateName];
    if (!template) return;

    setTowerFloorData(prev => {
      const newData = { ...prev };
      Object.keys(newData).forEach(tower => {
        Object.keys(newData[tower]).forEach(floor => {
          newData[tower][floor] = [...template.units];
        });
      });
      return newData;
    });

    message.success(`Template "${templateName}" applied to all towers and floors`);
  };

  // Prepare final data for review
  const prepareReviewData = () => {
    const reviewData = [];
    
    Object.entries(towerFloorData).forEach(([tower, floors]) => {
      Object.entries(floors).forEach(([floor, units]) => {
        if (units && units.length > 0) {
          units.forEach(unitEntry => {
            if (unitEntry && unitEntry.count > 0) {
              reviewData.push({
                Project_ID: projectId,
                Towers: tower,
                Floors: `${floor}${floor === '1' ? 'st' : floor === '2' ? 'nd' : floor === '3' ? 'rd' : 'th'} Floor`,
                Units: unitEntry.unit_names
                  ? unitEntry.unit_names.split(",").map(u => u.trim()).filter(u => u !== "")
                  : [],
                Units_Type: unitEntry.type,
                Count: parseInt(unitEntry.count),
              });
            }
          });
        }
      });
    });

    setFinalProjectData(reviewData);
    setReviewModalVisible(true);
  };

  // Final submission
  const handleFinalSubmit = async () => {
    if (!finalProjectData || finalProjectData.length === 0) {
      message.error('No data to submit');
      return;
    }

    setLoading(true);
    try {
      await axios.post(API_ENDPOINTS.PROJECT_DETAILS, finalProjectData);
      message.success('Project details saved successfully!');
      setReviewModalVisible(false);
      next();
    } catch (error) {
      console.error('Error saving project details:', error);
      message.error('Error saving project details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Floor Template Designer Component
  const FloorTemplateDesigner = () => {
    const [templateForm] = Form.useForm();
    const [templateName, setTemplateName] = useState('');

    const handleCreateTemplate = (values) => {
      const units = values.units || [];
      createFloorTemplate(templateName, units);
      templateForm.resetFields();
      setTemplateName('');
    };

    return (
      <Card title="Create Floor Template" size="small" style={{ marginBottom: 16 }}>
        <Form form={templateForm} onFinish={handleCreateTemplate} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Template Name">
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Standard Floor, Premium Floor"
                />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item label="Units Configuration">
                <Form.List name="units">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Row gutter={8} key={key} align="middle">
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'count']}
                              rules={[{ required: true, message: 'Count required' }]}
                            >
                              <InputNumber min={1} max={10} placeholder="Count" style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'type']}
                              initialValue="3B3T"
                            >
                              <Select placeholder="Type">
                                {unitTypes.map((type) => (
                                  <Option key={type} value={type}>{type}</Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'unit_names']}
                              rules={[{ required: true, message: 'Unit names required' }]}
                            >
                              <Input placeholder="101, 102, 103..." />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Button danger onClick={() => remove(name)} size="small" icon={<DeleteOutlined />} />
                          </Col>
                        </Row>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          Add Unit Type
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={!templateName}>
              Create Template
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  // Template List Component
  const TemplateList = () => (
    <Card title="Available Templates" size="small" style={{ marginBottom: 16 }}>
      {Object.keys(floorTemplates).length === 0 ? (
        <Text type="secondary">No templates created yet</Text>
      ) : (
        <Row gutter={[8, 8]}>
          {Object.entries(floorTemplates).map(([name, template]) => (
            <Col span={24} key={name}>
              <Card size="small" style={{ backgroundColor: '#f9f9f9' }}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text strong>{name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {template.units.length} unit type(s)
                    </Text>
                  </Col>
                  <Col>
                    <Space>
                      <Tooltip title="Apply to All Towers">
                        <Button 
                          size="small" 
                          icon={<CopyOutlined />}
                          onClick={() => applyTemplateToAllTowers(name)}
                        >
                          All
                        </Button>
                      </Tooltip>
                      <Button 
                        size="small" 
                        onClick={() => setSelectedTemplate(name)}
                        type={selectedTemplate === name ? 'primary' : 'default'}
                      >
                        Select
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="Basic Project Information" size="small">
            <Form form={form} layout="vertical" onFinish={handleBasicDetails}>
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
                    Next: Design Floors
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        );

      case 1:
        return (
          <div>
            <Alert
              message="Floor Design Templates"
              description="Create reusable floor templates and apply them to towers and floors. This saves time when multiple floors have the same layout."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <FloorTemplateDesigner />
            <TemplateList />

            <Card title="Apply Templates to Towers & Floors" size="small">
              <Tabs defaultActiveKey="0">
                {projectData &&
                  generateTowerNames(projectData.Towers).map((towerName, towerIndex) => (
                    <Tabs.TabPane 
                      tab={
                        <span>
                          {towerName}
                          {selectedTemplate && (
                            <Tooltip title={`Apply "${selectedTemplate}" to all floors`}>
                              <Button 
                                size="small" 
                                type="link" 
                                icon={<CopyOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  applyTemplateToTower(towerName, selectedTemplate);
                                }}
                              />
                            </Tooltip>
                          )}
                        </span>
                      } 
                      key={towerIndex}
                    >
                      <Row gutter={[12, 12]}>
                        {Array.from({ length: projectData.Floors }, (_, floorIndex) => {
                          const floorNumber = floorIndex + 1;
                          const floorName = `${floorNumber}${floorNumber === 1 ? 'st' : floorNumber === 2 ? 'nd' : floorNumber === 3 ? 'rd' : 'th'} Floor`;
                          const currentFloorData = towerFloorData[towerName]?.[floorNumber] || [];

                          return (
                            <Col xs={24} md={12} lg={8} key={floorNumber}>
                              <Card 
                                size="small" 
                                title={
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{floorName}</span>
                                    {selectedTemplate && (
                                      <Tooltip title={`Apply "${selectedTemplate}"`}>
                                        <Button 
                                          size="small" 
                                          type="primary" 
                                          ghost
                                          icon={<CopyOutlined />}
                                          onClick={() => applyTemplateToFloor(towerName, floorNumber, selectedTemplate)}
                                        />
                                      </Tooltip>
                                    )}
                                  </div>
                                }
                                style={{ minHeight: '200px' }}
                              >
                                {currentFloorData.length > 0 ? (
                                  <div>
                                    {currentFloorData.map((unit, idx) => (
                                      <div key={idx} style={{ marginBottom: '8px', padding: '4px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                                        <Text strong>{unit.type}</Text> - {unit.count} units
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                          {unit.unit_names}
                                        </Text>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                                    <Text type="secondary">No template applied</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                      Select a template and click apply
                                    </Text>
                                  </div>
                                )}
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    </Tabs.TabPane>
                  ))}
              </Tabs>

              <Divider />
              
              <Space>
                <Button onClick={prev}>Previous</Button>
                <Button 
                  type="primary" 
                  onClick={prepareReviewData}
                  disabled={Object.values(towerFloorData).every(tower => 
                    Object.values(tower).every(floor => floor.length === 0)
                  )}
                >
                  Review & Submit
                </Button>
              </Space>
            </Card>
          </div>
        );

      case 2:
        return (
          <Card title="Review Project Data" size="small">
            <Alert
              message="Review your project configuration before final submission"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Button 
                type="primary" 
                size="large"
                icon={<EyeOutlined />}
                onClick={prepareReviewData}
              >
                Review Project Data
              </Button>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card size="small" style={{ textAlign: 'center', padding: '40px' }}>
            <CheckCircleOutlined style={{ fontSize: '72px', color: '#52c41a', marginBottom: '24px' }} />
            <Title level={3} style={{ color: '#52c41a', margin: '16px 0' }}>
              Project Created Successfully!
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Project ID: <strong>{projectId}</strong>
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Your project has been created with {finalProjectData?.length || 0} floor configuration(s).
            </Text>
            <div style={{ marginTop: '24px' }}>
              <Space size="large">
                <Button onClick={() => navigate('/projects')}>
                  View All Projects
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    setCurrentStep(0);
                    form.resetFields();
                    setFloorTemplates({});
                    setTowerFloorData({});
                    setProjectId(null);
                    setProjectData(null);
                    setFinalProjectData(null);
                  }}
                >
                  Create Another Project
                </Button>
              </Space>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  // Review Modal
  const ReviewModal = () => {
    const columns = [
      { title: 'Tower', dataIndex: 'Towers', key: 'tower' },
      { title: 'Floor', dataIndex: 'Floors', key: 'floor' },
      { title: 'Unit Type', dataIndex: 'Units_Type', key: 'type' },
      { title: 'Count', dataIndex: 'Count', key: 'count' },
      { 
        title: 'Units', 
        dataIndex: 'Units', 
        key: 'units',
        render: (units) => Array.isArray(units) ? units.join(', ') : units
      },
    ];

    return (
      <Modal
        title="Review Project Configuration"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setReviewModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="back" onClick={prev}>
            Go Back & Edit
          </Button>,
          <Popconfirm
            key="submit"
            title="Are you sure you want to submit this project?"
            description="This action cannot be undone."
            onConfirm={handleFinalSubmit}
            okText="Yes, Submit"
            cancelText="No"
          >
            <Button type="primary" loading={loading}>
              Submit Project
            </Button>
          </Popconfirm>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Title level={4}>Project: {projectData?.Project_Name}</Title>
          <Text type="secondary">
            Total Configurations: {finalProjectData?.length || 0}
          </Text>
        </div>
        
        <Table
          columns={columns}
          dataSource={finalProjectData || []}
          rowKey={(record, index) => `${record.Towers}-${record.Floors}-${index}`}
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 800 }}
        />
      </Modal>
    );
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <Title level={3} style={{ margin: 0 }}>Create New Project</Title>
        <Text type="secondary">
          Enhanced project creation with floor templates and data review.
        </Text>
      </div>

      <Card size="small" style={{ marginBottom: '16px' }}>
        <Steps current={currentStep} items={steps} />
      </Card>

      {renderStepContent()}
      <ReviewModal />
    </div>
  );
};

export default NewProject;