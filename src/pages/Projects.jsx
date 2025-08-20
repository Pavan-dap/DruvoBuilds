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
import {
  API_PROJECTS,
  API_PROJECT_REQUIREMENTS,
} from "./../utils/constants/Config";

const { Title } = Typography;
const { Panel } = Collapse;

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectDetails, setProjectDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch project list
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_PROJECTS);
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
      const res = await axios.get(`${API_PROJECTS}?Project_ID=${projectId}`);

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

  const openModal = (projectId) => {
    setSelectedProjectId(projectId);
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

        await axios.post(`${API_PROJECT_REQUIREMENTS}`, payload);
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
          marginBottom: 24,
        }}
      >
        <Title level={2}>Projects</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/new-project")}
        >
          Add Project
        </Button>
      </div>

      {/* Grid of projects */}
      {loading ? (
        <Spin size="large" />
      ) : (
        <Row gutter={[16, 16]}>
          {projects.map((project) => (
            <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
              <Card
                title={project.Project_Name}
                variant="bordered"
                hoverable
                extra={<Tag color="blue">{project.Project_ID}</Tag>}
                onClick={() => openModal(project.Project_ID)}
              >
                <p>
                  <strong>Customer:</strong> {project.Customer_Name}
                </p>
                <p>
                  <strong>Location:</strong> {project.Location}
                </p>
                <p>
                  <strong>Contact:</strong> {project.Contact_No}
                </p>
                <p>
                  <strong>Email:</strong> {project.Mail_Id}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal for project details */}
      <Modal
        title={`Project Details - ${selectedProjectId}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1000}
        centered
      >
        {detailsLoading ? (
          <Spin size="large" />
        ) : (
          <Collapse accordion>
            {/* Project Details */}
            <Panel
              header="Project Structure (Towers → Floors → Units)"
              key="project-details"
            >
              <Collapse accordion>
                {projectDetails.structure &&
                  Object.entries(projectDetails.structure).map(
                    ([tower, floors]) => (
                      <Panel header={tower} key={tower}>
                        <Collapse>
                          {Object.entries(floors).map(([floor, units], idx) => (
                            <Panel header={floor} key={idx}>
                              {units.map((u, i) => (
                                <p key={i}>
                                  <strong>{u.Units_Type}:</strong>{" "}
                                  {Array.isArray(u.Units)
                                    ? u.Units.join(", ")
                                    : u.Units}{" "}
                                  ({u.Count})
                                </p>
                              ))}
                            </Panel>
                          ))}
                        </Collapse>
                      </Panel>
                    )
                  )}
              </Collapse>
            </Panel>

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
                        <Title level={5}>{towerName}</Title>
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
        )}
      </Modal>
    </div>
  );
};

export default Projects;
