import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Modal,
  Steps,
  Form,
  Input,
  InputNumber,
  Tabs,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { API_PROJECTS, API_PROJECT_DETAILS } from "./../utils/constants/Config";

const { Title } = Typography;

const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [projectId, setProjectId] = useState(null);
  const [towersMeta, setTowersMeta] = useState([]);

  const mockProjects = [
    {
      key: "1",
      name: "E-Commerce Platform",
      customer: "ABC Corp",
      location: "New York",
      contact: "1234567890",
      mail: "abc@example.com",
      status: "In Progress",
    },
  ];

  const columns = [
    { title: "Project Name", dataIndex: "name", key: "name" },
    { title: "Customer", dataIndex: "customer", key: "customer" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Contact", dataIndex: "contact", key: "contact" },
    { title: "Email", dataIndex: "mail", key: "mail" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "Completed"
            ? "green"
            : status === "In Progress"
              ? "blue"
              : "orange";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space>
          <Button icon={<EditOutlined />} size="small" />
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Space>
      ),
    },
  ];

  const next = () => setCurrentStep((prev) => prev + 1);
  const prev = () => setCurrentStep((prev) => prev - 1);

  // Step 1: Basic project API
  const handleFinishStep1 = async (values) => {
    try {
      const payload = {
        Project_Name: values.name,
        Customer_Name: values.customer,
        Location: values.location,
        Contact_No: values.contact,
        Mail_Id: values.mail,
      };

      const res = await axios.post(API_PROJECTS, payload);
      const newProjectId = res.data?.Project_ID;

      if (newProjectId) {
        setProjectId(newProjectId);
        message.success("Project created successfully!");
        next();
      } else {
        message.error("Failed to create project.");
      }
    } catch (err) {
      console.error("Step 1 error:", err);
      message.error("Error creating project");
    }
  };

  // Step 2.5: Save towers/floors structure
  const handleFinishStep15 = (values) => {
    const count = values.towerCount || 0;
    const towers = Array.from({ length: count }, (_, i) => ({
      name: `Tower ${String.fromCharCode(65 + i)}`,
      floors: values[`tower_${i}_floors`],
    }));
    setTowersMeta(towers);
    next();
  };

  // Step 3: Save tower+floor+units
  const handleFinishStep2 = async (values) => {
    try {
      const towerPayload = [];

      (values.towers || []).forEach((tower) => {
        (tower.floors || []).forEach((floor) => {
          towerPayload.push({
            Project_ID: projectId,
            Towers: tower.towerName,
            Floors: `${floor.floorNumber} Floor`,
            Units: floor.units,
            Units_Type: floor.unitType || "N/A",
          });
        });
      });

      if (towerPayload.length === 0) {
        message.warning("Please add at least one floor/unit");
        return;
      }

      await axios.post(API_PROJECT_DETAILS, towerPayload);
      message.success("Tower & floor details saved!");
      next();
    } catch (err) {
      console.error("Step 2 error:", err);
      message.error("Error saving tower details");
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={2}>Projects</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Project
        </Button>
      </div>

      {/* Project list */}
      <Card>
        <Table columns={columns} dataSource={mockProjects} scroll={{ x: 800 }} />
      </Card>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setCurrentStep(0);
          form.resetFields();
          setTowersMeta([]);
        }}
        footer={null}
        width={800}
        centered
      >
        <Steps
          current={currentStep}
          items={[
            { title: "Basic Details" },
            { title: "Towers Setup" },
            { title: "Towers & Floors" },
            { title: "Done" },
          ]}
        />

        {/* Step 0: Basic details */}
        {currentStep === 0 && (
          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: 24 }}
            onFinish={handleFinishStep1}
          >
            <Form.Item
              label="Project Name"
              name="name"
              rules={[{ required: true, message: "Please enter project name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Customer Name"
              name="customer"
              rules={[{ required: true, message: "Please enter customer name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Location"
              name="location"
              rules={[{ required: true, message: "Please enter location" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Contact Number"
              name="contact"
              rules={[{ required: true, message: "Please enter contact number" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Email"
              name="mail"
              rules={[
                { required: true, type: "email", message: "Enter valid email" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Next
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* Step 1.5: Towers Setup */}
        {currentStep === 1 && (
          <Form layout="vertical" style={{ marginTop: 24 }} onFinish={handleFinishStep15}>
            <Form.Item
              name="towerCount"
              label="Number of Towers"
              rules={[{ required: true, message: "Enter number of towers" }]}
            >
              <InputNumber min={1} />
            </Form.Item>

            {Array.from({ length: Form.useWatch("towerCount", form) || 0 }).map(
              (_, i) => (
                <Form.Item
                  key={i}
                  name={`tower_${i}_floors`}
                  label={`Tower ${String.fromCharCode(65 + i)} Floors`}
                  rules={[{ required: true, message: "Enter floors count" }]}
                >
                  <InputNumber min={1} />
                </Form.Item>
              )
            )}

            <Form.Item>
              <Space>
                <Button onClick={prev}>Back</Button>
                <Button type="primary" htmlType="submit">
                  Next
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}

        {/* Step 2: Towers & Floors */}
        {currentStep === 2 && (
          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: 24 }}
            onFinish={handleFinishStep2}
          >
            <Tabs>
              {Object.keys(towerData).map((tower) => (
                <Tabs.TabPane tab={tower} key={tower}>
                  {Array.from({ length: towerData[tower]?.floors || 0 }, (_, i) => {
                    const floorNo = i + 1;
                    return (
                      <Form.Item
                        key={floorNo}
                        label={`Floor ${floorNo} - Units`}
                        name={['towers', tower, 'units', floorNo]}
                      >
                        <InputNumber
                          min={1}
                          onChange={(val) => {
                            setTowerData((prev) => ({
                              ...prev,
                              [tower]: {
                                ...prev[tower],
                                units: { ...prev[tower].units, [floorNo]: val }
                              }
                            }));
                          }}
                        />
                      </Form.Item>
                    );
                  })}
                </Tabs.TabPane>
              ))}
            </Tabs>

            <Form.Item style={{ marginTop: 16 }}>
              <Space>
                <Button onClick={prev}>Back</Button>
                <Button type="primary" htmlType="submit">
                  Next
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}

        {/* Step 3: Done */}
        {currentStep === 3 && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <h3>All steps completed ✅</h3>
            <Space>
              <Button onClick={prev}>Back</Button>
              <Button
                type="primary"
                onClick={() => {
                  message.success("Project fully saved!");
                  setIsModalOpen(false);
                  setCurrentStep(0);
                  form.resetFields();
                  setTowersMeta([]);
                }}
              >
                Done
              </Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Projects;
