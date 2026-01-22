import React from "react";
import { Modal, Typography, Tag } from "antd";
import {
    ClockCircleOutlined,
    FileTextOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface TestSection {
    id: string;
    name: string;
    icon: React.ReactNode;
    questions: number;
    duration: number;
    description: string;
}

interface Test {
    id: string;
    level: string;
    title: string;
    description: string;
    duration: number;
    questions: number;
    difficulty: string;
    completed: boolean;
    score?: number;
    date?: string;
    sections: TestSection[];
}

interface StartTestModalProps {
    visible: boolean;
    test: Test | null;
    onConfirm: () => void;
    onCancel: () => void;
}

const StartTestModal: React.FC<StartTestModalProps> = ({
    visible,
    test,
    onConfirm,
    onCancel
}) => {
    return (
        <Modal
            title="Xác nhận bắt đầu bài thi"
            open={visible}
            onOk={onConfirm}
            onCancel={onCancel}
            okText="Bắt đầu"
            cancelText="Hủy"
            width={600}
        >
            {test && (
                <div className="space-y-4">
                    <div>
                        <Title level={4} className="!mb-2">{test.title}</Title>
                        <Text type="secondary">{test.description}</Text>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <ClockCircleOutlined className="mr-2" />
                                Thời gian
                            </div>
                            <div className="font-semibold">{test.duration} phút</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <FileTextOutlined className="mr-2" />
                                Số câu
                            </div>
                            <div className="font-semibold">{test.questions} câu</div>
                        </div>
                    </div>

                    <div>
                        <Text strong>Các phần thi:</Text>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {test.sections.map(section => (
                                <Tag key={section.id} icon={section.icon}>
                                    {section.name} ({section.questions} câu)
                                </Tag>
                            ))}
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                        <Text type="warning" strong>
                            ⚠️ Lưu ý:
                        </Text>
                        <ul className="text-sm text-gray-600 mt-2 ml-4">
                            <li>Bài thi sẽ bắt đầu ngay khi bạn nhấn "Bắt đầu"</li>
                            <li>Thời gian sẽ được đếm ngược tự động</li>
                            <li>Bạn không thể tạm dừng bài thi</li>
                            <li>Kết quả sẽ được lưu sau khi hoàn thành</li>
                        </ul>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default StartTestModal;
