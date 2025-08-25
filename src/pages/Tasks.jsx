import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Avatar,
  Tag,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Divider,
  Collapse,
  Tooltip,
  Progress
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { API_ENDPOINTS } from "../utils/config";

const { Title, Text } = Typography;
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
      const [towerName, floors] = values.tower.split("|");

      const payload = {
        Project_ID: values.projectId,
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

  const unitWiseInstalledData = useMemo(() => {
    if (!selectedTask?.Installed_Doors) return [];

    const groupedData = new Map();

    selectedTask.Installed_Doors.forEach(item => {
      // Create a unique key for each unit + door type combination
      const key = `${item.Floors}-${item.Units}-${item.Door_Type}-${item.Door_Type_MM}`;

      if (!groupedData.has(key)) {
        groupedData.set(key, {
          key: key,
          Floors: item.Floors,
          Units: item.Units,
          Door_Type: item.Door_Type,
          Door_Type_MM: item.Door_Type_MM,
          Frames: 0,
          Shutters: 0,
          Hardwares: 0,
        });
      }

      const entry = groupedData.get(key);
      // Add the count to the correct component type column
      if (entry.hasOwnProperty(item.Type)) {
        entry[item.Type] += item.total_count;
      }
    });

    return Array.from(groupedData.values());
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

  const unitWiseInstalledColumns = [
    { title: 'Floor', dataIndex: 'Floors', key: 'Floors', sorter: (a, b) => parseInt(a.Floors) - parseInt(b.Floors), defaultSortOrder: 'ascend' },
    { title: 'Unit', dataIndex: 'Units', key: 'Units', sorter: (a, b) => a.Units.localeCompare(b.Units) },
    { title: 'Door Type', dataIndex: 'Door_Type', key: 'Door_Type' },
    { title: 'Thickness', dataIndex: 'Door_Type_MM', key: 'Door_Type_MM', align: 'center' },
    { title: 'Frames', dataIndex: 'Frames', key: 'Frames', align: 'center', render: (count) => count > 0 ? <Tag color="blue">{count}</Tag> : 0 },
    { title: 'Shutters', dataIndex: 'Shutters', key: 'Shutters', align: 'center', render: (count) => count > 0 ? <Tag color="cyan">{count}</Tag> : 0 },
    { title: 'Hardwares', dataIndex: 'Hardwares', key: 'Hardwares', align: 'center', render: (count) => count > 0 ? <Tag color="purple">{count}</Tag> : 0 },
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
    {
      title: "Task",
      dataIndex: "Task_Name",
      key: "Task_Name",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary">ID: {record.Task_ID}</Text>
        </div>
      )
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) => `${record.Project_ID} / ${record.Towers}`
    },
    {
      title: "Progress",
      dataIndex: "Tower_Task_Percentage",
      key: "progress",
      align: 'center',
      render: (percent) => <Progress percent={percent} />
    },
    {
      title: "Assigned To",
      dataIndex: "Assigned_To",
      key: "Assigned_To",
      render: (empId) => {
        const name = users.filter(u => u.emp_id === empId)[0]?.name || empId;
        return (
          <Space>
            <Avatar size={'small'} style={{ backgroundColor: '#1890ff' }}>{name.charAt(0).toUpperCase()}</Avatar>
            <span>{name}</span>
          </Space>
        );
      }
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      align: 'center',
      render: (status) => {
        const color = status === "Completed" ? "green" : status === "In Progress" ? "blue" : "yellow";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Due Date",
      dataIndex: "Due_Date",
      key: "Due_Date",
      render: (date, record) => {
        const isOverdue = dayjs(date).isBefore(dayjs(), 'day') && record.Status !== 'Completed';
        return (
          <Text style={{ color: isOverdue ? 'red' : 'inherit', fontWeight: isOverdue ? 'bold' : 'normal' }}>
            {dayjs(date).format("MMM DD, YYYY")}
          </Text>
        );
      }
    },
    {
      title: "Actions",
      key: "actions",
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Tooltip title="Mark as Complete">
            <Button type="primary" size="small" onClick={() => handleMarkComplete(record)} icon={<CheckCircleOutlined />} disabled={record.Status === "Completed"} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const collapseItems = [
    {
      key: '1',
      label: (
        <span>
          <ShoppingCartOutlined style={{ marginRight: 8 }} />
          Pending Installation
        </span>
      ),
      children: (
        <Table
          rowKey="key"
          columns={suppliedMatrixColumns}
          dataSource={matrixData.supplied}
          bordered
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="small"
        />
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <CheckCircleOutlined style={{ marginRight: 8 }} />
          Installed
        </span>
      ),
      children: (
        <Table
          rowKey="key"
          columns={installedMatrixColumns}
          dataSource={matrixData.installed}
          bordered
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="small"
        />
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <CheckCircleOutlined style={{ marginRight: 8 }} />
          Unit-wise Installation Details
        </span>
      ),
      children: (
        <Table
          columns={unitWiseInstalledColumns}
          dataSource={unitWiseInstalledData}
          pagination={false}
          bordered
          size="small"
          scroll={{ x: 'max-content', y: 400 }}
        />
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
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Add Task Modal */}
      <Modal
        title="Add Task"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText="Submit"
        centered
      >
        <Form form={form} layout="vertical"
          initialValues={{
            priority: "Medium",
            dueDate: dayjs().add(10, "days")
          }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter task title" }]}
          >
            <Input placeholder="Enter task title" />
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

          {/* Project Selection */}
          <Form.Item
            label="Project"
            name="projectId"
            rules={[{ required: true, message: "Please select project" }]}
          >
            <Select
              placeholder="Select Project"
              onChange={() => form.setFieldsValue({ tower: undefined })}
            >
              {projects.map((proj) => (
                <Option key={proj.Project_ID} value={proj.Project_ID}>
                  {proj.Project_Name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Tower Selection (depends on Project) */}
          <Form.Item shouldUpdate={(prev, curr) => prev.projectId !== curr.projectId}>
            {({ getFieldValue }) => {
              const selectedProject = projects.find(
                (proj) => proj.Project_ID === getFieldValue("projectId")
              );

              return (
                <Form.Item
                  label="Tower"
                  name="tower"
                  rules={[{ required: true, message: "Please select tower" }]}
                >
                  <Select
                    placeholder="Select Tower"
                    disabled={!selectedProject}
                  >
                    {selectedProject?.Towers.map((tower) => (
                      <Option
                        key={tower.Towers}
                        value={`${tower.Towers}|${tower.Floor_Count}`}
                        disabled={tower.Assign_Tower_Status === "Completed"}
                      >
                        {tower.Towers} (Floors: {tower.Floor_Count}, {tower.Assign_Tower_Status})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              );
            }}
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
        footer={<Button onClick={() => setViewModalVisible(false)}>Close</Button>}
      >
        <Collapse accordion items={collapseItems} />
      </Modal>
    </>
  );
};

export default Tasks;
