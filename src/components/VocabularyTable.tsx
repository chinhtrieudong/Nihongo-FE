import React, { useEffect } from "react";
import { Table, Typography, Card, Button } from "antd";
import { Volume2 } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { useAppSelector } from "../store/hooks";
import { getFontPreset } from "../constants/fonts";
import type { VocabularyItem } from "../types/lesson";

const { Text } = Typography;

interface VocabularyTableProps {
    data: VocabularyItem[];
    loading?: boolean;
    onCloseSidebar?: () => void;
    lessonInfo?: any;
}

const VocabularyTable: React.FC<VocabularyTableProps> = ({
    data,
    loading = false,
    onCloseSidebar,
    lessonInfo,
}) => {
    const { fontPreset, japaneseFontFamily } = useAppSelector((state) => state.ui);
    const selectedPreset = getFontPreset(fontPreset);

    // Font CSS variables are owned by the app-level FontProvider/ThemeProvider.

    if (!data || data.length === 0) {
        return (
            <Card>
                <Text type="secondary">Không có từ vựng nào trong bài học này.</Text>
            </Card>
        );
    }

    const handlePlayAudio = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    };

    const columns: ColumnsType<VocabularyItem> = [
        {
            title: <div className="pl-2">Kanji</div>,
            dataIndex: "kanji",
            key: "kanji",
            width: "20%",
            render: (text: string) => (
                <Text
                    strong
                    className="text-2xl kanji-text pl-2"
                >
                    {text || "-"}
                </Text>
            ),
        },
        {
            title: "Hiragana",
            dataIndex: "hiragana",
            key: "hiragana",
            width: "20%",
            render: (text: string, record: VocabularyItem) => (
                <Text
                    type="secondary"
                    className="text-lg jp-text"
                >
                    {text || record.katakana || "-"}
                </Text>
            ),
        },
        {
            title: "Hán Việt",
            dataIndex: "hanviet",
            key: "hanviet",
            width: "20%",
            render: (_: string, record: VocabularyItem) => (
                <Text className="text-lg text-purple-600 dark:text-purple-400">
                    {(record.hanviet || record.han_viet)
                        ? String(record.hanviet || record.han_viet).toUpperCase().replace(/,/g, "")
                        : "-"}
                </Text>
            ),
        },
        {
            title: "Nghĩa tiếng Việt",
            dataIndex: "meaningVi",
            key: "meaningVi",
            width: "30%",
            render: (_: string, record: VocabularyItem) => (
                <Text className="text-lg">
                    {record.meaningVi || record.meaning || "-"}
                </Text>
            ),
        },
        {
            title: "Phát",
            key: "audio",
            width: "10%",
            align: "center" as const,
            render: (_: any, record: VocabularyItem) => {
                const text = record.hiragana || record.katakana || record.kanji || "";
                return (
                    <Button
                        type="text"
                        icon={<Volume2 className="w-4 h-4" />}
                        onClick={() => handlePlayAudio(text)}
                        disabled={!text}
                    />
                );
            },
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={false}
            size="middle"
            scroll={{ x: 800 }}
            loading={loading}
        />
    );
};

export default VocabularyTable;