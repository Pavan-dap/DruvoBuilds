import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Divider,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { API_ENDPOINTS } from "../utils/config";

const { Title } = Typography;
const { Option } = Select;

const Tasks = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [form] = Form.useForm();

  // Door constants (shared with Installation)
  const doorTypes = [
    "Main Door(1050*2100mm)",
    "Bedroom Door(900*2100mm)",
    "Home Office(900*2100mm)",
  ];
  const doorColors = {
    "Main Door(1050*2100mm)": "#e6f7ff",
    "Bedroom Door(900*2100mm)": "#fff7e6",
    "Home Office(900*2100mm)": "#f9f0ff",
  };
  const thicknessOptions = ["250mm", "200mm", "160mm", "100mm"];
  const Types = ["Frames", "Shutters", "Hardwares"];

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.TASKS, {
        params: { Emp_No: user.user_id },
      });
      setTasks(res.data || []);
    } catch (error) {
      console.error(error);
      message.error("Error fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.USERS_LIST);
      const EXCLUDED_ROLES = ["Manager", "Admin", "CEO"];
      setUsers(
        (res.data || []).filter((u) => !EXCLUDED_ROLES.includes(u.designation))
      );
    } catch (error) {
      console.error(error);
      message.error("Error fetching users");
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.TASKS_PROJECTS);
      setProjects(res.data || []);
    } catch (error) {
      console.error(error);
      message.error("Error fetching projects");
    }
  };

  const handleAddTask = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [projectId, towerName, floors] = values.projectTower.split("|");

      const payload = {
        Project_ID: projectId,
        Assigned_By: user.user_id,
        Assigned_To: values.assignee,
        Towers: towerName,
        Floors: Number(floors),
        Task_Name: values.title,
        Priority: values.priority,
        Due_Date: values.dueDate.format("YYYY-MM-DD"),
      };

      await axios.post(API_ENDPOINTS.TASKS, payload);
      message.success("Task added successfully");
      setModalVisible(false);
      fetchTasks();
      fetchUsers();
      fetchProjects();
    } catch (error) {
      console.error(error);
      message.error("Failed to add task");
    }
  };

  const handleMarkComplete = async (task) => {
    try {
      await axios.patch(`${API_ENDPOINTS.TASKS}?Task_ID=${task.Task_ID}`, {
        Status: "Completed",
      });
      message.success(`Task "${task.Task_Name}" marked as completed`);
      fetchTasks();
    } catch (error) {
      console.error(error);
      message.error("Failed to update task status");
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setViewModalVisible(true);
  };

  // ===== Matrix Data (like Installation) =====
  const matrixData = useMemo(() => {
    if (!selectedTask) return { supplied: [], installed: [] };

    const getCountsForType = (type) => {
      const suppliedRow = { key: `s-${type}`, Type: type };
      const installedRow = { key: `i-${type}`, Type: type };

      doorTypes.forEach((door) => {
        thicknessOptions.forEach((thickness) => {
          const key = `${door}-${thickness}`;
          const suppliedCount =
            selectedTask.Supplied_Doors?.find(
              (d) =>
                d.Type === type &&
                d.Door_Type === door &&
                d.Door_Type_MM === thickness
            )?.total_count || 0;
          const installedCount = selectedTask.Installed_Doors?.filter(
            (d) =>
              d.Type === type &&
              d.Door_Type === door &&
              d.Door_Type_MM === thickness
          ).reduce((acc, d) => acc + d.total_count, 0);

          suppliedRow[key] = {
            supplied: suppliedCount,
            installed: installedCount,
          };
          installedRow[key] = installedCount;
        });
      });

      return { suppliedRow, installedRow };
    };

    const suppliedData = [];
    const installedData = [];
    Types.forEach((type) => {
      const { suppliedRow, installedRow } = getCountsForType(type);
      suppliedData.push(suppliedRow);
      installedData.push(installedRow);
    });

    return { supplied: suppliedData, installed: installedData };
  }, [selectedTask]);

  // Supplied Matrix Columns
  const suppliedMatrixColumns = [
    {
      title: "Type",
      dataIndex: "Type",
      key: "Type",
      fixed: "left",
      width: 100,
    },
    ...doorTypes.map((door) => ({
      title: door,
      onHeaderCell: () => ({
        style: {
          backgroundColor: doorColors[door] || "#fafafa",
          fontWeight: "bold",
        },
      }),
      children: thicknessOptions.map((thickness) => ({
        title: thickness,
        dataIndex: `${door}-${thickness}`,
        key: `${door}-${thickness}`,
        align: "center",
        width: 100,
        render: (data) => {
          const { supplied, installed } = data || { supplied: 0, installed: 0 };
          const pending = Math.max(0, supplied - installed);
          return (
            <Tooltip title={`Supplied: ${supplied}, Installed: ${installed}`}>
              <span style={{ color: pending > 0 ? "red" : "green" }}>
                {pending}
              </span>
            </Tooltip>
          );
        },
      })),
    })),
  ];

  // Installed Matrix Columns
  const installedMatrixColumns = [
    {
      title: "Type",
      dataIndex: "Type",
      key: "Type",
      fixed: "left",
      width: 100,
    },
    ...doorTypes.map((door) => ({
      title: door,
      onHeaderCell: () => ({
        style: {
          backgroundColor: doorColors[door] || "#fafafa",
          fontWeight: "bold",
        },
      }),
      children: thicknessOptions.map((thickness) => ({
        title: thickness,
        dataIndex: `${door}-${thickness}`,
        key: `${door}-${thickness}`,
        align: "center",
        width: 100,
        render: (count, row) => {
          const units = (selectedTask?.Installed_Doors || [])
            .filter(
              (d) =>
                d.Type === row.Type &&
                d.Door_Type === door &&
                d.Door_Type_MM === thickness
            )
            .map((d) => `${d.Floors} - ${d.Units} (Set ${d.Set_No})`)
            .join(", ");
          return (
            <Tooltip title={units || "No units"}>
              <span style={{ color: count > 0 ? "#1890ff" : "inherit" }}>
                {count}
              </span>
            </Tooltip>
          );
        },
      })),
    })),
  ];

  const columns = [
    { title: "Task Name", dataIndex: "Task_Name", key: "Task_Name" },
    { title: "Project ID", dataIndex: "Project_ID", key: "Project_ID" },
    { title: "Tower", dataIndex: "Towers", key: "Towers" },
    { title: "Assigned To", dataIndex: "Assigned_To", key: "Assigned_To" },
    { title: "Assigned By", dataIndex: "Assigned_By", key: "Assigned_By" },
    {
      title: "Priority",
      dataIndex: "Priority",
      key: "Priority",
      render: (priority) => {
        let color =
          priority === "High"
            ? "red"
            : priority === "Medium"
            ? "orange"
            : "green";
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      render: (status) => {
        let color = status === "Completed" ? "green" : "yellow";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: "Due Date", dataIndex: "Due_Date", key: "Due_Date" },
    { title: "Created At", dataIndex: "Created_At", key: "Created_At" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          />
          <Button
            type="primary"
            size="small"
            onClick={() => handleMarkComplete(record)}
            icon={<CheckCircleOutlined />}
            disabled={record.Status === "Completed"}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Tasks
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTask}>
          Add Task
        </Button>
      </div>

      <Card size="small">
        <Table
          columns={columns}
          dataSource={tasks}
          loading={loading}
          rowKey={(record) => record.Task_ID || record.key}
          size="small"
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add Task Modal */}
      <Modal
        title="Add Task"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText="Submit"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter task title" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Assign To"
            name="assignee"
            rules={[{ required: true, message: "Please select assignee" }]}
          >
            <Select placeholder="Select user">
              {users?.map((u) => (
                <Option key={u.emp_id} value={u.emp_id}>
                  {u.name} ({u.designation})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Project & Tower"
            name="projectTower"
            rules={[{ required: true, message: "Please select project tower" }]}
          >
            <Select placeholder="Select Project Tower">
              {projects.map((proj) =>
                proj.Towers.map((tower) => (
                  <Option
                    key={`${proj.Project_ID}|${tower.Towers}|${tower.Floor_Count}`}
                    value={`${proj.Project_ID}|${tower.Towers}|${tower.Floor_Count}`}
                    disabled={tower.Assign_Tower_Status === "Completed"}
                  >
                    {proj.Project_Name} - {tower.Towers} (Floors:{" "}
                    {tower.Floor_Count}, {tower.Assign_Tower_Status})
                  </Option>
                ))
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true, message: "Please select priority" }]}
          >
            <Select>
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Due Date"
            name="dueDate"
            rules={[{ required: true, message: "Please select due date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title={`Task Details: ${selectedTask?.Task_Name}`}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        width="90%"
        style={{ top: 20 }}
        centered
        footer={
          <Button onClick={() => setViewModalVisible(false)}>Close</Button>
        }
      >
        <Card
          size="small"
          title={
            <span>
              <ShoppingCartOutlined style={{ marginRight: 8 }} />
              Pending Installation
            </span>
          }
        >
          <Table
            rowKey="key"
            columns={suppliedMatrixColumns}
            dataSource={matrixData.supplied}
            bordered
            pagination={false}
            scroll={{ x: "max-content" }}
            size="small"
          />
        </Card>
        <Divider />
        <Card
          size="small"
          title={
            <span>
              <CheckCircleOutlined style={{ marginRight: 8 }} />
              Installed
            </span>
          }
        >
          <Table
            rowKey="key"
            columns={installedMatrixColumns}
            dataSource={matrixData.installed}
            bordered
            pagination={false}
            scroll={{ x: "max-content" }}
            size="small"
          />
        </Card>
      </Modal>
    </>
  );
};

export default Tasks;
