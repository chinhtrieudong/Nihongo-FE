import React from "react";
import { Button, Drawer, Layout, Spin, Tooltip, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import type { Lesson } from "../../types/lesson";
import LessonRange from "../../components/LessonRange";

const { Sider } = Layout;
const { Title, Text } = Typography;

type LessonSidebarProps = {
  lessons: Lesson[];
  lessonsLoading: boolean;
  lessonId?: string;
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
  desktopSidebarCollapsed: boolean;
  setDesktopSidebarCollapsed: (collapsed: boolean) => void;
  onLessonClick: (lesson: Lesson) => void;
};

const LessonSidebar: React.FC<LessonSidebarProps> = ({
  lessons,
  lessonsLoading,
  lessonId,
  sidebarVisible,
  setSidebarVisible,
  desktopSidebarCollapsed,
  setDesktopSidebarCollapsed,
  onLessonClick,
}) => {
  return (
    <>
      <Drawer
        title={<span>50 bài Minna no Nihongo</span>}
        placement="right"
        onClose={() => setSidebarVisible(false)}
        open={sidebarVisible}
        size={280}
        className="lg:hidden"
      >
        <div className="space-y-4">
          {lessonsLoading ? (
            <div className="p-8 text-center">
              <Spin size="large" className="mb-4" />
              <Text type="secondary">Đang tải danh sách bài học...</Text>
            </div>
          ) : (
            <LessonRange
              lessons={lessons}
              currentLessonId={lessonId}
              onLessonClick={(lesson) => {
                onLessonClick(lesson);
                setSidebarVisible(false);
              }}
            />
          )}
        </div>
      </Drawer>

      <Sider
        width={280}
        collapsedWidth={0}
        collapsed={desktopSidebarCollapsed}
        onCollapse={setDesktopSidebarCollapsed}
        breakpoint="lg"
        className="bg-white dark:bg-secondary-925 border-l border-secondary-200 dark:border-secondary-900 fixed right-0 overflow-y-hidden transition-all duration-300"
        style={{ zIndex: 1000, top: "64px", height: "calc(100vh - 64px)" }}
      >
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-teal-700 block" />
              <Title level={5} className="!mb-1">
                50 bài Minna no Nihongo
              </Title>
            </div>
            <Tooltip title="Đóng danh sách bài học" placement="bottom">
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setDesktopSidebarCollapsed(true)}
                className="
                  flex-shrink-0
                  w-7 h-7
                  text-neutral-500
                  hover:text-neutral-700
                  dark:text-neutral-400
                  dark:hover:text-neutral-200
                  hover:bg-neutral-100
                  dark:hover:bg-neutral-800
                  transition-all
                  duration-200
                  flex items-center justify-center
                  bg-white
                  dark:bg-secondary-925
                  shadow-sm
                  hover:shadow
                "
              />
            </Tooltip>
          </div>
        </div>

        <div
          className=""
          style={{ height: "calc(100vh - 152px)", overflowY: "auto", scrollbarWidth: "none" }}
        >
          {lessonsLoading ? (
            <div className="p-8 text-center">
              <Spin size="large" className="mb-4" />
              <Text type="secondary">Đang tải danh sách bài học...</Text>
            </div>
          ) : (
            <div className="p-3">
              <LessonRange
                lessons={lessons}
                currentLessonId={lessonId}
                onLessonClick={onLessonClick}
              />
            </div>
          )}
        </div>
      </Sider>
    </>
  );
};

export default LessonSidebar;
