import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../utils/config';
import { message, Table, Tag, Button, Modal, Card, Divider, Tooltip } from 'antd';
import { CheckCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import axios from 'axios';
import InstallationModal from './InstallationModal';

// API_ENDPOINTS.TASKS_DETAILS
const Installation = ({ user }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [currentFloorsInfo, setCurrentFloorsInfo] = useState(null);
    const [installModalVisible, setInstallModalVisible] = useState(false);
    const [currentTaskInfo, setCurrentTaskInfo] = useState(null);
    const [unitData, setUnitData] = useState({});
    const [selectedDoorsTask, setSelectedDoorsTask] = useState(null);

    const doorTypes = ["Main Door(1050*2100mm)", "Bedroom Door(900*2100mm)", "Home Office(900*2100mm)"];
    const doorColors = {
        "Main Door(1050*2100mm)": "#e6f7ff",
        "Bedroom Door(900*2100mm)": "#fff7e6",
        "Home Office(900*2100mm)": "#f9f0ff",
    };
    const thicknessOptions = ["250mm", "200mm", "160mm", "100mm"];
    const Types = ["Frames", "Shutters", "Hardwares"];

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
            message.error('Error fetching tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDoors = (record) => {
        setCurrentFloorsInfo(record.Floors_Info || []);
        setSelectedDoorsTask(record);
        setModalVisible(true);
    };

    const handleCountClick = (type, doorType, thickness, count) => {
        if (!selectedDoorsTask || !currentFloorsInfo) return;

        const projectInfo = {
            Project_ID: selectedDoorsTask.Project_ID,
            Towers: selectedDoorsTask.Towers,
            Task_ID: selectedDoorsTask.Task_ID,
        };

        // Build prefill data template
        const prefillTemplate = {
            types: [type],
            doorType,
            thickness,
            file: null
        };

        setCurrentTaskInfo(projectInfo);
        setUnitData(prefillTemplate); // This will be merged when a unit is selected
        setInstallModalVisible(true);
    };

    const handleInstallSubmit = async (installationData) => {
        try {
            // console.log("Installation Data to submit:", installationData);

            // Post to backend
            const res = await axios.post(API_ENDPOINTS.TASKS_DETAILS, installationData, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (res.status === 200 || res.status === 201) {
                message.success("Installation submitted successfully!");
                setInstallModalVisible(false);
                fetchTasks();
            } else {
                message.error("Failed to submit installation. Please try again.");
            }
        } catch (error) {
            console.error(error);
            message.error("Error submitting installation. Check console for details.");
        }
    };

    const taskColumns = [
        { title: 'Task ID', dataIndex: 'Task_ID', key: 'Task_ID' },
        { title: 'Task Name', dataIndex: 'Task_Name', key: 'Task_Name' },
        { title: 'Project', dataIndex: 'Project_ID', key: 'Project_ID' },
        { title: 'Tower', dataIndex: 'Towers', key: 'Towers' },
        {
            title: 'Priority',
            dataIndex: 'Priority',
            key: 'Priority',
            render: (priority) => {
                let color = priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green';
                return <Tag color={color}>{priority}</Tag>;
            },
        },
        { title: 'Due Date', dataIndex: 'Due_Date', key: 'Due_Date' },
        {
            title: 'Status',
            dataIndex: 'Status',
            key: 'Status',
            render: (status) =>
                status ? <Tag color="blue">{status}</Tag> : <Tag color="default">Pending</Tag>,
        },
        {
            title: 'Supplied Doors',
            key: 'supplied_doors',
            render: (_, record) => (
                <Button type="link" onClick={() => handleViewDoors(record)}>View</Button>
            ),
        },
    ];

    const matrixColumns = [
        { title: 'Type', dataIndex: 'Type', key: 'Type', fixed: 'left' },
        ...doorTypes.map((door) => ({
            title: door,
            children: thicknessOptions.map((thickness) => ({
                title: thickness,
                dataIndex: `${door}-${thickness}`,
                key: `${door}-${thickness}`,
                align: "center",
                render: (count, row) => (
                    <Button
                        type="link"
                        onClick={() => handleCountClick(row.Type, door, thickness, count)}
                    >
                        {count}
                    </Button>
                ),
                onHeaderCell: () => ({ style: { backgroundColor: doorColors[door] || "#fafafa" } }),
            })),
            onHeaderCell: () => ({ style: { backgroundColor: doorColors[door] || "#fafafa", fontWeight: "bold" } }),
        })),
    ];

    const matrixData = Types.map(type => {
        const row = { key: type, Type: type };
        doorTypes.forEach(door => {
            thicknessOptions.forEach(thickness => {
                row[`${door}-${thickness}`] = (selectedDoorsTask?.Supplied_Doors || []).find(
                    d => d.Type === type && d.Door_Type === door && d.Door_Type_MM === thickness
                )?.total_count || 0;
            });
        });
        return row;
    });

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

            {/* Supplied Doors Matrix Modal */}
            <Modal
                title="Doors"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                width={1200}
                centered
                footer={
                    <Button onClick={() => setModalVisible(false)}>
                        Cancel
                    </Button>
                }
            >
                <Card size="small"
                    title={
                        <span>
                            <ShoppingCartOutlined style={{ marginRight: 8 }} />
                            Supplied
                        </span>
                    }
                    styles={{
                        title: { color: 'white', backgroundColor: '#04cef6ff' }
                    }}
                >
                    <Table
                        rowKey="key"
                        columns={matrixColumns}
                        dataSource={matrixData}
                        bordered
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        size="small"
                    />
                </Card>
                <Divider />
                <Card size="small"
                    title={
                        <span>
                            <CheckCircleOutlined style={{ marginRight: 8 }} />
                            Supplied
                        </span>
                    }
                >
                    <Table
                        rowKey="key"
                        columns={[
                            { title: 'Type', dataIndex: 'Type', key: 'Type', fixed: 'left' },
                            ...doorTypes.map((door) => ({
                                title: door,
                                children: thicknessOptions.map((thickness) => ({
                                    title: thickness,
                                    dataIndex: `${door}-${thickness}`,
                                    key: `${door}-${thickness}`,
                                    align: "center",
                                    render: (count, row) => {
                                        const units = (selectedDoorsTask?.Installed_Doors || []).filter(
                                            d => d.Type === row.Type && d.Door_Type === door && d.Door_Type_MM === thickness
                                        ).map(d => `${d.Floors} - ${d.Units}`).join(", ");

                                        return (
                                            <Tooltip title={units || "No units"}>
                                                <span>{count}</span>
                                            </Tooltip>
                                        );
                                    },
                                    onHeaderCell: () => ({ style: { backgroundColor: doorColors[door] || "#fafafa" } }),
                                })),
                                onHeaderCell: () => ({ style: { backgroundColor: doorColors[door] || "#fafafa", fontWeight: "bold" } }),
                            })),
                        ]}
                        dataSource={Types.map(type => {
                            const row = { key: type, Type: type };
                            doorTypes.forEach(door => {
                                thicknessOptions.forEach(thickness => {
                                    row[`${door}-${thickness}`] = (selectedDoorsTask?.Installed_Doors || []).filter(
                                        d => d.Type === type && d.Door_Type === door && d.Door_Type_MM === thickness
                                    ).reduce((acc, d) => acc + d.total_count, 0);
                                });
                            });
                            return row;
                        })}
                        bordered
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        size="small"
                    />
                </Card>
            </Modal>

            {/* Installation Modal */}
            {installModalVisible && currentFloorsInfo && (
                <InstallationModal
                    user={user}
                    visible={installModalVisible}
                    onCancel={() => setInstallModalVisible(false)}
                    floorsInfo={currentFloorsInfo}
                    types={Types}
                    doorTypes={doorTypes}
                    thicknessOptions={thicknessOptions}
                    projectDetails={currentTaskInfo}
                    prefillData={unitData}
                    onSubmit={handleInstallSubmit}
                />
            )}
        </div>
    );
};

export default Installation;
