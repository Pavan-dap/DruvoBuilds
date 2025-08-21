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
  Tooltip,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from '../utils/config';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [projectDetails, setProjectDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [savedTowers, setSavedTowers] = useState([]); // inside Projects component

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
        requirements: res.data.Required_Doors,
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

  useEffect(() => {
    if (projectDetails?.requirements?.Towers) {
      const alreadySaved = projectDetails.requirements.Towers.map(t => t.Towers);
      setSavedTowers(alreadySaved);
    }
  }, [projectDetails]);

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
                styles={{ body: { padding: '12px' } }}
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
              styles={{ body: { padding: '12px' } }}
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
                          styles={{
                            body: { padding: '8px' },
                            header: {
                              backgroundColor: '#f5f5f5',
                              minHeight: 'auto',
                              padding: '8px 12px'
                            }
                          }}
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

            <Collapse
              size="small"
              style={{ marginTop: 16 }}
              items={[
                {
                  key: "required-doors",
                  label: "Doors",
                  children: (
                    <Table
                      bordered
                      pagination={false}
                      rowKey={(record) => record.Towers}
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
                            render: (val, record) => {
                              const value = record.inputs?.[doorType]?.[thickness] || 0;
                              const valObj = record.inputs?.[doorType]?.[thickness] || { required: 0, supplied: 0, installed: 0 };
                              const isSaved = savedTowers.includes(record.Towers);

                              if (isSaved) {
                                return (
                                  <Tooltip
                                    color="white"
                                    styles={{
                                      body: {
                                        color: "black",          // text color
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "8px",
                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                                        padding: "8px 12px",
                                        // cursor: 'pointer'
                                      },
                                    }}
                                    title={
                                      <div>
                                        <div><span style={{ color: "red" }}>Required:</span> {valObj.required}</div>
                                        <div><span style={{ color: "#1890ff" }}>Supplied:</span> {valObj.supplied}</div>
                                        <div><span style={{ color: "#52c41a" }}>Installed:</span> {valObj.installed}</div>
                                      </div>
                                    }
                                  >
                                    <Text style={{ cursor: 'pointer' }}>
                                      <span style={{ color: "red", fontWeight: 500 }}>{valObj.required}</span> /{" "}
                                      <span style={{ color: "#1890ff", fontWeight: 500 }}>{valObj.supplied}</span> /{" "}
                                      <span style={{ color: "#52c41a", fontWeight: 500 }}>{valObj.installed}</span>
                                    </Text>
                                  </Tooltip>
                                );
                              }
                              return (
                                <InputNumber
                                  min={0}
                                  style={{ width: 80 }}
                                  value={valObj.Required}
                                  disabled={isSaved} // 🔒 disable if saved
                                  onChange={(newVal) => {
                                    if (isSaved) return; // block changes
                                    const newData = [...tableData];
                                    const row = newData.find(r => r.Towers === record.Towers);
                                    if (!row.inputs) row.inputs = {};
                                    if (!row.inputs[doorType]) row.inputs[doorType] = {};
                                    row.inputs[doorType][thickness] = newVal;
                                    setTableData(newData);
                                  }}
                                />
                              );
                            },
                          })),
                        })),
                        {
                          title: "Action",
                          key: "action",
                          fixed: "right",
                          render: (_, record) => {
                            const isSaved = savedTowers.includes(record.Towers);
                            return isSaved ? (
                              <Tag color="green">✔ Saved</Tag>
                            ) : (
                              <Button
                                type="primary"
                                size="small"
                                onClick={async () => {
                                  try {
                                    const payload = doorTypes.map((doorType) => ({
                                      Project_ID: selectedProjectId,
                                      Towers: record.Towers,
                                      Door_Type: doorType,
                                      Door_Details: thicknessOptions.map((th) => ({
                                        Door_Type_MM: th,
                                        Count: record.inputs?.[doorType]?.[th] || 0,
                                      })),
                                    }));
                                    await axios.post(API_ENDPOINTS.PROJECT_REQUIREMENTS, payload);
                                    message.success(`Saved requirements for ${record.Towers}`);
                                    setSavedTowers(prev => [...prev, record.Towers]); // lock after save
                                  } catch (err) {
                                    message.error("Failed to save");
                                  }
                                }}
                              >
                                Save
                              </Button>
                            );
                          },
                        },
                      ]}
                      dataSource={(() => {
                        // Merge all towers (structure + requirements) into table rows
                        const allTowers = Object.keys(projectDetails.structure || {});
                        const saved = projectDetails.requirements?.Towers || [];

                        return allTowers.map((tower) => {
                          const existing = saved.find((t) => t.Towers === tower);
                          if (existing) {
                            // Fill from backend
                            const row = { Towers: tower, inputs: {} };
                            existing.Door_Types.forEach((doorType) => {
                              if (!row.inputs[doorType.Door_Type]) row.inputs[doorType.Door_Type] = {};
                              doorType.Door_Details.forEach((dd) => {
                                // row.inputs[doorType.Door_Type][dd.Door_Type_MM] = dd.Doors?.Required || 0;
                                row.inputs[doorType.Door_Type][dd.Door_Type_MM] = {
                                  required: Number(dd.Doors?.Required || 0),
                                  supplied: Number(dd.Doors?.Supplied ?? 0),   // default 0 if missing
                                  installed: Number(dd.Doors?.Installed ?? 0), // default 0 if missing
                                };
                              });
                            });
                            return row;
                          }
                          // Empty row for missing tower
                          return { Towers: tower, inputs: {} };
                        });
                      })()}
                      scroll={{ x: "max-content" }}
                    />
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Projects;