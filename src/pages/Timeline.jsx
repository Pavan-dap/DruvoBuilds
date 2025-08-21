import React from 'react';
import { Card, Timeline, Typography, Tag, Button } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const TimelinePage = () => {
  const timelineItems = [
    {
      dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      children: (
        <div>
          <Text strong>Project Kickoff - E-Commerce Platform</Text>
          <br />
          <Text type="secondary">Jan 15, 2024 - 9:00 AM</Text>
          <br />
          <Tag color="green">Completed</Tag>
        </div>
      ),
    },
    {
      dot: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
      children: (
        <div>
          <Text strong>Design Review Meeting</Text>
          <br />
          <Text type="secondary">Feb 10, 2024 - 2:00 PM</Text>
          <br />
          <Tag color="blue">In Progress</Tag>
        </div>
      ),
    },
    {
      dot: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      children: (
        <div>
          <Text strong>Database Migration Scheduled</Text>
          <br />
          <Text type="secondary">Feb 20, 2024 - 11:00 PM</Text>
          <br />
          <Tag color="orange">Pending</Tag>
        </div>
      ),
    },
    {
      dot: <ClockCircleOutlined style={{ color: '#722ed1' }} />,
      children: (
        <div>
          <Text strong>Mobile App Testing Phase</Text>
          <br />
          <Text type="secondary">Mar 1, 2024 - 10:00 AM</Text>
          <br />
          <Tag color="purple">Scheduled</Tag>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Project Timeline</Title>
        <Button type="primary">Add Milestone</Button>
      </div>

      <Card size="small">
        <Timeline items={timelineItems} />
      </Card>

      <Card title="Upcoming Deadlines" size="small" style={{ marginTop: 16 }}>
        <div style={{ color: '#666' }}>
          <p>🎯 <strong>Homepage Design</strong> - Due Feb 15, 2024</p>
          <p>🎯 <strong>API Development</strong> - Due Feb 25, 2024</p>
          <p>🎯 <strong>User Testing</strong> - Due Mar 5, 2024</p>
          <p>🎯 <strong>Project Delivery</strong> - Due Mar 15, 2024</p>
        </div>
      </Card>
    </div>
  );
};

export default TimelinePage;
