import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Select,
  DatePicker,
  Row,
  Col,
} from "antd";
import {
  CalendarOutlined,
  ProjectOutlined,
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  LinkOutlined,
  ExclamationCircleOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import weekOfYear from "dayjs/plugin/weekOfYear";
import axios from "axios";
import { API_ENDPOINTS } from "../utils/config";
// API_ENDPOINTS.GANTTCHART

dayjs.extend(minMax);
dayjs.extend(quarterOfYear);
dayjs.extend(weekOfYear);

const { Title } = Typography;
const { Option } = Select;

const GanttChart = ({ user }) => {
  const ganttRef = useRef(null);

  // State
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [timelineView, setTimelineView] = useState("month");
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Load mock data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.GANTTCHART, {
        params: { Emp_No: user?.user_id },
      });

      // Map API data to the format your component expects
      const apiProjects = res.data?.Total_Projects || [];
      const mappedProjects = apiProjects.map((p) => ({
        id: p.id,
        name: p.Project_Name,
        startDate: p.Start_Date || dayjs().format("YYYY-MM-DD"),
        endDate: p.End_Date || dayjs().add(1, "month").format("YYYY-MM-DD"),
        progress: Math.round((p.Progress || 0)), // decimal → %
        status: p.Project_Status
          ? p.Project_Status.toLowerCase()
          : "in-progress", // default since Project_Status is null
      }));

      const apiTasks = res.data?.Tasks || [];
      const mappedTasks = apiTasks.map((t) => ({
        id: t.Task_ID,
        projectId:
          apiProjects.find((p) => p.Project_ID === t.Project_ID)?.id ||
          t.Project_ID,
        title: t.Task_Name,
        createdDate: t.Created_At,
        dueDate: t.Due_Date,
        progress: Math.round((t.Progress || 0)), // decimal → %
        status: t.Status ? t.Status.toLowerCase() : "not-started",
        priority: t.Priority ? t.Priority.toLowerCase() : "medium",
      }));

      setProjects(mappedProjects);
      setTasks(mappedTasks);
      setExpandedProjects(new Set(mappedProjects.map((p) => p.id)));
    } catch (err) {
      console.error("Error fetching projects:", err);
      message.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on selections
  let filteredProjects = projects;
  let filteredTasks = tasks;

  if (selectedProjectId) {
    filteredProjects = filteredProjects.filter(
      (p) => p.id === selectedProjectId
    );
    filteredTasks = filteredTasks.filter(
      (t) => t.projectId === selectedProjectId
    );
  }

  if (selectedStatus) {
    // Filter projects and tasks that match the status
    const projectIdsWithStatus = projects
      .filter((p) => p.status === selectedStatus)
      .map((p) => p.id);
    const taskProjectIdsWithStatus = tasks
      .filter((t) => t.status === selectedStatus)
      .map((t) => t.projectId);
    const relevantProjectIds = new Set([
      ...projectIdsWithStatus,
      ...taskProjectIdsWithStatus,
    ]);

    filteredProjects = projects.filter((p) => relevantProjectIds.has(p.id));
    // When a status is selected, we show all tasks for the projects that have that status, plus any tasks that have that status themselves.
    filteredTasks = tasks.filter((t) => relevantProjectIds.has(t.projectId));
  }

  if (dateRange && dateRange[0] && dateRange[1]) {
    const startDate = dateRange[0];
    const endDate = dateRange[1];
    filteredProjects = filteredProjects.filter((p) => {
      const projectStart = dayjs(p.startDate);
      const projectEnd = dayjs(p.endDate);
      return (
        projectStart.isBefore(endDate.add(1, "day")) &&
        projectEnd.isAfter(startDate.subtract(1, "day"))
      );
    });
    // Filter tasks based on the date range, but keep them if their project is visible
    filteredTasks = filteredTasks.filter((t) => {
      const taskStart = dayjs(t.createdDate);
      const taskEnd = dayjs(t.dueDate);
      return (
        taskStart.isBefore(endDate.add(1, "day")) &&
        taskEnd.isAfter(startDate.subtract(1, "day"))
      );
    });
  }

  // Expand/Collapse project rows
  const toggleProjectExpansion = (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  // Generate timeline data for rendering
  const generateTimelineData = () => {
    const allItems = [];
    filteredProjects.forEach((project) => {
      const projectTasks = filteredTasks.filter(
        (t) => t.projectId === project.id
      );
      const hasChildren = projectTasks.length > 0;
      allItems.push({
        id: `project-${project.id}`,
        name: project.name,
        type: "project",
        start: dayjs(project.startDate),
        end: dayjs(project.endDate),
        progress: project.progress,
        status: project.status,
        projectId: project.id,
        isExpanded: expandedProjects.has(project.id),
        hasChildren,
        level: 0,
      });
      if (expandedProjects.has(project.id)) {
        projectTasks
          .sort(
            (a, b) =>
              dayjs(a.createdDate).valueOf() - dayjs(b.createdDate).valueOf()
          )
          .forEach((task) => {
            allItems.push({
              id: `task-${task.id}`,
              name: task.title,
              type: "task",
              start: dayjs(task.createdDate),
              end: dayjs(task.dueDate),
              progress: task.progress,
              status: task.status,
              priority: task.priority,
              projectId: task.projectId,
              taskId: task.id,
              level: 1,
            });
          });
      }
    });
    return allItems;
  };

  const timelineData = generateTimelineData();

  // Calculate the overall start and end dates for the timeline view
  const getTimelineBounds = () => {
    if (timelineData.length === 0)
      return { start: dayjs(), end: dayjs().add(1, "month") };
    const starts = timelineData.map((item) => item.start);
    const ends = timelineData.map((item) => item.end);
    const minStart = dayjs.min(starts)?.subtract(1, "week") || dayjs();
    const maxEnd = dayjs.max(ends)?.add(1, "week") || dayjs().add(1, "month");
    return { start: minStart, end: maxEnd };
  };

  const { start: timelineStart, end: timelineEnd } = getTimelineBounds();
  const totalDays = timelineEnd.diff(timelineStart, "days");

  // Generate headers for the timeline (e.g., months, weeks)
  const generateTimelineHeaders = () => {
    const headers = [];
    let current = timelineStart.clone();

    switch (timelineView) {
      case "week":
        current = current.startOf("week");
        while (current.isBefore(timelineEnd)) {
          const daysInView = Math.min(7, timelineEnd.diff(current, "days"));
          headers.push({
            label: `Week ${current.week()}`,
            width: (daysInView / totalDays) * 100,
          });
          current = current.add(1, "week");
        }
        break;
      case "quarter":
        current = current.startOf("quarter");
        while (current.isBefore(timelineEnd)) {
          const endOfQuarter = current.endOf("quarter");
          const daysInView = Math.min(
            endOfQuarter.diff(current, "days") + 1,
            timelineEnd.diff(current, "days")
          );
          headers.push({
            label: `Q${current.quarter()} ${current.year()}`,
            width: (daysInView / totalDays) * 100,
          });
          current = current.add(1, "quarter");
        }
        break;
      default: // month view
        current = current.startOf("month");
        while (current.isBefore(timelineEnd)) {
          const daysInMonth = current.daysInMonth();
          const daysInView = Math.min(
            daysInMonth - current.date() + 1,
            timelineEnd.diff(current, "days")
          );
          headers.push({
            label: current.format("MMM YYYY"),
            width: (daysInView / totalDays) * 100,
          });
          current = current.add(1, "month");
        }
    }
    return headers;
  };

  const timelineHeaders = generateTimelineHeaders();

  // Calculate the left offset and width for a timeline bar
  const calculateBarStyle = (item) => {
    const startOffset = item.start.diff(timelineStart, "days");
    const duration = item.end.diff(item.start, "days") + 1;
    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  // Get color based on item status
  const getStatusColor = (status, type) => {
    const projectColors = {
      planning: "#faad14",
      "in-progress": "#1890ff",
      completed: "#52c41a",
      "on-hold": "#f5222d",
    };
    const taskColors = {
      "not-started": "#d9d9d9",
      "in-progress": "#1890ff",
      completed: "#52c41a",
      "on-hold": "#faad14",
    };
    return type === "project"
      ? projectColors[status] || "#d9d9d9"
      : taskColors[status] || "#d9d9d9";
  };

  // Get color based on task priority
  const getPriorityColor = (priority) => {
    return (
      { high: "#f5222d", medium: "#faad14", low: "#52c41a" }[priority] ||
      "#1890ff"
    );
  };

  return (
    <div
      style={{
        padding: "24px",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#F7FAFC",
      }}
    >
      <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            <CalendarOutlined style={{ marginRight: 8 }} /> Project Timeline
          </Title>
        </Col>
        <Col>
          <Space>
            <Select
              value={timelineView}
              onChange={(value) => setTimelineView(value)}
              style={{ width: 120 }}
            >
              <Option value="week">Week</Option>
              <Option value="month">Month</Option>
              <Option value="quarter">Quarter</Option>
            </Select>
            <Button
              onClick={() =>
                setExpandedProjects(new Set(filteredProjects.map((p) => p.id)))
              }
            >
              Expand All
            </Button>
            <Button onClick={() => setExpandedProjects(new Set())}>
              Collapse All
            </Button>
            <Button icon={<ZoomInOutlined />} />
            <Button icon={<ZoomOutOutlined />} />
            <Button icon={<FullscreenOutlined />} />
          </Space>
        </Col>
      </Row>

      <Card>
        {/* Filter Section */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by Project"
              style={{ width: "100%" }}
              allowClear
              value={selectedProjectId}
              onChange={(value) => setSelectedProjectId(value)}
            >
              {projects.map((project) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by Status"
              style={{ width: "100%" }}
              allowClear
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value)}
            >
              <Option value="planning">Planning</Option>
              <Option value="in-progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="on-hold">On Hold</Option>
              <Option value="not-started">Not Started</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              onClick={() => {
                setSelectedProjectId(null);
                setSelectedStatus(null);
                setDateRange(null);
              }}
              style={{ width: "100%" }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>

        {/* Gantt Chart */}
        <div
          ref={ganttRef}
          style={{
            border: "1px solid #e8e8e8",
            borderRadius: "8px",
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          <div style={{ display: "flex", minWidth: "1200px" }}>
            {/* Left Pane: Task/Project List */}
            <div
              style={{
                width: "350px",
                minWidth: "350px",
                borderRight: "1px solid #e8e8e8",
              }}
            >
              <div
                style={{
                  padding: "16px",
                  fontWeight: "600",
                  backgroundColor: "#fafafa",
                  borderBottom: "1px solid #e8e8e8",
                }}
              >
                Project / Task
              </div>
              <div>
                {timelineData.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: `12px 16px`,
                      paddingLeft: `${16 + item.level * 24}px`,
                      borderBottom: "1px solid #f0f0f0",
                      minHeight: "50px",
                      backgroundColor:
                        item.type === "project" ? "#f0f9ff" : "#fff",
                    }}
                  >
                    {item.hasChildren && (
                      <Button
                        type="text"
                        size="small"
                        icon={
                          item.isExpanded ? (
                            <CaretDownOutlined />
                          ) : (
                            <CaretRightOutlined />
                          )
                        }
                        onClick={() => toggleProjectExpansion(item.projectId)}
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <span
                      style={{
                        fontWeight: item.type === "project" ? "600" : "400",
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Pane: Timeline */}
            <div style={{ flex: 1 }}>
              {/* Timeline Header */}
              <div
                style={{
                  display: "flex",
                  backgroundColor: "#fafafa",
                  borderBottom: "1px solid #e8e8e8",
                }}
              >
                {timelineHeaders.map((header, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${header.width}%`,
                      textAlign: "center",
                      padding: "16px 4px",
                      borderRight: "1px solid #e8e8e8",
                      fontWeight: "600",
                    }}
                  >
                    {header.label}
                  </div>
                ))}
              </div>

              {/* Timeline Rows */}
              <div>
                {timelineData.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      position: "relative",
                      height: "50px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div
                      title={`${item.name} (${item.progress}%)`}
                      style={{
                        position: "absolute",
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: item.type === "project" ? "24px" : "18px",
                        backgroundColor: getStatusColor(item.status, item.type),
                        borderRadius: "4px",
                        ...calculateBarStyle(item),
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${item.progress}%`,
                          backgroundColor: "rgba(0,0,0,0.15)",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          color: "white",
                          fontSize: "10px",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name} - {item.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GanttChart;
