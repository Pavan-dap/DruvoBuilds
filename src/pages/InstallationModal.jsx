import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Button,
  Select,
  InputNumber,
  Upload,
  Row,
  Col,
  Checkbox,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

const InstallationModal = ({
  user,
  visible,
  onCancel,
  floorsInfo,
  doorTypes,
  thicknessOptions,
  types, // ["Frames", "Shutters", "Hardwares"]
  onSubmit,
  projectDetails,
  prefillData,
}) => {
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [unitData, setUnitData] = useState({});

  // Effect to reset state when the modal is closed or prefill data changes
  useEffect(() => {
    if (visible) {
      // When modal opens, apply the prefill data (door type, thickness, and the specific part clicked)
      if (prefillData) {
        setUnitData(prefillData);
      }
    } else {
      // Clear state when modal closes
      setSelectedUnits([]);
      setUnitData({});
    }
  }, [visible, prefillData]);

  // Memoized calculation to flatten all available units from all floors
  const unitOptions = useMemo(() => {
    return (
      floorsInfo?.flatMap((floor) =>
        floor.units.flatMap((u) =>
          u.units.map((unit) => ({
            label: `${unit} (${u.unit_type}, ${floor.floor})`,
            value: unit,
            unitType: u.unit_type,
            floor: floor.floor,
          }))
        )
      ) || []
    );
  }, [floorsInfo]);

  // Memoized calculation to map each unit to its installed door counts and type
  const unitInstalledMap = useMemo(() => {
    const map = {};
    unitOptions.forEach((u) => {
      map[u.value] = {
        completeMain: 0,
        completeBedroom: 0,
        completeOffice: 0,
        startedBedroomSets: 0,
        startedOfficeSets: 0,
        unitType: u.unitType,
        details: { Main: new Set(), Bedroom: [], Office: [] },
      };
    });

    const checkCompleteSets = (sets) =>
      sets.filter((s) => s && types.every((t) => s.has(t))).length;

    (projectDetails?.Installed_Doors || []).forEach((d) => {
      const unitId = d.Units;
      if (!map[unitId]) return;

      const unitDetails = map[unitId].details;
      const setNo = d.Set_No || 0;

      if (d.Door_Type.includes(doorTypes[0])) {
        unitDetails.Main.add(d.Type);
      } else if (d.Door_Type.includes(doorTypes[1])) {
        if (!unitDetails.Bedroom[setNo]) unitDetails.Bedroom[setNo] = new Set();
        unitDetails.Bedroom[setNo].add(d.Type);
      } else if (d.Door_Type.includes(doorTypes[2])) {
        if (!unitDetails.Office[setNo]) unitDetails.Office[setNo] = new Set();
        unitDetails.Office[setNo].add(d.Type);
      }
    });

    Object.keys(map).forEach((unitId) => {
      const details = map[unitId].details;
      map[unitId].completeMain = checkCompleteSets([details.Main]);
      map[unitId].completeBedroom = checkCompleteSets(details.Bedroom);
      map[unitId].completeOffice = checkCompleteSets(details.Office);
      map[unitId].startedBedroomSets = details.Bedroom.filter(
        (s) => s && s.size > 0
      ).length;
      map[unitId].startedOfficeSets = details.Office.filter(
        (s) => s && s.size > 0
      ).length;
    });

    return map;
  }, [projectDetails, unitOptions, doorTypes, types]);

  // Handle selection/deselection of units
  const handleUnitSelect = (units) => {
    setSelectedUnits(units);
    const newUnitData = { ...unitData };
    units.forEach((u) => {
      if (!newUnitData[u]) {
        newUnitData[u] = {
          doorType: unitData.doorType || null,
          thickness: unitData.thickness || null,
          types: unitData.types || [], // Inherit pre-selected type
          count: 1,
          file: null,
        };
      }
    });
    Object.keys(newUnitData).forEach((key) => {
      if (
        !units.includes(key) &&
        !["doorType", "thickness", "types"].includes(key)
      ) {
        delete newUnitData[key];
      }
    });
    setUnitData(newUnitData);
  };

  // Handle changes in form fields for a specific unit
  const handleChange = (unit, field, value) => {
    setUnitData((prev) => ({
      ...prev,
      [unit]: { ...prev[unit], [field]: value },
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    const result = [];
    let hasError = false;

    if (selectedUnits.length === 0) {
      message.warning("Please select at least one unit to install.");
      return;
    }

    selectedUnits.forEach((unit) => {
      if (hasError) return;

      const data = unitData[unit];
      const installedInfo = unitInstalledMap[unit];
      const unitInfo = unitOptions.find((u) => u.value === unit);

      if (
        !data.doorType ||
        !data.thickness ||
        data.types.length === 0 ||
        !data.count ||
        data.count < 1
      ) {
        message.warning(
          `Please fill all fields for unit ${unit}, including selecting at least one installation type.`
        );
        hasError = true;
        return;
      }

      const installCount = data.count;

      // --- Find Target Set Number ---
      let targetSetNo = 0;
      let isNewSet = false;

      if (data.doorType.includes("Main")) {
        targetSetNo = 1;
      } else {
        const sets = data.doorType.includes("Bedroom")
          ? installedInfo.details.Bedroom
          : installedInfo.details.Office;
        const incompleteSetIndex = sets.findIndex(
          (s) => s && s.size > 0 && s.size < types.length
        );

        if (incompleteSetIndex !== -1) {
          targetSetNo = incompleteSetIndex;
          if (installCount > 1) {
            message.error(
              `For unit ${unit}, you can only add parts to one existing door at a time. Please set quantity to 1.`
            );
            hasError = true;
            return;
          }
          // Validate that we are not adding a part that's already there
          const existingParts = sets[incompleteSetIndex];
          const duplicatePart = data.types.find((t) => existingParts.has(t));
          if (duplicatePart) {
            message.error(
              `Unit ${unit}: Part "${duplicatePart}" is already installed in this door set.`
            );
            hasError = true;
            return;
          }
        } else {
          isNewSet = true;
          const startedSets = data.doorType.includes("Bedroom")
            ? installedInfo.startedBedroomSets
            : installedInfo.startedOfficeSets;
          targetSetNo = startedSets + 1;
          const limit = 3;
          if (startedSets + installCount > limit) {
            message.error(
              `Unit ${unit}: Cannot add ${installCount} new doors. Limit of ${limit} would be exceeded.`
            );
            hasError = true;
            return;
          }
        }
      }

      if (hasError) return;

      // Validate against supplied/pending parts for each selected type
      data.types.forEach((type) => {
        const supplied =
          projectDetails?.Supplied_Doors?.find(
            (d) =>
              d.Type === type &&
              d.Door_Type === data.doorType &&
              d.Door_Type_MM === data.thickness
          )?.total_count || 0;
        const installed = (projectDetails?.Installed_Doors || [])
          .filter(
            (d) =>
              d.Type === type &&
              d.Door_Type === data.doorType &&
              d.Door_Type_MM === data.thickness
          )
          .reduce((acc, d) => acc + d.total_count, 0);
        const pending = supplied - installed;
        if (installCount > pending) {
          message.error(
            `Not enough stock for ${type} in unit ${unit}. Required: ${installCount}, Pending: ${pending}`
          );
          hasError = true;
        }
      });

      if (hasError) return;

      // --- Construct Payload ---
      for (let i = 0; i < installCount; i++) {
        data.types.forEach((t) => {
          result.push({
            Assigned_To: user.user_id,
            Project_ID: projectDetails.Project_ID,
            Towers: projectDetails.Towers,
            Units: unit,
            Task_ID: projectDetails.Task_ID,
            unit_type: unitInfo.unitType,
            Floors: unitInfo.floor,
            Type: t,
            Door_Type: data.doorType,
            Door_Type_MM: data.thickness,
            Count: 1, // Each entry is for one part
            Set_No: isNewSet ? targetSetNo + i : targetSetNo,
            Attachment: data.file,
          });
        });
      }
    });

    if (hasError) return;

    onSubmit(result);
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
        <Col xs={24} md={8} style={{ maxHeight: 400, overflowY: "auto" }}>
          <Checkbox.Group
            style={{ width: "100%" }}
            value={selectedUnits}
            onChange={handleUnitSelect}
          >
            {unitOptions.map((u) => {
              const info = unitInstalledMap[u.value];
              if (!info) return null;
              const isOffice = info.unitType.toLowerCase().includes("office");
              const mainFull = info.completeMain >= 1;
              const bedStarted = info.startedBedroomSets >= 3;
              const officeStarted = info.startedOfficeSets >= 3;
              const isUnitFull =
                mainFull && (isOffice ? officeStarted : bedStarted);
              const detailsText = `Main: ${info.completeMain}/1 | Bed: ${info.startedBedroomSets}/3 | Office: ${info.startedOfficeSets}/3`;
              return (
                <div
                  key={u.value}
                  style={{
                    border: "1px solid #f0f0f0",
                    padding: 8,
                    borderRadius: 4,
                    marginBottom: 8,
                    backgroundColor: selectedUnits.includes(u.value)
                      ? "#e6f7ff"
                      : "transparent",
                  }}
                >
                  <Checkbox value={u.value} disabled={isUnitFull}>
                    <strong>{u.label}</strong>
                    <div
                      style={{
                        fontSize: 12,
                        color: isUnitFull ? "red" : "#888",
                      }}
                    >
                      {isUnitFull
                        ? "All door slots are started/filled"
                        : detailsText}
                    </div>
                  </Checkbox>
                </div>
              );
            })}
          </Checkbox.Group>
        </Col>

        {/* Right: Inputs for selected units */}
        <Col xs={24} md={16} style={{ maxHeight: 400, overflowY: "auto" }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {selectedUnits.map((unit) => {
              const installedInfo = unitInstalledMap[unit];
              const isOfficeUnit = installedInfo.unitType
                .toLowerCase()
                .includes("office");
              const doorType = unitData[unit]?.doorType;

              let installedPartsInSet = new Set();
              if (doorType) {
                if (doorType.includes("Main")) {
                  installedPartsInSet = installedInfo.details.Main;
                } else {
                  const sets = doorType.includes("Bedroom")
                    ? installedInfo.details.Bedroom
                    : installedInfo.details.Office;
                  const incompleteSet = sets.find(
                    (s) => s && s.size > 0 && s.size < types.length
                  );
                  if (incompleteSet) {
                    installedPartsInSet = incompleteSet;
                  }
                }
              }

              return (
                <div
                  key={unit}
                  style={{
                    border: "1px solid #d9d9d9",
                    padding: "12px",
                    borderRadius: 4,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div style={{ gridColumn: "1 / -1" }}>
                    <strong>
                      Unit: {unitOptions.find((u) => u.value === unit)?.label}
                    </strong>
                  </div>
                  <Select
                    placeholder="Select Door Type"
                    value={unitData[unit]?.doorType}
                    onChange={(val) => handleChange(unit, "doorType", val)}
                    style={{ width: "100%" }}
                  >
                    {doorTypes.map((dt) => {
                      let disabled = false;
                      if (
                        (isOfficeUnit && dt.includes("Bedroom")) ||
                        (!isOfficeUnit && dt.includes("Office"))
                      )
                        disabled = true;
                      if (
                        dt.includes("Main") &&
                        installedInfo.completeMain >= 1
                      )
                        disabled = true;
                      if (
                        dt.includes("Bedroom") &&
                        installedInfo.startedBedroomSets >= 3
                      )
                        disabled = true;
                      if (
                        dt.includes("Office") &&
                        installedInfo.startedOfficeSets >= 3
                      )
                        disabled = true;
                      return (
                        <Option key={dt} value={dt} disabled={disabled}>
                          {dt}
                        </Option>
                      );
                    })}
                  </Select>
                  <Select
                    placeholder="Select Thickness"
                    value={unitData[unit]?.thickness}
                    onChange={(val) => handleChange(unit, "thickness", val)}
                    style={{ width: "100%" }}
                  >
                    {thicknessOptions.map((th) => (
                      <Option key={th} value={th}>
                        {th}
                      </Option>
                    ))}
                  </Select>
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder="Select Parts to Install"
                    value={unitData[unit]?.types}
                    onChange={(val) => handleChange(unit, "types", val)}
                    style={{ width: "100%", gridColumn: "1 / -1" }}
                  >
                    {types.map((t) => {
                      const isInstalled = installedPartsInSet.has(t);
                      return (
                        <Option key={t} value={t} disabled={isInstalled}>
                          {t} {isInstalled && "(installed)"}
                        </Option>
                      );
                    })}
                  </Select>
                  <InputNumber
                    min={1}
                    placeholder="Quantity"
                    value={unitData[unit]?.count}
                    onChange={(val) => handleChange(unit, "count", val)}
                    style={{ width: "100%" }}
                  />
                  <Upload
                    beforeUpload={(file) => {
                      handleChange(unit, "file", file);
                      return false;
                    }}
                    fileList={unitData[unit]?.file ? [unitData[unit].file] : []}
                    onRemove={() => handleChange(unit, "file", null)}
                    accept="image/*"
                    capture="environment"
                  >
                    <Button icon={<UploadOutlined />}>Capture / Upload</Button>
                  </Upload>
                </div>
              );
            })}
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default InstallationModal;
