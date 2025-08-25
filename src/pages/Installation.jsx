import React, { useEffect, useState, useMemo } from "react";
import { API_ENDPOINTS } from "../utils/config";
import { message, Table, Tag, Button, Modal, Card, Divider, Tooltip } from "antd";
import { CheckCircleOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import axios from "axios";
import InstallationModal from "./InstallationModal";

// API_ENDPOINTS.TASKS_DETAILS
const Installation = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [installModalVisible, setInstallModalVisible] = useState(false);
  const [selectedDoorsTask, setSelectedDoorsTask] = useState(null);
  const [prefillData, setPrefillData] = useState(null);

  // Constants
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

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
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

  // Show the doors matrix modal
  const handleViewDoors = (record) => {
    setSelectedDoorsTask(record);
    setModalVisible(true);
  };

  const getUnitStatus = (doorType, thickness, type) => {
    if (!selectedDoorsTask) return [];

    const unitsList = [];

    selectedDoorsTask.Floors_Info.forEach((floorInfo) => {
      floorInfo.units.forEach((unitGroup) => {
        unitGroup.units.forEach((unit) => {
          // Count installed for this unit
          const installed = selectedDoorsTask.Installed_Doors.filter(
            (d) =>
              d.Door_Type === doorType &&
              d.Door_Type_MM === thickness &&
              d.Type === type &&
              d.Units === unit
          );

          const installedCount = installed.reduce((acc, d) => acc + d.total_count, 0);

          unitsList.push({
            floor: floorInfo.floor,
            unit,
            installedCount,
            components: installed.map((d) => d.Type),
          });
        });
      });
    });

    return unitsList;
  };


  // Handle click on a count in the matrix to open the installation modal
  const handleCountClick = (doorType, thickness, type) => {
    if (!selectedDoorsTask) return;

    const unitsStatus = getUnitStatus(doorType, thickness, type);

    // Filter units where we can still install
    const availableUnits = unitsStatus.filter((u) => {
      let maxAllowed = 1; // Default for Main Door
      if (doorType.includes("Bedroom Door") || doorType.includes("Home Office")) {
        maxAllowed = 3;
      }

      return u.installedCount < maxAllowed;
    });

    if (availableUnits.length === 0) {
      message.warning(`All units for ${doorType} are already installed.`);
      return;
    }

    setPrefillData({
      doorType,
      thickness,
      types: [type],
      unitsStatus: availableUnits, // pass to modal to show list
    });
    setInstallModalVisible(true);
  };

  // Handle submission of the installation form
  const handleInstallSubmit = async (installationData) => {
    try {
      const res = await axios.post(
        API_ENDPOINTS.TASKS_DETAILS,
        installationData,
        { headers: { "Content-Type": "application/json" } }
      );

      message.success("Installation submitted successfully!");
      setInstallModalVisible(false);
      setModalVisible(false);
      fetchTasks(); // Refresh data
    } catch (error) {
      console.error(error);
      message.error("Error submitting installation.");
    }
  };

  // Task list columns definition
  const taskColumns = [
    { title: "Task ID", dataIndex: "Task_ID", key: "Task_ID" },
    { title: "Project", dataIndex: "Project_ID", key: "Project_ID" },
    { title: "Tower", dataIndex: "Towers", key: "Towers" },
    { title: "Due Date", dataIndex: "Due_Date", key: "Due_Date" },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      render: (status) => <Tag color="blue">{status || "Pending"}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewDoors(record)}>
          View Doors
        </Button>
      ),
    },
  ];

  // Memoized calculation for the data displayed in the supplied/installed matrix
  const matrixData = useMemo(() => {
    if (!selectedDoorsTask) return { supplied: [], installed: [] };

    const getCountsForType = (type) => {
      const suppliedRow = { key: `s-${type}`, Type: type };
      const installedRow = { key: `i-${type}`, Type: type };

      doorTypes.forEach((door) => {
        thicknessOptions.forEach((thickness) => {
          const key = `${door}-${thickness}`;
          const suppliedCount =
            selectedDoorsTask.Supplied_Doors?.find(
              (d) =>
                d.Type === type &&
                d.Door_Type === door &&
                d.Door_Type_MM === thickness
            )?.total_count || 0;
          const installedCount = selectedDoorsTask.Installed_Doors.filter(
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
  }, [selectedDoorsTask, Types, doorTypes, thicknessOptions]);

  // Columns for the "Supplied" matrix
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
        onHeaderCell: () => ({
          style: { backgroundColor: doorColors[door] || "#fafafa" },
        }),
        render: (data, row) => {
          const { supplied, installed } = data || { supplied: 0, installed: 0 };
          const pending = Math.max(0, supplied - installed);
          return (
            <Tooltip title={`Supplied: ${supplied}, Installed: ${installed}`}>
              <Button
                type="link"
                disabled={pending <= 0}
                onClick={() => handleCountClick(door, thickness, row.Type)}
              >
                {pending}
              </Button>
            </Tooltip>
          );
        },
      })),
    })),
  ];

  // Columns for the "Installed" matrix
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
        onHeaderCell: () => ({
          style: { backgroundColor: doorColors[door] || "#fafafa" },
        }),
        render: (count, row) => {
          const units = (selectedDoorsTask?.Installed_Doors || [])
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

  return (
    <div>
      <h2>Installation Tasks</h2>
      <Table
        rowKey="Task_ID"
        columns={taskColumns}
        dataSource={tasks}
        loading={loading}
        bordered
        size="small"
      />

      <Modal
        title={`Doors for Task: ${selectedDoorsTask?.Task_ID}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={1000}
        centered
        footer={<Button onClick={() => setModalVisible(false)}>Close</Button>}
      >
        <Card
          size="small"
          title={
            <span>
              <ShoppingCartOutlined style={{ marginRight: 8 }} />
              Pending Installation (Click count to install)
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

      {installModalVisible && selectedDoorsTask && (
        <InstallationModal
          user={user || { user_id: "EMP001" }}
          visible={installModalVisible}
          onCancel={() => setInstallModalVisible(false)}
          floorsInfo={selectedDoorsTask.Floors_Info}
          types={Types}
          doorTypes={doorTypes}
          thicknessOptions={thicknessOptions}
          projectDetails={selectedDoorsTask}
          prefillData={prefillData}
          onSubmit={handleInstallSubmit}
        />
      )}
    </div>
  );
};

export default Installation;
