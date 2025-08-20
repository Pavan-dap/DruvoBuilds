import React from 'react';
import { Card, Row, Col, Statistic, Typography, Button, Space } from 'antd';
import { DownloadOutlined, FileTextOutlined, BarChartOutlined, PieChartOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Reports = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Reports & Analytics</Title>
        <Button type="primary" icon={<DownloadOutlined />}>
          Export Report
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Total Projects" value={25} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Active Tasks" value={156} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Team Members" value={42} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Completed This Month" value={18} suffix="/ 25" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Quick Reports" extra={<FileTextOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<BarChartOutlined />}>Project Performance Report</Button>
              <Button block icon={<PieChartOutlined />}>Team Productivity Report</Button>
              <Button block icon={<FileTextOutlined />}>Financial Summary</Button>
              <Button block icon={<BarChartOutlined />}>Time Tracking Report</Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Reports">
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
