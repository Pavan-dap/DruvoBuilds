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
  InputNumber,
  Tooltip,
  Select,
  Statistic,
  Progress,
  Space,
  Input, // Added Input for TextArea
} from "antd";
import {
  ExportOutlined,
  PlusOutlined,
  UserAddOutlined,
  HomeOutlined,
  TeamOutlined,
  CalendarOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { API_ENDPOINTS } from "../utils/config";

const { Title, Text } = Typography;

const Projects = ({ user }) => {
  // --- STATE MANAGEMENT ---
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState("");
  const [projectDetails, setProjectDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [savedTowers, setSavedTowers] = useState([]);
  const [activeKeys, setActiveKeys] = useState([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [tableData, setTableData] = useState([]);

  const excludeDes = ["Admin", "CEO"];

  // --- NEW STATE FOR PROGRESS UPDATE ---
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [progressDescription, setProgressDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();

  // --- DATA FETCHING (unchanged) ---
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.PROJECTS, {
        params: { Emp_No: user?.user_id },
      });
      setProjects(res.data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      message.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.USERS_LIST);
      setEmployees(
        (res.data || []).filter((emp) => !excludeDes.includes(emp.designation))
      );
    } catch (err) {
      console.error(err);
      message.error("Failed to load employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
  }, []);

  const fetchProjectDetails = async (projectId) => {
    setDetailsLoading(true);
    try {
      const res = await axios.get(
        `${API_ENDPOINTS.PROJECTS}?Project_ID=${projectId}`
      );
      const compact = {};
      res.data.Project_Details.forEach((item) => {
        if (!compact[item.Towers]) compact[item.Towers] = {};
        if (!compact[item.Towers][item.Floors])
          compact[item.Towers][item.Floors] = [];
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

  // --- HANDLER LOGIC (unchanged) ---
  const openDetailsModal = (project) => {
    setSelectedProjectId(project.Project_ID);
    setSelectedProjectName(project.Project_Name);
    fetchProjectDetails(project.Project_ID);
    setModalVisible(true);
  };

  const openAssignModal = (project) => {
    setSelectedProject(project);
    setAssignModalVisible(true);
  };

  const handleAssign = async (empId) => {
    if (!selectedProject) return;
    try {
      setAssigning(true);
      await axios.patch(
        `${API_ENDPOINTS.PROJECTS}?Project_ID=${selectedProject.Project_ID}`,
        {
          Handle_By: empId,
        }
      );
      message.success("Handler assigned successfully");
      setAssignModalVisible(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
      message.error("Failed to assign handler");
    } finally {
      setAssigning(false);
    }
  };

  // --- NEW: HANDLE PROGRESS UPDATE ---
  const handleProgressUpdate = async () => {
    if (!selectedProject) return;

    setIsUpdating(true);
    try {
      const payload = {
        Project_Status: {
          progress: progressValue,
          description: progressDescription,
        },
      };

      await axios.patch(
        `${API_ENDPOINTS.PROJECTS}?Project_ID=${selectedProject.Project_ID}`,
        payload
      );

      message.success("Project progress updated successfully! 🎉");
      setUpdateModalVisible(false);
      setProgressValue(0);
      setProgressDescription("");
      fetchProjects();
    } catch (err) {
      console.error("Error updating project status:", err);
      message.error("Failed to update project status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getProjectStats = (project) => {
    const totalTasks = project.tasks?.length || 0;
    const completedTasks =
      project.tasks?.filter((t) => t.Status === "Completed").length || 0;
    const percentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks, percentage };
  };

  // --- TABLE DATA LOGIC (unchanged) ---
  const doorTypes = [
    "Main Door(1050*2100mm)",
    "Bedroom Door(900*2100mm)",
    "Home Office(900*2100mm)",
  ];
  const thicknessOptions = ["250mm", "200mm", "160mm", "100mm"];

  useEffect(() => {
    if (!projectDetails.structure) return;
    const allTowers = Object.keys(projectDetails.structure);
    const saved = projectDetails.requirements?.Towers || [];
    const initialData = allTowers.map((tower) => {
      const row = { Towers: tower, inputs: {} };
      doorTypes.forEach((doorType) => {
        row.inputs[doorType] = {};
        thicknessOptions.forEach((th) => {
          const existingTower = saved.find((t) => t.Towers === tower);
          const existingDoorType = existingTower?.Door_Types.find(
            (d) => d.Door_Type === doorType
          );
          const existingDetail = existingDoorType?.Door_Details.find(
            (dd) => dd.Door_Type_MM === th
          );
          row.inputs[doorType][th] = {
            required: Number(existingDetail?.Doors?.Required ?? 0),
            supplied: Number(existingDetail?.Doors?.Supplied ?? 0),
            installed: Number(existingDetail?.Doors?.Installed ?? 0),
          };
        });
      });
      return row;
    });
    setTableData(initialData);
  }, [projectDetails]);

  useEffect(() => {
    if (projectDetails?.requirements?.Towers) {
      const alreadySaved = projectDetails.requirements.Towers.map(
        (t) => t.Towers
      );
      setSavedTowers(alreadySaved);
    } else {
      setSavedTowers([]);
    }
  }, [projectDetails]);

  // --- NEW: Table column definitions ---
  const columns = [
    {
      title: "Project Name",
      dataIndex: "Project_Name",
      key: "name",
      render: (text, record) => (
        <div>
          <Title level={5} style={{ margin: 0 }}>
            {text}
          </Title>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.Location}
          </Text>
        </div>
      ),
    },
    {
      title: "Client",
      dataIndex: "Customer_Name",
      key: "client",
    },
    {
      title: "Timeline",
      key: "timeline",
      render: (record) => (
        <div>
          <div style={{ fontSize: "12px" }}>
            <CalendarOutlined /> {dayjs(record.Start_Date).format("MMM DD")} -{" "}
            {dayjs(record.End_Date).format("MMM DD, YYYY")}
          </div>
          <div style={{ fontSize: "11px", color: "#999", marginTop: 2 }}>
            Duration:{" "}
            {dayjs(record.End_Date).diff(dayjs(record.Start_Date), "days")} days
          </div>
        </div>
      ),
    },
    {
      title: "Scale",
      key: "scale",
      render: (record) => (
        <div>
          <div style={{ fontSize: "12px" }}>
            <HomeOutlined /> {record.Towers} Towers
          </div>
          <div style={{ fontSize: "11px", color: "#666" }}>
            {record.Floors} Floors
          </div>
        </div>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      render: (record) => {
        const currentProgress = record.Project_Status?.progress || 0;

        const stats = getProjectStats(record);
        return (
          <Space direction="vertical" size="small">
            <Progress
              percent={currentProgress}
              size="small"
              status={currentProgress === 100 ? "success" : "active"}
            />
            <Text style={{ fontSize: "11px" }}>
              {stats.completedTasks}/{stats.totalTasks} tasks completed
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Handler",
      dataIndex: "Handle_By",
      key: "handler",
      render: (handlerId, record) => {
        if (handlerId) {
          const handler = employees.find((e) => e.emp_id === handlerId);
          return handler ? (
            <Tag color="cyan">{handler.name}</Tag>
          ) : (
            <Tag color="gray">{handlerId}</Tag>
          );
        }
        return (
          <Tooltip title="Assign Handler">
            <Button
              size="small"
              icon={<UserAddOutlined />}
              onClick={() => openAssignModal(record)}
              danger
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (record) => {
        const currentProgress = record.Project_Status?.current?.progress || 0;
        return (
          <Space size="small">
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => openDetailsModal(record)}
              />
            </Tooltip>
            <Tooltip title="Update Project">
              <Button
                type="text"
                icon={<FileAddOutlined />}
                size="small"
                onClick={() => {
                  setSelectedProject(record);
                  setProgressValue(currentProgress);
                  setProgressDescription(
                    record.Project_Status?.current?.description || ""
                  );
                  setUpdateModalVisible(true);
                }}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  // --- NEW: Statistics for the header cards ---
  const totalTowers = projects.reduce(
    (sum, p) => sum + Number(p.Towers || 0),
    0
  );
  const activeProjects = projects.filter(
    (p) => p.Project_Status !== "completed"
  ).length;

  return (
    <div>
      {/* --- Header Section --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Projects Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/new-project")}
        >
          Add Project
        </Button>
      </div>

      {/* --- Statistics Cards --- */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Total Projects"
              value={projects.length}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Total Towers"
              value={totalTowers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Active Projects"
              value={activeProjects}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* --- Main Projects Table --- */}
      <Card>
        <Table
          loading={loading}
          dataSource={projects}
          columns={columns}
          rowKey="Project_ID"
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="small"
        />
      </Card>

      {/* --- MODAL for project details (unchanged) --- */}
      <Modal
        title={`${selectedProjectName} (${selectedProjectId})`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setProjectDetails({});
        }}
        footer={null}
        width={1200}
        centered
      >
        {detailsLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : (
          <div>
            <Card
              title="🏢 Project Structure"
              size="small"
              style={{ marginBottom: 16 }}
              extra={
                <div>
                  <Button
                    size="small"
                    onClick={() =>
                      setActiveKeys(Object.keys(projectDetails.structure || {}))
                    }
                    style={{ marginRight: 8 }}
                  >
                    Expand All
                  </Button>
                  <Button size="small" onClick={() => setActiveKeys([])}>
                    Collapse All
                  </Button>
                </div>
              }
            >
              <Row gutter={[12, 12]}>
                {projectDetails.structure &&
                  Object.entries(projectDetails.structure).map(
                    ([tower, floors]) => {
                      const floorCount = Object.keys(floors).length;
                      const unitCount = Object.values(floors).reduce(
                        (sum, units) =>
                          sum +
                          units.reduce((acc, u) => acc + Number(u.Count), 0),
                        0
                      );
                      return (
                        <Col xs={24} md={12} lg={8} key={tower}>
                          <Collapse
                            activeKey={activeKeys}
                            onChange={setActiveKeys}
                          >
                            <Collapse.Panel
                              key={tower}
                              header={
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: "100%",
                                  }}
                                >
                                  <span style={{ fontWeight: 600 }}>
                                    {tower}
                                  </span>
                                  <span style={{ fontSize: 12, color: "#888" }}>
                                    {floorCount} Floors · {unitCount} Units
                                  </span>
                                </div>
                              }
                            >
                              {Object.entries(floors).map(
                                ([floor, units], floorIndex) => (
                                  <div
                                    key={floorIndex}
                                    style={{ marginBottom: "8px" }}
                                  >
                                    <div
                                      style={{
                                        fontWeight: "bold",
                                        fontSize: "12px",
                                        color: "#1890ff",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      📍 {floor}
                                    </div>
                                    <div style={{ paddingLeft: "12px" }}>
                                      {units.map((u, unitIndex) => (
                                        <div
                                          key={unitIndex}
                                          style={{
                                            fontSize: "11px",
                                            marginBottom: "2px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          <span>
                                            <Tag size="small" color="green">
                                              {u.Units_Type}
                                            </Tag>{" "}
                                            {Array.isArray(u.Units)
                                              ? u.Units.join(", ")
                                              : u.Units}
                                          </span>
                                          <span style={{ color: "#666" }}>
                                            ({u.Count})
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              )}
                            </Collapse.Panel>
                          </Collapse>
                        </Col>
                      );
                    }
                  )}
              </Row>
            </Card>
            <Collapse
              size="small"
              items={[
                {
                  key: "required-doors",
                  label: "Doors Requirements",
                  children: (
                    <Table
                      bordered
                      pagination={false}
                      rowKey="Towers"
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
                            key: `${doorType}-${thickness}`,
                            render: (val, record) => {
                              const valObj = record.inputs?.[doorType]?.[
                                thickness
                              ] || { required: 0, supplied: 0, installed: 0 };
                              const isSaved = savedTowers.includes(
                                record.Towers
                              );
                              if (isSaved) {
                                return (
                                  <Tooltip
                                    color="white"
                                    styles={{
                                      body: {
                                        color: "black",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "8px",
                                        padding: "8px 12px",
                                      },
                                    }}
                                    title={
                                      <div>
                                        <div>
                                          <span style={{ color: "red" }}>
                                            Required:
                                          </span>{" "}
                                          {valObj.required}
                                        </div>
                                        <div>
                                          <span style={{ color: "#1890ff" }}>
                                            Supplied:
                                          </span>{" "}
                                          {valObj.supplied}
                                        </div>
                                        <div>
                                          <span style={{ color: "#52c41a" }}>
                                            Installed:
                                          </span>{" "}
                                          {valObj.installed}
                                        </div>
                                      </div>
                                    }
                                  >
                                    <Text style={{ cursor: "pointer" }}>
                                      <span
                                        style={{
                                          color: "red",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {valObj.required}
                                      </span>{" "}
                                      /{" "}
                                      <span
                                        style={{
                                          color: "#1890ff",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {valObj.supplied}
                                      </span>{" "}
                                      /{" "}
                                      <span
                                        style={{
                                          color: "#52c41a",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {valObj.installed}
                                      </span>
                                    </Text>
                                  </Tooltip>
                                );
                              }
                              return (
                                <InputNumber
                                  min={0}
                                  style={{ width: 80 }}
                                  value={valObj.required}
                                  disabled={isSaved}
                                  onChange={(newVal) => {
                                    if (isSaved) return;
                                    setTableData((prev) => {
                                      const newData = [...prev];
                                      const rowIndex = newData.findIndex(
                                        (r) => r.Towers === record.Towers
                                      );
                                      newData[rowIndex].inputs[doorType][
                                        thickness
                                      ].required = newVal;
                                      return newData;
                                    });
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
                                    const payload = doorTypes.map(
                                      (doorType) => ({
                                        Project_ID: selectedProjectId,
                                        Towers: record.Towers,
                                        Door_Type: doorType,
                                        Door_Details: thicknessOptions.map(
                                          (th) => ({
                                            Door_Type_MM: th,
                                            Count:
                                              record.inputs[doorType][th]
                                                .required,
                                          })
                                        ),
                                      })
                                    );
                                    await axios.post(
                                      API_ENDPOINTS.PROJECT_REQUIREMENTS,
                                      payload
                                    );
                                    message.success(
                                      `Saved requirements for ${record.Towers}`
                                    );
                                    setSavedTowers((prev) => [
                                      ...prev,
                                      record.Towers,
                                    ]);
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
                      dataSource={tableData}
                      scroll={{ x: "max-content" }}
                    />
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* --- MODAL for assigning handler (unchanged) --- */}
      <Modal
        title={`Assign Handler - ${selectedProject?.Project_Name}`}
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        footer={null}
      >
        <Select
          style={{ width: "100%" }}
          placeholder="Select Employee"
          loading={assigning || !employees.length}
          onChange={(value) => handleAssign(value)}
          showSearch
          filterOption={(input, option) =>
            (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
          }
        >
          {employees.map((emp) => (
            <Select.Option key={emp.emp_id} value={emp.emp_id}>
              {emp.name} ({emp.designation})
            </Select.Option>
          ))}
        </Select>
      </Modal>

      {/* --- NEW: MODAL FOR PROGRESS UPDATE --- */}
      <Modal
        title={`Update Progress for ${selectedProject?.Project_Name}`}
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        onOk={handleProgressUpdate}
        confirmLoading={isUpdating}
        okText="Update"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <label>Progress Percentage:</label>
          <InputNumber
            min={0}
            max={100}
            style={{ width: "100%" }}
            value={progressValue}
            onChange={(value) => setProgressValue(value)}
            addonAfter="%"
          />
          <label>Description:</label>
          <Input.TextArea
            placeholder="e.g., Development phase complete."
            value={progressDescription}
            onChange={(e) => setProgressDescription(e.target.value)}
            rows={3}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default Projects;
