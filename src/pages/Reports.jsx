import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  Button,
  Space,
  DatePicker,
  Select,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  message,
  Grid,
  Spin,
} from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import dayjs from "dayjs";
import axios from "axios";
import { API_ENDPOINTS } from "../utils/config";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const Reports = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedProject, setSelectedProject] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [reportType, setReportType] = useState("summary");
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef(null);

  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  // Fetch API Data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINTS.REPORTS);
        const data = res.data || {};

        // Normalize Projects
        const normalizedProjects = (data.Total_Projects || []).map((p) => ({
          id: p.id,
          projectCode: p.Project_ID,
          name: p.Project_Name,
          location: p.Location,
          progress: Math.round((p?.Progress || 0)), // convert to %
          startDate: p.Start_Date ? dayjs(p.Start_Date).toISOString() : null,
          endDate: p.End_Date ? dayjs(p.End_Date).toISOString() : null,
          status: p.Project_Status || "ongoing",
        }));

        // Normalize Tasks
        const normalizedTasks = (data.Tasks || []).map((t, idx) => ({
          id: t.Task_ID || idx,
          projectCode: t.Project_ID,
          title: t.Task_Name,
          status: t.Status?.toLowerCase() || "not-started",
          priority: t?.Priority.toLowerCase(), // default since API doesn’t provide
          progress: Math.round((t?.Progress || 0)), // convert to %
          createdDate: t.Created_At ? dayjs(t.Created_At).toISOString() : null,
          dueDate: t.Due_Date ? dayjs(t.Due_Date).toISOString() : null,
        }));

        setProjects(normalizedProjects);
        setTasks(normalizedTasks);
      } catch (error) {
        console.error("Error fetching reports:", error);
        message.error("Failed to load reports data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // --- Export PDF (same as your code) ---
  const exportToPDF = async () => {
    if (!reportRef.current) return;

    setIsExporting(true);
    message.loading({ content: "Generating PDF...", key: "pdfExport" });
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const projectName =
        selectedProject === "all"
          ? "All_Projects"
          : projects
            .find((p) => p.id === selectedProject)
            ?.name?.replace(/\s+/g, "_") || "Unknown_Project";
      const fileName = `${projectName}_Report_${dayjs().format(
        "YYYY-MM-DD"
      )}.pdf`;

      pdf.save(fileName);
      message.success({
        content: "Report exported to PDF successfully!",
        key: "pdfExport",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error({
        content: "Failed to export PDF. Please try again.",
        key: "pdfExport",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // --- Print (same as your code) ---
  const handlePrint = () => {
    if (!reportRef.current) return;

    const printContent = reportRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
          <html>
            <head>
              <title>Construction Project Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .ant-card { border: 1px solid #d9d9d9; border-radius: 6px; margin-bottom: 16px; page-break-inside: avoid; }
                .ant-card-head { padding: 16px; border-bottom: 1px solid #f0f0f0; font-weight: bold; }
                .ant-card-body { padding: 16px; }
                .ant-table { border: 1px solid #f0f0f0; }
                .ant-table th, .ant-table td { border: 1px solid #f0f0f0; padding: 8px; }
                .ant-tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
                .no-print { display: none !important; }
                @media print {
                  body { -webkit-print-color-adjust: exact; } /* Ensures colors and backgrounds print */
                  .no-print { display: none !important; }
                  .ant-card { break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              <h1>Construction Project Report</h1>
              <p>Generated on: ${dayjs().format("MMMM DD, YYYY")}</p>
              <hr/>
              ${printContent}
            </body>
          </html>
        `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  // --- Filtering ---
  const filteredProjects =
    selectedProject === "all"
      ? projects
      : projects.filter((p) => p.id === selectedProject);

  const filteredTasks = tasks.filter((task) => {
    const projectCodes = filteredProjects.map((p) => p.projectCode);
    const matchesProject = projectCodes.includes(task.projectCode);

    const matchesDateRange =
      !dateRange ||
      (dayjs(task.createdDate).isAfter(dateRange[0]) &&
        dayjs(task.createdDate).isBefore(dateRange[1]));

    return matchesProject && matchesDateRange;
  });

  // --- Stats ---
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(
    (t) => t.status === "completed"
  ).length;
  const inProgressTasks = filteredTasks.filter(
    (t) => t.status === "in-progress"
  ).length;
  const overdueTasks = filteredTasks.filter(
    (t) => dayjs(t.dueDate).isBefore(dayjs()) && t.status !== "completed"
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // --- Charts ---
  const taskStatusData = [
    {
      name: "Not Started",
      value: filteredTasks.filter((t) => t.status === "not-started").length,
      color: "#d9d9d9",
    },
    { name: "In Progress", value: inProgressTasks, color: "#1890ff" },
    { name: "Completed", value: completedTasks, color: "#52c41a" },
    {
      name: "On Hold",
      value: filteredTasks.filter((t) => t.status === "on-hold").length,
      color: "#faad14",
    },
  ];

  const priorityData = [
    {
      name: "High",
      value: filteredTasks.filter((t) => t.priority === "high").length,
      color: "#f5222d",
    },
    {
      name: "Medium",
      value: filteredTasks.filter((t) => t.priority === "medium").length,
      color: "#faad14",
    },
    {
      name: "Low",
      value: filteredTasks.filter((t) => t.priority === "low").length,
      color: "#52c41a",
    },
  ];

  const projectProgressData = filteredProjects.map((project) => ({
    name:
      project.name.length > 15
        ? project.name.substring(0, 15) + "..."
        : project.name,
    progress: project.progress,
    totalTasks: tasks.filter((t) => t.projectCode === project.projectCode)
      .length,
    completedTasks: tasks.filter(
      (t) => t.projectCode === project.projectCode && t.status === "completed"
    ).length,
  }));

  const getProgressTimelineData = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = dayjs().subtract(i, "day");
      const tasksCompletedOnDay = filteredTasks.filter(
        (task) =>
          task.status === "completed" &&
          dayjs(task.createdDate).isSame(date, "day")
      ).length;

      const cumulativeCompleted = filteredTasks.filter(
        (task) =>
          task.status === "completed" &&
          dayjs(task.createdDate).isBefore(date.endOf("day"))
      ).length;

      return {
        date: date.format("MMM DD"),
        completed: tasksCompletedOnDay,
        cumulative: cumulativeCompleted,
      };
    }).reverse();
  };

  const timelineData = getProgressTimelineData();

  // --- Table Columns ---
  const taskColumns = [
    {
      title: "Task",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {projects.find((p) => p.projectCode === record.projectCode)?.name}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          "not-started": "default",
          "in-progress": "processing",
          completed: "success",
          "on-hold": "warning",
        };
        return (
          <Tag color={colorMap[status]}>
            {status.replace("-", " ").toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => {
        const colors = { high: "red", medium: "orange", low: "blue" };
        return <Tag color={colors[priority]}>{priority.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress) => <Progress percent={progress} size="small" />,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date, record) => {
        const isOverdue =
          dayjs(date).isBefore(dayjs()) && record.status !== "completed";
        return (
          <Text style={{ color: isOverdue ? "#f5222d" : "inherit" }}>
            {dayjs(date).format("MMM DD, YYYY")}
          </Text>
        );
      },
    },
  ];

  const renderSummaryReport = () => (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Tasks"
              value={totalTasks}
              prefix={<CheckSquareOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Completed"
              value={completedTasks}
              prefix={<CheckSquareOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Completion Rate"
              value={completionRate}
              suffix="%"
              valueStyle={{
                color:
                  completionRate > 70
                    ? "#52c41a"
                    : completionRate > 40
                      ? "#faad14"
                      : "#f5222d",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Overdue"
              value={overdueTasks}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: overdueTasks > 0 ? "#f5222d" : "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Task Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Priority Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Project Progress Overview">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  label={{
                    value: "Progress %",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="progress" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Space>
  );

  const handleExport = (format) => {
    message.info(
      `This is a demo. Exporting to ${format.toUpperCase()} would be implemented here.`
    );
    const data = {
      reportType,
      dateRange: dateRange
        ? `${dateRange[0].format("YYYY-MM-DD")} to ${dateRange[1].format(
          "YYYY-MM-DD"
        )}`
        : "All time",
      project:
        selectedProject === "all"
          ? "All projects"
          : projects.find((p) => p.id === selectedProject)?.name,
      stats: { totalTasks, completedTasks, completionRate, overdueTasks },
      tasks: filteredTasks,
    };
    console.log(`Exporting ${format.toUpperCase()} report:`, data);
  };

  const renderProgressReport = () => (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card title="Progress Timeline (Last 7 Days)">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#52c41a"
              name="Daily Completed"
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#1890ff"
              name="Cumulative Completed"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={[16, 16]}>
        {filteredProjects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const projectCompleted = projectTasks.filter(
            (t) => t.status === "completed"
          ).length;
          const projectProgress =
            projectTasks.length > 0
              ? Math.round((projectCompleted / projectTasks.length) * 100)
              : 0;
          return (
            <Col xs={24} sm={12} lg={8} key={project.id}>
              <Card size="small">
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>{project.name}</Title>
                  <Text type="secondary">{project.location}</Text>
                </div>
                <Progress
                  percent={projectProgress}
                  status={projectProgress === 100 ? "success" : "active"}
                  strokeWidth={8}
                />
                <div style={{ marginTop: 8, fontSize: "12px", color: "#666" }}>
                  {projectCompleted}/{projectTasks.length} tasks completed
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Space>
  );

  const renderDetailedReport = () => (
    <Card title="Detailed Task Report">
      <Table
        dataSource={filteredTasks}
        columns={taskColumns}
        rowKey="id"
        scroll={{ x: "max-content" }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} tasks`,
          size: "small",
        }}
      />
    </Card>
  );

  return (
    <div>
      {loading ? (
        <Spin tip="Loading reports..." fullscreen />
      ) : (
        <>
          {/* Top Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <Title level={3} style={{ margin: 0 }}>
              Reports & Analytics
            </Title>
            <Space wrap>
              <Button
                icon={<FileExcelOutlined />}
                onClick={() => handleExport("excel")}
                disabled
              >
                {!isMobile && "Export Excel"}
              </Button>
              <Button
                icon={<FilePdfOutlined />}
                onClick={exportToPDF}
                loading={isExporting}
              >
                {!isMobile && "Export PDF"}
              </Button>
              <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                {!isMobile && "Print"}
              </Button>
            </Space>
          </div>

          {/* Filters */}
          <Card style={{ marginBottom: 24 }} className="no-print">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={6}>
                <Select
                  value={reportType}
                  onChange={setReportType}
                  style={{ width: "100%" }}
                >
                  <Option value="summary">Summary Report</Option>
                  <Option value="progress">Progress Report</Option>
                  <Option value="detailed">Detailed Report</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  value={selectedProject}
                  onChange={setSelectedProject}
                  style={{ width: "100%" }}
                >
                  <Option value="all">All Projects</Option>
                  {projects.map((project) => (
                    <Option key={project.id} value={project.id}>
                      {project.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={24} md={8}>
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col xs={24} sm={24} md={4}>
                <Button
                  type="primary"
                  block
                  onClick={() => message.success("Report Generated!")}
                >
                  Generate
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Data */}
          {filteredTasks.length === 0 ? (
            <Alert
              message="No Data Available"
              description="No tasks found for the selected filters. Please adjust your search criteria."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          ) : (
            <div ref={reportRef}>
              <div style={{ padding: 20, background: "#fff" }}>
                {" "}
                {/* Wrapper for PDF/Print styling */}
                {reportType === "summary" && renderSummaryReport()}
                {reportType === "progress" && renderProgressReport()}
                {reportType === "detailed" && renderDetailedReport()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
