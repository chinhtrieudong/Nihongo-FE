import React from "react";
import { Modal, Typography, Tag } from "antd";
import {
    Clock,
    FileText
} from "lucide-react";

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
                        <div className="bg-surface-2 p-3 rounded border border-border">
                            <div className="flex items-center text-sm text-text-sub mb-1">
                                <Clock className="w-4 h-4 mr-2" />
                                Thời gian
                            </div>
                            <div className="font-semibold text-text-main">{test.duration} phút</div>
                        </div>
                        <div className="bg-surface-2 p-3 rounded border border-border">
                            <div className="flex items-center text-sm text-text-sub mb-1">
                                <FileText className="w-4 h-4 mr-2" />
                                Số câu
                            </div>
                            <div className="font-semibold text-text-main">{test.questions} câu</div>
                        </div>
                    </div>

                    <div>
                        <Text strong className="text-text-main">Các phần thi:</Text>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {test.sections.map(section => (
                                <Tag key={section.id} icon={section.icon} className="bg-surface-1 border-border text-text-main">
                                    {section.name} ({section.questions} câu)
                                </Tag>
                            ))}
                        </div>
                    </div>

                    <div className="bg-warning/10 border border-warning/30 p-3 rounded">
                        <Text type="warning" strong>
                            ⚠️ Lưu ý:
                        </Text>
                        <ul className="text-sm text-text-sub mt-2 ml-4">
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
