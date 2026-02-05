import React from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Avatar,
  Typography,
  Space,
  Statistic,
} from "antd";
import {
  UserOutlined,
  TrophyOutlined,
  BookOutlined,
  FireOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../store/hooks";

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);

  return (
    <div className="p-6 space-y-6 bg-secondary-50 dark:bg-secondary-950 min-h-full text-secondary-900 dark:text-secondary-100">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <Title level={2} className="!mb-1">
              {currentUser?.username || "Người dùng"}
            </Title>
            <Text type="secondary" className="text-secondary-600 dark:text-secondary-400">
              Chào mừng trở lại!
            </Text>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={
                <Text className="text-secondary-700 dark:text-secondary-300">
                  Tiến độ học tập
                </Text>
              }
              value={0}
              suffix="%"
              prefix={<BookOutlined className="text-blue-500" />}
              styles={{ content: { color: "#1890ff" } }}
            />
            <div className="mt-3">
              <Progress percent={0} size="small" />
              <Text type="secondary" className="text-xs text-secondary-600 dark:text-secondary-400">
                Khóa học {currentUser?.currentLevel || "N5"}
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={
                <Text className="text-secondary-700 dark:text-secondary-300">
                  Từ vựng đã học
                </Text>
              }
              value={0}
              prefix={<StarOutlined className="text-yellow-500" />}
              styles={{ content: { color: "#faad14" } }}
            />
            <div className="mt-3">
              <Text type="secondary" className="text-xs text-secondary-600 dark:text-secondary-400">
                Tổng số: 0 từ
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={
                <Text className="text-secondary-700 dark:text-secondary-300">
                  Chuỗi học tập
                </Text>
              }
              value={currentUser?.streakDays || 0}
              suffix="ngày"
              prefix={<FireOutlined className="text-orange-500" />}
              styles={{ content: { color: "#fa8c16" } }}
            />
            <div className="mt-3">
              <Text type="secondary" className="text-xs text-secondary-600 dark:text-secondary-400">
                Học liên tục
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={
                <Text className="text-secondary-700 dark:text-secondary-300">
                  Điểm kinh nghiệm
                </Text>
              }
              value={currentUser?.totalXp || 0}
              suffix="XP"
              prefix={<TrophyOutlined className="text-green-500" />}
              styles={{ content: { color: "#52c41a" } }}
            />
            <div className="mt-3">
              <Text type="secondary" className="text-xs text-secondary-600 dark:text-secondary-400">
                Cấp độ: {currentUser?.currentLevel || "Beginner"}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Profile Information */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Text className="text-secondary-900 dark:text-secondary-100">
                Thông tin cá nhân
              </Text>
            }
          >
            <Space orientation="vertical" className="w-full" size="middle">
              <div className="flex justify-between">
                <Text strong>Tên đăng nhập:</Text>
                <Text>{currentUser?.username || "Chưa cập nhật"}</Text>
              </div>
              <div className="flex justify-between">
                <Text strong>Email:</Text>
                <Text>{currentUser?.email || "Chưa cập nhật"}</Text>
              </div>
              <div className="flex justify-between">
                <Text strong>Ngày tham gia:</Text>
                <Text>
                  {currentUser?.createdAt
                    ? new Date(currentUser.createdAt).toLocaleDateString(
                        "vi-VN",
                      )
                    : new Date().toLocaleDateString("vi-VN")}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text strong>Trình độ hiện tại:</Text>
                <Text color="blue">
                  {currentUser?.currentLevel || "N5"} Beginner
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Text className="text-secondary-900 dark:text-secondary-100">
                Thành tựu
              </Text>
            }
          >
            <Space orientation="vertical" className="w-full" size="middle">
              <div className="text-center py-4">
                <TrophyOutlined className="text-4xl text-gray-300 mb-2" />
                <Text type="secondary" className="text-secondary-600 dark:text-secondary-400">
                  Chưa có thành tựu
                </Text>
                <Text type="secondary" className="text-xs text-secondary-600 dark:text-secondary-400">
                  Hoàn thành bài học để nhận thành tựu
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Settings Card */}
      <Card
        title={
          <Text className="text-secondary-900 dark:text-secondary-100">
            Cài đặt
          </Text>
        }
      >
        <Space orientation="vertical" className="w-full" size="middle">
          <Text type="secondary" className="text-secondary-600 dark:text-secondary-400">
            Các tùy chọn cài đặt sẽ hiển thị ở đây.
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <Text strong>Thông báo</Text>
              <div className="mt-2">
                <Text type="secondary" className="text-sm text-secondary-600 dark:text-secondary-400">
                  Quản lý thông báo học tập
                </Text>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <Text strong>Quyền riêng tư</Text>
              <div className="mt-2">
                <Text type="secondary" className="text-sm text-secondary-600 dark:text-secondary-400">
                  Cài đặt bảo mật và quyền riêng tư
                </Text>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <Text strong>Giao diện</Text>
              <div className="mt-2">
                <Text type="secondary" className="text-sm text-secondary-600 dark:text-secondary-400">
                  Tùy chỉnh giao diện ứng dụng
                </Text>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <Text strong>Tài khoản</Text>
              <div className="mt-2">
                <Text type="secondary" className="text-sm text-secondary-600 dark:text-secondary-400">
                  Quản lý thông tin tài khoản
                </Text>
              </div>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Profile;
