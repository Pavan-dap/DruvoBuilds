import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Tag,
  Typography,
  Spin,
  message,
  Modal,
  Collapse,
  Table,
  Select,
  InputNumber,
  Popconfirm,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title } = Typography;
const { Panel } = Collapse;

// Internal API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

const API_ENDPOINTS = {
  PROJECTS: `${API_BASE_URL}Project_View/`,
  PROJECT_DETAILS: `${API_BASE_URL}Project_Details_View/`,
  PROJECT_REQUIREMENTS: `${API_BASE_URL}Required_Doors_View/`,
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [projectDetails, setProjectDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch project list
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.PROJECTS);
      setProjects(res.data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      message.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch project details by Project_ID
  const fetchProjectDetails = async (projectId) => {
    setDetailsLoading(true);
    try {
      const res = await axios.get(`${API_ENDPOINTS.PROJECTS}?Project_ID=${projectId}`);

      // Compact structure (Towers → Floors → Units)
      const compact = {};
      res.data.Project_Details.forEach((item) => {
        if (!compact[item.Towers]) {
          compact[item.Towers] = {};
        }
        if (!compact[item.Towers][item.Floors]) {
          compact[item.Towers][item.Floors] = [];
        }
        compact[item.Towers][item.Floors].push({
          Units_Type: item.Units_Type,
          Units: item.Units,
          Count: item.Count,
        });
      });

      setProjectDetails({
        structure: compact,
        requirements: res.data.Doors,
      });
    } catch (err) {
      console.error("Error fetching project details:", err);
      message.error("Failed to load project details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const openModal = (projectId, projectName) => {
    setSelectedProjectId(projectId);
    setSelectedProjectName(projectName);
    fetchProjectDetails(projectId);
    setModalVisible(true);
  };

  const doorTypes = [
    "Main Door(1050*2100mm)",
    "Bedroom Door(900*2100mm)",
    "Home Office(900*2100mm)",
  ];
  const thicknessOptions = ["250mm", "200mm", "160mm", "100mm"];

  // Inline Table Component for Door Requirements
  const DoorRequirementTable = ({ towerName, projectId }) => {
    const [saving, setSaving] = useState(false);

    // Store data like: data[tower][doorType][thickness] = count
    const [data, setData] = useState({
      [towerName]: {},
    });

    const handleChange = (tower, doorType, thickness, value) => {
      const newData = { ...data };
      if (!newData[tower]) newData[tower] = {};
      if (!newData[tower][doorType]) newData[tower][doorType] = {};
      newData[tower][doorType][thickness] = value;
      setData(newData);
    };

    const handleSave = async () => {
      setSaving(true);
      try {
        const payload = doorTypes.map((doorType) => ({
          Project_ID: projectId,
          Towers: towerName,
          Door_Type: doorType,
          Door_Details: thicknessOptions.map((th) => ({
            Door_Type_MM: th,
            Count: data[towerName]?.[doorType]?.[th] || 0,
          })),
        }));

        await axios.post(API_ENDPOINTS.PROJECT_REQUIREMENTS, payload);
        message.success("Door requirements saved!");
      } catch (err) {
        console.error("Save failed", err);
        message.error("Failed to save requirements");
      } finally {
        setSaving(false);
      }
    };

    // Build columns dynamically
    const columns = [
      {
        title: "Tower",
        dataIndex: "tower",
        key: "tower",
        render: (text) => <b>{text}</b>,
      },
      ...doorTypes.map((doorType) => ({
        title: doorType,
        dataIndex: doorType,
        key: doorType,
        render: (_, record) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {thicknessOptions.map((th) => (
              <div key={th} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 60 }}>{th}:</span>
                <InputNumber
                  min={0}
                  style={{ width: 100 }}
                  value={data[record.tower]?.[doorType]?.[th] || 0}
                  onChange={(val) => handleChange(record.tower, doorType, th, val)}
                />
              </div>
            ))}
          </div>
        ),
      })),
    ];

    const rows = [{ key: towerName, tower: towerName }];

    return (
      <div>
        <Table
          dataSource={rows}
          columns={columns}
          pagination={false}
          size="small"
          bordered
        />
        <div style={{ textAlign: "right", marginTop: 16 }}>
          <Button type="primary" onClick={handleSave} loading={saving}>
            Save Requirements
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>Projects</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/new-project")}
          size="small"
        >
          Add Project
        </Button>
      </div>

      {/* Grid of projects */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[12, 12]}>
          {projects.map((project) => (
            <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
              <Card
                title={project.Project_Name}
                size="small"
                hoverable
                extra={<Tag color="blue">{project.Project_ID}</Tag>}
                onClick={() => openModal(project.Project_ID, project.Project_Name)}
                bodyStyle={{ padding: '12px' }}
              >
                <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                <p style={{ margin: '4px 0' }}>
                  <strong>Customer:</strong> {project.Customer_Name}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Location:</strong> {project.Location}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Contact:</strong> {project.Contact_No}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Email:</strong> {project.Mail_Id}
                </p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal for project details */}
      <Modal
        title={`${selectedProjectName} (${selectedProjectId})`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1200}
        centered
      >
        {detailsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div>
            {/* Project Details */}
            <Card 
              title="🏢 Project Structure" 
              size="small" 
              style={{ marginBottom: 16 }}
              bodyStyle={{ padding: '12px' }}
            >
              <Row gutter={[12, 12]}>
                {projectDetails.structure &&
                  Object.entries(projectDetails.structure).map(
                    ([tower, floors], towerIndex) => (
                      <Col xs={24} md={12} lg={8} key={tower}>
                        <Card 
                          title={tower} 
                          size="small"
                          style={{ 
                            border: '1px solid #d9d9d9',
                            borderRadius: '6px'
                          }}
                          headStyle={{ 
                            backgroundColor: '#f5f5f5',
                            minHeight: 'auto',
                            padding: '8px 12px'
                          }}
                          bodyStyle={{ padding: '8px' }}
                        >
                          {Object.entries(floors).map(([floor, units], floorIndex) => (
                            <div key={floorIndex} style={{ marginBottom: '8px' }}>
                              <div style={{ 
                                fontWeight: 'bold', 
                                fontSize: '12px',
                                color: '#1890ff',
                                marginBottom: '4px'
                              }}>
                                📍 {floor}
                              </div>
                              <div style={{ paddingLeft: '12px' }}>
                                {units.map((u, unitIndex) => (
                                  <div key={unitIndex} style={{ 
                                    fontSize: '11px', 
                                    marginBottom: '2px',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                  }}>
                                    <span>
                                      <Tag size="small" color="green">{u.Units_Type}</Tag>
                                      {Array.isArray(u.Units) ? u.Units.join(", ") : u.Units}
                                    </span>
                                    <span style={{ color: '#666' }}>({u.Count})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </Card>
                      </Col>
                    )
                  )}
              </Row>
            </Card>

            <Collapse size="small" style={{ marginTop: 16 }}>
            {/* Required Doors */}
            {/* Required Doors */}
            <Panel header="Required Doors" key="required-doors">
              {projectDetails.requirements?.Towers?.length > 0 ? (
                <Table
                  bordered
                  pagination={false}
                  rowKey={(record, index) => index}
                  size="small"
                  columns={[
                    {
                      title: "Towers",
                      dataIndex: "Towers",
                      key: "tower",
                      fixed: "left",
                    },
                    ...doorTypes.map((doorType) => ({
                      title: doorType,
                      children: thicknessOptions.map((thickness) => ({
                        title: thickness,
                        dataIndex: `${doorType}-${thickness}`,
                        key: `${doorType}-${thickness}`,
                        render: (val) =>
                          val ? (
                            <div>
                              <div><strong>Req:</strong> {val.Required}</div>
                              <div><strong>Sup:</strong> {val.Supplied}</div>
                            </div>
                          ) : (
                            "-"
                          ),
                      })),
                    })),
                  ]}
                  dataSource={projectDetails.requirements.Towers.map((tower) => {
                    const row = { Towers: tower.Towers };
                    tower.Door_Types.forEach((doorType) => {
                      doorType.Door_Details.forEach((dd) => {
                        row[`${doorType.Door_Type}-${dd.Door_Type_MM}`] = dd.Doors;
                      });
                    });
                    return row;
                  })}
                  scroll={{ x: "max-content" }}
                />
              ) : (
                <>
                  {projectDetails.structure &&
                    Object.keys(projectDetails.structure).map((towerName) => (
                      <div key={towerName} style={{ marginBottom: 24 }}>
                        <Title level={5} style={{ margin: '8px 0' }}>{towerName}</Title>
                        <DoorRequirementTable
                          towerName={towerName}
                          projectId={selectedProjectId}
                        />
                      </div>
                    ))}
                </>
              )}
            </Panel>
            </Collapse>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Projects;