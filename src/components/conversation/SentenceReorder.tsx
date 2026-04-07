import React, { useState } from 'react';
import { Button, Card, Typography, message } from 'antd';
import { CheckOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface SentenceReorderProps {
    sentences: string[];
    onComplete?: (isCorrect: boolean) => void;
}

const SentenceReorder: React.FC<SentenceReorderProps> = ({ sentences, onComplete }) => {
    const [currentOrder, setCurrentOrder] = useState<string[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>(sentences || []);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const handleWordClick = (word: string, index: number) => {
        setCurrentOrder([...currentOrder, word]);
        setAvailableWords(availableWords.filter((_, i) => i !== index));
    };

    const handleRemoveWord = (index: number) => {
        const removedWord = currentOrder[index];
        setCurrentOrder(currentOrder.filter((_, i) => i !== index));
        setAvailableWords([...availableWords, removedWord]);
    };

    const handleCheck = () => {
        const correctOrder = sentences.join(' ');
        const userOrder = currentOrder.join(' ');
        const correct = correctOrder === userOrder;
        setIsCorrect(correct);

        if (correct) {
            message.success('Chính xác!');
        } else {
            message.error('Chưa chính xác, hãy thử lại!');
        }

        onComplete?.(correct);
    };

    const handleReset = () => {
        setCurrentOrder([]);
        setAvailableWords(sentences || []);
        setIsCorrect(null);
    };

    return (
        <Card title="Sắp xếp câu" className="mb-4">
            <div className="mb-4">
                <Text strong>Câu đã sắp xếp:</Text>
                <div className="min-h-[40px] p-2 border rounded mt-2 flex flex-wrap gap-2">
                    {currentOrder.length === 0 ? (
                        <Text type="secondary">Nhấp vào các từ bên dưới để sắp xếp</Text>
                    ) : (
                        currentOrder.map((word, index) => (
                            <Button
                                key={index}
                                size="small"
                                onClick={() => handleRemoveWord(index)}
                                className="mb-1"
                            >
                                {word}
                            </Button>
                        ))
                    )}
                </div>
            </div>

            <div className="mb-4">
                <Text strong>Các từ có sẵn:</Text>
                <div className="flex flex-wrap gap-2 mt-2">
                    {availableWords.map((word, index) => (
                        <Button
                            key={index}
                            size="small"
                            onClick={() => handleWordClick(word, index)}
                        >
                            {word}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={handleCheck}
                    disabled={currentOrder.length === 0}
                >
                    Kiểm tra
                </Button>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                >
                    Làm lại
                </Button>
            </div>

            {isCorrect !== null && (
                <div className={`mt-4 p-2 rounded ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isCorrect ? '✓ Chính xác!' : '✗ Chưa chính xác'}
                </div>
            )}
        </Card>
    );
};

export default SentenceReorder;