import React from 'react';
import { Button, Card, Row, Col, Typography } from 'antd';
import {
  MenuOutlined,
  BookOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  BarsOutlined,
  MoreOutlined,
  FolderOutlined,
  OrderedListOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  AlignLeftOutlined,
  TableOutlined,
  BorderOutlined,
  DragOutlined,
  HolderOutlined,
  SplitCellsOutlined,
  ColumnWidthOutlined,
  ExpandOutlined,
  ShrinkOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const IconShowcase: React.FC = () => {
  const iconOptions = [
    { icon: <BookOutlined />, name: 'BookOutlined', description: 'Sách - Phù hợp cho danh sách bài học' },
    { icon: <UnorderedListOutlined />, name: 'UnorderedListOutlined', description: 'Danh sách không thứ tự' },
    { icon: <AppstoreOutlined />, name: 'AppstoreOutlined', description: 'Lưới ứng dụng' },
    { icon: <BarsOutlined />, name: 'BarsOutlined', description: 'Thanh ngang' },
    { icon: <MoreOutlined />, name: 'MoreOutlined', description: 'Thêm tùy chọn' },
    { icon: <FolderOutlined />, name: 'FolderOutlined', description: 'Thư mục' },
    { icon: <OrderedListOutlined />, name: 'OrderedListOutlined', description: 'Danh sách có thứ tự' },
    { icon: <MenuUnfoldOutlined />, name: 'MenuUnfoldOutlined', description: 'Mở menu' },
    { icon: <MenuFoldOutlined />, name: 'MenuFoldOutlined', description: 'Đóng menu' },
    { icon: <AlignLeftOutlined />, name: 'AlignLeftOutlined', description: 'Căn lề trái' },
    { icon: <TableOutlined />, name: 'TableOutlined', description: 'Bảng' },
    { icon: <BorderOutlined />, name: 'BorderOutlined', description: 'Viền' },
    { icon: <DragOutlined />, name: 'DragOutlined', description: 'Kéo' },
    { icon: <HolderOutlined />, name: 'HolderOutlined', description: 'Giữ' },
    { icon: <SplitCellsOutlined />, name: 'SplitCellsOutlined', description: 'Chia ô' },
    { icon: <ColumnWidthOutlined />, name: 'ColumnWidthOutlined', description: 'Chiều rộng cột' },
    { icon: <ExpandOutlined />, name: 'ExpandOutlined', description: 'Mở rộng' },
    { icon: <ShrinkOutlined />, name: 'ShrinkOutlined', description: 'Thu nhỏ' },
    { icon: <FullscreenOutlined />, name: 'FullscreenOutlined', description: 'Toàn màn hình' },
    { icon: <FullscreenExitOutlined />, name: 'FullscreenExitOutlined', description: 'Thoát toàn màn hình' },
    { icon: <MenuOutlined />, name: 'MenuOutlined', description: 'Menu hamburger (gốc)' }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>🎨 Icon Options for Sidebar Toggle</Title>
      <Text type="secondary">Chọn icon phù hợp nhất để thay thế hamburger menu</Text>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        {iconOptions.map((item, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card
              hoverable
              size="small"
              style={{ textAlign: 'center', height: '120px' }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {item.icon}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                {item.description}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ marginTop: '24px' }}>
        <Title level={4}>💡 Gợi ý lựa chọn:</Title>
        <ul>
          <li><strong>BookOutlined</strong> - Phù hợp nhất cho danh sách bài học</li>
          <li><strong>UnorderedListOutlined</strong> - Rõ ràng về chức năng danh sách</li>
          <li><strong>MenuUnfoldOutlined/MenuFoldOutlined</strong> - Chuẩn cho toggle menu</li>
          <li><strong>MoreOutlined</strong> - Đơn giản, hiện đại</li>
          <li><strong>BarsOutlined</strong> - Tương tự hamburger nhưng khác biệt</li>
        </ul>
      </Card>
    </div>
  );
};

export default IconShowcase;
