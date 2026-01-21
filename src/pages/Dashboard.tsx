import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
          Dashboard
        </h1>
        <div className="text-sm text-secondary-600 dark:text-secondary-400">
          Chào mừng trở lại!
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Tiến độ học tập</h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            Bạn đã hoàn thành 0% khóa học N5
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Từ vựng đã học</h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            0 từ vựng
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Chuỗi ngày học</h3>
          <p className="text-secondary-600 dark:text-secondary-400">0 ngày</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Điểm kinh nghiệm</h3>
          <p className="text-secondary-600 dark:text-secondary-400">0 XP</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
