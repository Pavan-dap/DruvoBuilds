import React from 'react';
import { Card, Row, Col, Statistic, Typography, Button, Space } from 'antd';
import { DownloadOutlined, FileTextOutlined, BarChartOutlined, PieChartOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Reports = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Reports & Analytics</Title>
        <Button type="primary" icon={<DownloadOutlined />}>
          Export Report
        </Button>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic title="Total Projects" value={25} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic title="Active Tasks" value={156} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic title="Team Members" value={42} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic title="Completed This Month" value={18} suffix="/ 25" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} lg={12}>
          <Card title="Quick Reports" extra={<FileTextOutlined />} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<BarChartOutlined />} size="small">Project Performance Report</Button>
              <Button block icon={<PieChartOutlined />} size="small">Team Productivity Report</Button>
              <Button block icon={<FileTextOutlined />} size="small">Financial Summary</Button>
              <Button block icon={<BarChartOutlined />} size="small">Time Tracking Report</Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Reports" size="small">
            <div style={{ color: '#666' }}>
              <p>• Monthly Project Summary - Feb 2024</p>
              <p>• Team Performance Q1 2024</p>
              <p>• Budget Analysis - January</p>
              <p>• Client Satisfaction Survey</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;
