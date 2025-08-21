import React, { useEffect, useState } from "react";
import { Card, Spin, message, Row, Col, Tag, Modal, Table, Tooltip, InputNumber, Button } from "antd";
import { API_ENDPOINTS } from "../utils/config";
import {
    UserOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    ExportOutlined,
} from "@ant-design/icons";
import axios from "axios";

const Supply = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [supplyDetails, setSupplyDetails] = useState(null);
    console.log('supplyDetails', supplyDetails)
    const [modalLoading, setModalLoading] = useState(false);

    const [entryModalVisible, setEntryModalVisible] = useState(false);
    const [currentTower, setCurrentTower] = useState(null);
    const [entryMatrix, setEntryMatrix] = useState({});

    const doorTypes = [
        "Main Door(1050*2100mm)",
        "Bedroom Door(900*2100mm)",
        "Home Office(900*2100mm)",
    ];
    const thicknessOptions = ["250mm", "200mm", "160mm", "100mm"];

    useEffect(() => {
        fetchSupplyData();
    }, []);

    const fetchSupplyData = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_ENDPOINTS.PROJECT_SUPPLY);
            if (!res.ok) throw new Error("Failed to fetch supply data");
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error(error);
            message.error("Error fetching supply data");
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectDetails = async (projectId) => {
        try {
            setModalLoading(true);
            const res = await fetch(
                `${API_ENDPOINTS.PROJECT_SUPPLY}?Project_ID=${projectId}`
            );
            if (!res.ok) throw new Error("Failed to fetch project details");
            const result = await res.json();
            setSupplyDetails(result);
            setModalVisible(true);
        } catch (error) {
            console.error(error);
            message.error("Error fetching project details");
        } finally {
            setModalLoading(false);
        }
    };

    const openEntryModal = (tower) => {
        // Initialize matrix for input
        const matrix = {};
        doorTypes.forEach(dt => {
            matrix[dt] = {};
            thicknessOptions.forEach(th => {
                matrix[dt][th] = 0; // default value
            });
        });
        setEntryMatrix(matrix);
        setCurrentTower(tower);
        setEntryModalVisible(true);
    };

    const handleEntryChange = (doorType, thickness, value) => {
        setEntryMatrix(prev => ({
            ...prev,
            [doorType]: {
                ...prev[doorType],
                [thickness]: value
            }
        }));
    };

    const handleSubmitEntry = async () => {
        const postData = Object.keys(entryMatrix).map(doorType => ({
            Project_ID: supplyDetails?.Doors?.Project_ID,
            Towers: currentTower.Towers,
            Door_Type: doorType,
            Door_Details: Object.keys(entryMatrix[doorType]).map(thickness => ({
                Door_Type_MM: thickness,
                Count: entryMatrix[doorType][thickness] || 0
            }))
        }));

        try {
            await axios.post(API_ENDPOINTS.PROJECT_SUPPLY, postData);
            message.success("Supply of doors is done");

            // Close entry modal
            setEntryModalVisible(false);

            // Re-fetch project details to update table
            await fetchProjectDetails(supplyDetails?.Doors?.Project_ID);
        } catch (error) {
            console.error("Error posting supply:", error);
            message.error("Failed to submit supply data");
        }
    };

    const getTotalSupplied = (details) => {
        return details.reduce((sum, d) => {
            if (Array.isArray(d.Doors?.Supplied)) {
                return sum + d.Doors.Supplied.reduce((s, x) => s + Number(x.Count || 0), 0);
            } else if (d.Doors?.Supplied || d.Doors?.Supplied === 0) {
                // If backend returned a number instead of array
                return sum + Number(d.Doors?.Supplied || 0);
            }
            return sum;
        }, 0);
    };

    const isTowerFulfilled = (tower) => {
        for (let dt of doorTypes) {
            const dtDetails = tower.Door_Types.find(d => d.Door_Type === dt);
            if (!dtDetails) continue;

            for (let th of thicknessOptions) {
                const details = dtDetails.Door_Details.filter(d => d.Door_Type_MM === th) || [];

                const required = details.reduce((sum, d) => sum + Number(d.Doors?.Required || 0), 0);
                const supplied = getTotalSupplied(details)

                if (required - supplied > 0) {
                    return false; // still pending supply
                }
            }
        }
        return true; // all fulfilled
    };

    const renderTowerTable = (tower) => {
        // Use predefined thicknesses and door types
        const allDoorTypes = doorTypes;
        const allThicknesses = thicknessOptions;

        const columns = [
            { title: "Door Type", dataIndex: "Door_Type", key: "Door_Type" },
            ...allThicknesses.map((th) => ({
                title: th,
                dataIndex: th,
                key: th,
                render: (text, record) => {
                    const [required, supplied] = text.split(" / ").map(Number);

                    // Find door type details
                    const dt = tower.Door_Types.find(d => d.Door_Type === record.Door_Type);
                    const details = dt?.Door_Details.filter(d => d.Door_Type_MM === th) || [];

                    // Collect date-wise breakdown for this door type & thickness
                    let breakdownData = [];
                    details.forEach(d => {
                        if (Array.isArray(d.Doors?.Supplied)) {
                            breakdownData.push(...d.Doors.Supplied.map(s => ({
                                Date: s.Date,
                                Supplied: s.Count,
                                key: s.Date + s.Count
                            })));
                        } else if (d.Doors?.Supplied || d.Doors?.Supplied === 0) {
                            breakdownData.push({
                                Date: "Unknown",
                                Supplied: d.Doors.Supplied,
                                key: "unknown" + d.Doors.Supplied
                            });
                        }
                    });

                    // Columns for tooltip table
                    const tooltipColumns = [
                        { title: "Date", dataIndex: "Date", key: "Date" },
                        { title: "Supplied", dataIndex: "Supplied", key: "Supplied" }
                    ];

                    return (
                        <span>
                            {(breakdownData.length > 0 && supplied) ? (
                                <Tooltip
                                    color="white"
                                    title={
                                        <Table
                                            columns={tooltipColumns}
                                            dataSource={breakdownData}
                                            pagination={false}
                                            size="small"
                                            bordered
                                        />
                                    }
                                >
                                    <span style={{ cursor: "pointer" }}>
                                        <span style={{ color: "blue" }}>{required}</span> /{" "}
                                        <span style={{ color: "green" }}>{supplied}</span>
                                    </span>
                                </Tooltip>
                            ) : (
                                <>
                                    <span style={{ color: "blue" }}>{required}</span> / {" "}
                                    <span span style={{ color: "green" }}>{supplied}</span>
                                </>
                            )
                            }
                        </span >
                    );
                },
            })),
        ];

        const dataSource = allDoorTypes.map((doorType) => {
            const dt = tower.Door_Types.find(d => d.Door_Type === doorType);
            const row = { Door_Type: doorType };

            allThicknesses.forEach((th) => {
                const details = dt?.Door_Details.filter(d => d.Door_Type_MM === th) || [];

                // Required count
                const required = details.reduce((sum, d) => sum + Number(d.Doors?.Required || 0), 0);

                // Supplied count for this door type only
                const supplied = getTotalSupplied(details)

                row[th] = `${required} / ${supplied}`;
            });

            return row;
        });

        return { columns, dataSource };
    };

    return (
        <div style={{ padding: "1px 16px" }}>
            <h2 style={{ marginBottom: 16 }}>📦 Project Supply</h2>
            {loading ? (
                <Spin fullscreen tip="Loading supply data..." />
            ) : (
                <Row gutter={[16, 16]}>
                    {data.map((item) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={item.Project_ID}>
                            <Card
                                title={item.Project_Name}
                                hoverable
                                size="small"
                                style={{ borderRadius: 8 }}
                                extra={
                                    <>
                                        <Tag color="green">{item.Project_ID}</Tag>
                                        <ExportOutlined
                                            style={{ cursor: "pointer", marginLeft: 8 }}
                                            onClick={() => fetchProjectDetails(item.Project_ID)}
                                        />
                                    </>
                                }
                            >
                                <p>
                                    <UserOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                                    {item.Customer_Name}
                                </p>
                                <Row style={{ gap: "20px" }}>
                                    <Col>
                                        <EnvironmentOutlined
                                            style={{ marginRight: 8, color: "#52c41a" }}
                                        />
                                        {item.Location}
                                    </Col>
                                    <Col>
                                        <PhoneOutlined
                                            style={{ marginRight: 8, color: "#faad14" }}
                                        />
                                        {item.Contact_No}
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Supply Details Modal */}
            <Modal
                title="🚪 Supply Details"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={1000}
                centered
            >
                {modalLoading ? (
                    <Spin fullscreen tip="Loading details..." />
                ) : supplyDetails?.Doors?.Towers && supplyDetails?.Doors?.Towers.length ? (
                    supplyDetails.Doors.Towers.map((tower, idx) => {
                        const { columns, dataSource } = renderTowerTable(tower);
                        return (
                            <div key={idx} style={{ marginBottom: 32 }}>
                                {/* <h3 style={{ marginBottom: 12 }}>🏢 Tower: {tower.Towers}</h3> */}
                                <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                                    <h3>🏢 Tower: {tower.Towers}</h3>
                                    <Button type="primary" onClick={() => openEntryModal(tower)} disabled={isTowerFulfilled(tower)}>
                                        Enter Supply
                                    </Button>
                                </Row>
                                <Table
                                    rowKey={(record, i) => i}
                                    columns={columns}
                                    dataSource={dataSource}
                                    pagination={false}
                                    size="small"
                                    bordered
                                />
                            </div>
                        );
                    })
                ) : (
                    <p>No details available</p>
                )}
            </Modal>

            <Modal
                title={`Enter Supply - ${currentTower?.Towers}`}
                open={entryModalVisible}
                onCancel={() => setEntryModalVisible(false)}
                width={800}
                centered
                footer={
                    <Button type="primary" onClick={handleSubmitEntry}>
                        Submit
                    </Button>
                }
            >
                <Table
                    dataSource={Object.keys(entryMatrix).map(doorType => ({
                        key: doorType,
                        Door_Type: doorType,
                        ...entryMatrix[doorType]
                    }))}
                    pagination={false}
                    bordered
                    size="small"
                >
                    <Table.Column title="Door Type" dataIndex="Door_Type" key="Door_Type" />
                    {thicknessOptions.map(th => (
                        <Table.Column
                            title={th}
                            key={th}
                            render={(text, record) => {
                                const dt = currentTower.Door_Types.find(d => d.Door_Type === record.Door_Type);
                                const details = dt?.Door_Details.filter(d => d.Door_Type_MM === th) || [];
                                const required = details.reduce((sum, d) => sum + Number(d.Doors?.Required || 0), 0);
                                const supplied = getTotalSupplied(details)

                                const remaining = required - supplied;

                                return (
                                    <>
                                        <InputNumber
                                            min={0}
                                            max={remaining}
                                            value={entryMatrix[record.Door_Type][th]}
                                            onChange={(val) => handleEntryChange(record.Door_Type, th, val)}
                                            style={{ width: "80px", marginRight: 8 }}
                                            readOnly={!remaining}
                                        />
                                        <span style={{ color: "#888" }}>Remaining: {remaining}</span>
                                    </>
                                );
                            }}
                        />
                    ))}
                </Table>
            </Modal>
        </div>
    );
};

export default Supply;
