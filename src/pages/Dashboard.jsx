import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Progress, Table, Tag, Typography, Space, List, message } from "antd";
import { ProjectOutlined, CheckSquareOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import dayjs from "dayjs";
import axios from "axios";
import { API_ENDPOINTS } from "../utils/config";

const { Title, Text } = Typography;

const Dashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.DASHBOARD);
      setProjects(res.data?.Total_Projects || []);
      setTasks(res.data?.Tasks || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // --- Normalize Project Status ---
  const normalizeProjectStatus = (p) => {
    if (!p.Project_Status) {
      if ((p.Project_Percentage || 0) >= 100) return "completed";
      if ((p.Project_Percentage || 0) > 0) return "in-progress";
      return "planning";
    }
    if (p.Project_Status.description) return p.Project_Status.description;
    if (p.Project_Status.progress >= 100) return "completed";
    if (p.Project_Status.progress > 0) return "in-progress";
    return "planning";
  };

  // --- Statistics ---
  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (p) => normalizeProjectStatus(p) === "completed"
  ).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.Status === "Completed").length;
  const inProgressTasks = tasks.filter(
    (t) => t.Status && t.Status === "In Progress"
  ).length;
  const overdueTasks = tasks.filter(
    (t) => t.Due_Date && dayjs(t.Due_Date).isBefore(dayjs()) && t.Status !== "Completed"
  ).length;

  // --- Chart data ---
  const projectStatusData = [
    {
      name: "Planning",
      value: projects.filter((p) => normalizeProjectStatus(p) === "planning")
        .length,
    },
    {
      name: "In Progress",
      value: projects.filter((p) => normalizeProjectStatus(p) === "in-progress")
        .length,
    },
    { name: "Completed", value: completedProjects },
    {
      name: "On Hold",
      value: projects.filter((p) => normalizeProjectStatus(p) === "on-hold")
        .length,
    },
  ];

  const taskProgressData = projects.map((project) => ({
    name:
      project.Project_Name.length > 15
        ? project.Project_Name.substring(0, 15) + "..."
        : project.Project_Name,
    progress: project.Project_Percentage
      ? Math.round(project.Project_Percentage)
      : 0,
    tasks: tasks.filter((t) => t.Project_ID === project.Project_ID).length,
  }));

  const COLORS = ["#faad14", "#1890ff", "#52c41a", "#f5222d"];

  const upcomingTasks = tasks
    .filter((t) => t.Status !== "Completed")
    .sort((a, b) => new Date(a.Due_Date) - new Date(b.Due_Date))
    .slice(0, 5);

  // --- Tables ---
  const projectColumns = [
    {
      title: "Project Name",
      dataIndex: "Project_Name",
      key: "Project_Name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Progress",
      dataIndex: "Project_Percentage",
      key: "progress",
      render: (progress) => (
        <Progress
          percent={progress ? Math.round(progress) : 0}
          size="small"
          status={progress >= 100 ? "success" : "active"}
        />
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const status = normalizeProjectStatus(record);
        const colorMap = {
          planning: "orange",
          "in-progress": "blue",
          completed: "green",
          "on-hold": "red",
        };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Units",
      dataIndex: "units",
      key: "units",
      render: (units) => units?.toLocaleString() || 0,
    },
  ];

  const taskColumns = [
    { title: "Task Name", dataIndex: "Task_Name", key: "Task_Name" },
    { title: "Project ID", dataIndex: "Project_ID", key: "Project_ID" },
    {
      title: "Priority",
      dataIndex: "Priority",
      key: "Priority",
      render: (priority) => {
        const color =
          priority === "High"
            ? "red"
            : priority === "Medium"
              ? "orange"
              : "blue";
        return <Tag color={color}>{priority || "N/A"}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      render: (status) => {
        const color =
          status === "Completed"
            ? "green"
            : status === "In Progress"
              ? "blue"
              : "orange";
        return <Tag color={color}>{status || "Pending"}</Tag>;
      },
    },
    {
      title: "Due Date",
      dataIndex: "Due_Date",
      key: "Due_Date",
      render: (date) =>
        date ? dayjs(date).format("MMM DD, YYYY") : "N/A",
    },
    { title: "Assigned To", dataIndex: "Assigned_To", key: "Assigned_To" },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Welcome back, {user?.name || "User"}!
      </Title>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <Card size="small" loading={loading}>
            <Statistic
              title="Total Projects"
              value={totalProjects}
              prefix={<ProjectOutlined style={{ color: "#1890ff" }} />}
              suffix={
                completedProjects > 0 ? `(${completedProjects} completed)` : ""
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small" loading={loading}>
            <Statistic
              title="Total Tasks"
              value={totalTasks}
              prefix={<CheckSquareOutlined style={{ color: "#52c41a" }} />}
              suffix={`(${completedTasks} done)`}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small" loading={loading}>
            <Statistic
              title="In Progress"
              value={inProgressTasks}
              prefix={<UserOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small" loading={loading}>
            <Statistic
              title="Overdue Tasks"
              value={overdueTasks}
              prefix={<CalendarOutlined style={{ color: "#f5222d" }} />}
              valueStyle={{
                color: overdueTasks > 0 ? "#f5222d" : "#52c41a",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title="Project Progress Overview"
            style={{ minHeight: 400 }}
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Project Status Distribution"
            style={{ minHeight: 400 }}
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              {projectStatusData.map((entry, index) => (
                <Tag
                  key={entry.name}
                  color={COLORS[index % COLORS.length]}
                  style={{ margin: "2px" }}
                >
                  {entry.name}: {entry.value}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Projects + Tasks Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Active Projects" loading={loading}>
            <Table
              dataSource={projects}
              columns={projectColumns}
              pagination={{ pageSize: 5 }}
              size="small"
              rowKey="id"
              scroll={{ x: "max-content" }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Card title="Upcoming Tasks" size="small" loading={loading}>
              <List
                dataSource={upcomingTasks}
                size="small"
                renderItem={(task) => (
                  <List.Item>
                    <div style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ fontSize: "13px" }} ellipsis>
                          {task.Task_Name}
                        </Text>
                        <Tag
                          color={
                            task.Priority === "High"
                              ? "red"
                              : task.Priority === "Medium"
                                ? "orange"
                                : "blue"
                          }
                        >
                          {task.Priority || "N/A"}
                        </Tag>
                      </div>
                      <div style={{ fontSize: "11px", color: "#999" }}>
                        Due:{" "}
                        {task.Due_Date
                          ? dayjs(task.Due_Date).format("MMM DD, YYYY")
                          : "N/A"}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
            <Card title="All Tasks" loading={loading}>
              <Table
                dataSource={tasks}
                columns={taskColumns}
                pagination={{ pageSize: 5 }}
                size="small"
                rowKey="id"
                scroll={{ x: "max-content" }}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
