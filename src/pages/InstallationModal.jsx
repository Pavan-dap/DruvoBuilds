import React, { useState, useEffect } from 'react';
import { Modal, Button, Select, InputNumber, Upload, Row, Col, Checkbox, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;

const InstallationModal = ({
    user,
    visible,
    onCancel,
    floorsInfo,
    doorTypes,
    thicknessOptions,
    types,
    onSubmit,
    projectDetails,
    prefillData
}) => {
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [unitData, setUnitData] = useState(prefillData || {});

    useEffect(() => {
        if (prefillData) {
            setUnitData(prefillData);
            // setSelectedUnits(Object.keys(prefillData)); // Select all units automatically
        }
    }, [prefillData]);

    // Flatten units
    const unitOptions = floorsInfo?.flatMap(floor =>
        floor.units.flatMap(u =>
            u.units.map(unit => ({
                label: `${unit} (${u.unit_type}, ${floor.floor})`,
                value: unit,
                unitType: u.unit_type,
                floor: floor.floor
            }))
        )
    ) || [];

    const handleUnitSelect = (units) => {
        setSelectedUnits(units);
        const newUnitData = { ...unitData };
        units.forEach(u => {
            // Apply prefill only when a unit does not already have data
            if (!newUnitData[u]) {
                newUnitData[u] = prefillData ? { ...prefillData } : { types: [], doorType: null, thickness: null, count: 1, file: null };
            }
        });
        Object.keys(newUnitData).forEach(key => {
            if (!units.includes(key)) delete newUnitData[key];
        });
        setUnitData(newUnitData);
    };

    const handleChange = (unit, field, value) => {
        setUnitData(prev => ({ ...prev, [unit]: { ...prev[unit], [field]: value } }));
    };


    const handleSubmit = () => {
        const result = [];
        let hasError = false;
        selectedUnits.forEach(unit => {
            const data = unitData[unit];
            if (!data.doorType || !data.thickness || data.types.length === 0) {
                message.warning(`Please select door type, thickness, and types for unit ${unit}`);
                hasError = true;
                return;
            }
            data.types.forEach(t => {
                result.push({
                    Assigned_To: user.user_id,
                    Project_ID: projectDetails.Project_ID,
                    Towers: projectDetails.Towers,
                    Units: unit,
                    Task_ID: projectDetails.Task_ID,
                    unit_type: unitOptions.find(u => u.value === unit)?.unitType,
                    Floors: unitOptions.find(u => u.value === unit)?.floor,
                    Type: t,
                    Door_Type: data.doorType,
                    Door_Type_MM: data.thickness,
                    Count: data.count,
                    Attachment: data.file
                });
            });
        });
        if (hasError) return;
        onSubmit(result);
        onCancel();
        setSelectedUnits([]);
        setUnitData({});
    };

    return (
        <Modal
            title="Add Installation"
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Submit"
            width={1000}
            centered
        >
            <Row gutter={16}>
                {/* Left: Unit Selection */}
                <Col xs={24} md={6} style={{ maxHeight: 400, overflowY: 'auto' }}>
                    <Checkbox.Group
                        style={{ width: '100%' }}
                        value={selectedUnits}
                        onChange={handleUnitSelect}
                    >
                        {unitOptions.map(u => (
                            <div
                                key={u.value}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '1px solid #f0f0f0',
                                    padding: 8,
                                    borderRadius: 4,
                                    marginBottom: 8,
                                    backgroundColor: selectedUnits.includes(u.value) ? '#fafafa' : 'transparent'
                                }}
                            >
                                <Checkbox value={u.value}>
                                    <strong>{u.label}</strong>
                                </Checkbox>
                            </div>
                        ))}
                    </Checkbox.Group>
                </Col>

                {/* Right: Inputs for selected units */}
                <Col xs={24} md={18} style={{ maxHeight: 400, overflowY: 'auto', whiteSpace: 'normal' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {selectedUnits.map(unit => (
                            <div
                                key={unit}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #f0f0f0',
                                    padding: 8,
                                    borderRadius: 4,
                                    gap: '12px'
                                }}
                            >
                                <div style={{ minWidth: 80 }}>
                                    <strong>{unit} - {unitOptions.find(u => u.value === unit)?.unitType}</strong>
                                </div>
                                <div style={{ minWidth: 150 }}>
                                    <Select
                                        placeholder="Select Door Type"
                                        value={unitData[unit]?.doorType}
                                        onChange={val => handleChange(unit, 'doorType', val)}
                                        style={{ width: '100%' }}
                                    >
                                        {doorTypes.map(dt => <Option key={dt} value={dt}>{dt}</Option>)}
                                    </Select>
                                </div>
                                <div style={{ minWidth: 120 }}>
                                    <Select
                                        placeholder="Select Thickness"
                                        value={unitData[unit]?.thickness}
                                        onChange={val => handleChange(unit, 'thickness', val)}
                                        style={{ width: '100%' }}
                                    >
                                        {thicknessOptions.map(th => <Option key={th} value={th}>{th}</Option>)}
                                    </Select>
                                </div>
                                <div style={{ minWidth: 150 }}>
                                    <Select
                                        mode="multiple"
                                        placeholder="Select Types"
                                        value={unitData[unit]?.types}
                                        onChange={val => handleChange(unit, 'types', val)}
                                        style={{ width: '100%' }}
                                    >
                                        {types.map(t => <Option key={t} value={t}>{t}</Option>)}
                                    </Select>
                                </div>
                                <div style={{ minWidth: 80 }}>
                                    <InputNumber
                                        min={1}
                                        value={unitData[unit]?.count}
                                        onChange={val => handleChange(unit, 'count', val)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ minWidth: 120 }}>
                                    <Upload
                                        beforeUpload={file => { handleChange(unit, 'file', file); return false; }}
                                        fileList={unitData[unit]?.file ? [unitData[unit].file] : []}
                                        accept="image/*"
                                        capture="environment"
                                    >
                                        <Button icon={<UploadOutlined />}>Capture / Upload</Button>
                                    </Upload>
                                </div>
                            </div>
                        ))}
                    </div>
                </Col>
            </Row>
        </Modal>
    );
};

export default InstallationModal;
