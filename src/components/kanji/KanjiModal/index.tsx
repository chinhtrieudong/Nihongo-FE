import React, { useState, useRef, useEffect } from 'react';
import { KanjiItem } from '../../../types/kanji.js';
import { Modal, Tabs, Tag, Button, Collapse, Typography, Card } from 'antd';
import { SoundOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Text } = Typography;

interface KanjiModalProps {
    kanji: KanjiItem | null;
    visible: boolean;
    onClose: () => void;
}

const KanjiModal: React.FC<KanjiModalProps> = ({ kanji, visible, onClose }) => {
    const [showRomaji, setShowRomaji] = useState(false);
    const [activeTab, setActiveTab] = useState('learn');
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawnStrokes, setDrawnStrokes] = useState<Array<{ points: Array<{ x: number, y: number }> }>>([]);

    // Text-to-speech function
    const speakJapanese = (text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;

            // Try to use a Japanese voice if available
            const voices = window.speechSynthesis.getVoices();
            const japaneseVoice = voices.find(voice => voice.lang.includes('ja'));
            if (japaneseVoice) {
                utterance.voice = japaneseVoice;
            }

            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Speech synthesis not supported in this browser');
        }
    };

    useEffect(() => {
        if (canvasRef.current && activeTab === 'writing') {
            const canvas = canvasRef.current;
            canvas.width = 300;
            canvas.height = 300;
        }
    }, [activeTab]);

    if (!kanji) return null;

    const getJlptColor = (level: string) => {
        switch (level) {
            case 'N5': return 'green';
            case 'N4': return 'blue';
            case 'N3': return 'orange';
            case 'N2': return 'red';
            case 'N1': return 'purple';
            default: return 'default';
        }
    };

    const getReadings = () => {
        const onyomi = kanji.onyomi ? kanji.onyomi.map((o: { kana: string; romaji: string }) => o.kana).join(', ') : '';
        const kunyomi = kanji.kunyomi ? kanji.kunyomi.map((k: { kana: string; romaji: string }) => k.kana).join(', ') : '';
        const onyomiWithRomaji = kanji.onyomi ? kanji.onyomi.map((o: { kana: string; romaji: string }) => `${o.kana} (${o.romaji})`).join(', ') : '';
        const kunyomiWithRomaji = kanji.kunyomi ? kanji.kunyomi.map((k: { kana: string; romaji: string }) => `${k.kana} (${k.romaji})`).join(', ') : '';

        return { onyomi, kunyomi, onyomiWithRomaji, kunyomiWithRomaji };
    };

    const readings = getReadings();

    // Drawing functions
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        const newStroke = { points: [{ x, y }] };
        setDrawnStrokes([...drawnStrokes, newStroke]);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const updatedStrokes = [...drawnStrokes];
        updatedStrokes[updatedStrokes.length - 1].points.push({ x, y });
        setDrawnStrokes(updatedStrokes);

        // Draw on canvas
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        const lastPoint = updatedStrokes[updatedStrokes.length - 1].points[updatedStrokes[updatedStrokes.length - 1].points.length - 2];
        if (lastPoint) {
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setDrawnStrokes([]);
        setCurrentStroke(0);
    };

    const showStrokeAnimation = () => {
        setIsAnimating(true);
        // Animation logic would go here
        setTimeout(() => setIsAnimating(false), 2000);
    };

    return (
        <Modal
            title={
                <div className="flex items-center justify-between pr-8">
                    <div>
                        <span className="text-2xl font-bold mr-2">{kanji.character}</span>
                        <Tag color={getJlptColor(kanji.jlpt_level)}>{kanji.jlpt_level}</Tag>
                    </div>
                    <Button
                        size="small"
                        onClick={() => setShowRomaji(!showRomaji)}
                        className="mr-2"
                    >
                        {showRomaji ? 'Ẩn' : 'Hiện'} Romaji
                    </Button>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            className="kanji-modal"
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="kanji-tabs"
            >
                <Tabs.TabPane tab="Học" key="learn">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Card title="Thông tin cơ bản" className="h-fit">
                                <div className="text-center mb-4">
                                    <div className="text-6xl font-bold text-secondary-700 dark:text-secondary-400 mb-2">{kanji.character}</div>
                                    <div className="text-xl text-purple-600 dark:text-purple-400 font-medium">{kanji.hanviet}</div>
                                    <div className="text-lg text-secondary-600 dark:text-secondary-800">{kanji.meaning_vi}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Âm On:</span>
                                        <span>{readings.onyomi}</span>
                                    </div>
                                    {showRomaji && (
                                        <div className="flex justify-between text-sm text-secondary-700 dark:text-secondary-800">
                                            <span>Romaji:</span>
                                            <span>{readings.onyomiWithRomaji}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="font-medium">Âm Kun:</span>
                                        <span>{readings.kunyomi}</span>
                                    </div>
                                    {showRomaji && (
                                        <div className="flex justify-between text-sm text-secondary-700 dark:text-secondary-800">
                                            <span>Romaji:</span>
                                            <span>{readings.kunyomiWithRomaji}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="font-medium">Số nét:</span>
                                        <span>{kanji.stroke_count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Cấp độ:</span>
                                        <Tag color={getJlptColor(kanji.jlpt_level)}>
                                            {kanji.jlpt_level}
                                        </Tag>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Tần suất:</span>
                                        <span>{kanji.frequency}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Danh mục:</span>
                                        <Tag>{kanji.category}</Tag>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Bộ thủ & Cấu tạo" className="h-fit">
                                <Collapse>
                                    <Panel header={`Bộ thủ: ${kanji.radical.symbol} - ${kanji.radical.name_vi}`} key="radical">
                                        <p><strong>Ký hiệu:</strong> {kanji.radical.symbol}</p>
                                        <p><strong>Tên Hán Việt:</strong> {kanji.radical.hanviet}</p>
                                        <p><strong>Tên tiếng Việt:</strong> {kanji.radical.name_vi}</p>
                                        <p><strong>Nghĩa:</strong> {kanji.radical.meaning}</p>
                                    </Panel>
                                    <Panel header="Cấu tạo chữ" key="structure">
                                        <p>{kanji.structure}</p>
                                        <p className="text-sm text-secondary-600 dark:text-secondary-800 mt-2">{kanji.image_explanation}</p>
                                    </Panel>
                                    {kanji.kanji_analysis && kanji.kanji_analysis.length > 0 && (
                                        <Panel header="Phân tích chi tiết" key="analysis">
                                            <div className="space-y-2">
                                                {kanji.kanji_analysis.map((analysis: any, index: number) => (
                                                    <div key={index} className="p-2 border border-gray-200 rounded">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">{analysis.component}</span>
                                                            <Tag>{analysis.role}</Tag>
                                                        </div>
                                                        <div className="text-sm text-secondary-600 dark:text-secondary-800">{analysis.hanviet} - {analysis.meaning}</div>
                                                        <div className="text-xs text-secondary-700 dark:text-secondary-800">Vị trí: {analysis.position}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Panel>
                                    )}
                                </Collapse>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <Card title="Từ vựng liên quan" className="h-fit">
                                <div className="space-y-2">
                                    {kanji.vocabulary_examples && kanji.vocabulary_examples.length > 0 ? (
                                        kanji.vocabulary_examples.map((word: any, index: number) => (
                                            <div key={index} className="p-3 border border-secondary-200 dark:border-secondary-900 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-900">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-medium">{word.word}</span>
                                                            <span className="text-secondary-700 dark:text-secondary-800">{word.hiragana}</span>
                                                            {word.audio_url && (
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={<SoundOutlined />}
                                                                    onClick={() => speakJapanese(word.hiragana || word.word)}
                                                                    className="text-secondary-400 dark:text-secondary-500 hover:text-blue-500"
                                                                />
                                                            )}
                                                        </div>
                                                        {showRomaji && (
                                                            <div className="text-sm text-secondary-700 dark:text-secondary-800">{word.romaji}</div>
                                                        )}
                                                        <div className="text-purple-600 font-medium">{word.hanviet}</div>
                                                        <div className="text-secondary-700 dark:text-secondary-800">{word.meaning_vi}</div>

                                                        {word.example_jp && (
                                                            <div className="mt-2 p-2 bg-secondary-50 dark:bg-secondary-925 rounded">
                                                                <div className="text-sm text-secondary-700 dark:text-secondary-400">{word.example_jp}</div>
                                                                <div className="text-sm text-secondary-600 dark:text-secondary-800">{word.example_vi}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-secondary-700 dark:text-secondary-800 text-center py-4">
                                            Không có từ vựng mẫu
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab="Tập viết" key="writing">
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Drawing Canvas */}
                            <div className="space-y-4">
                                <Card title="Luyện viết" className="text-center">
                                    <canvas
                                        ref={canvasRef}
                                        className="border-2 border-gray-300 rounded-lg mx-auto cursor-crosshair"
                                        style={{ touchAction: 'none' }}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                    />
                                    <div className="mt-4 space-x-2">
                                        <Button onClick={clearCanvas} className="mr-2">
                                            Xóa
                                        </Button>
                                        <Button onClick={() => setShowHint(!showHint)}>
                                            {showHint ? 'Ẩn' : 'Hiện'} gợi ý
                                        </Button>
                                    </div>
                                </Card>
                            </div>

                            {/* Guide and Info */}
                            <div className="space-y-4">
                                <Card title="Hướng dẫn viết">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Số nét:</span>
                                            <Tag color="blue">{kanji.stroke_count} nét</Tag>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Nét hiện tại:</span>
                                            <Tag color="green">{currentStroke + 1}/{kanji.stroke_count}</Tag>
                                        </div>

                                        {showHint && (
                                            <div className="mt-4 p-4 bg-secondary-50 dark:bg-secondary-925 rounded-lg">
                                                <p className="font-medium mb-2">Thứ tự các nét:</p>
                                                {kanji.stroke_order && kanji.stroke_order.length > 0 ? (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {kanji.stroke_order.map((order: string, idx: number) => (
                                                            <div key={idx} className="bg-white border border-gray-200 rounded p-2 text-center">
                                                                <span className="text-sm font-medium">{order}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-secondary-700 dark:text-secondary-800">Không có thông tin thứ tự nét</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <Card title="Công cụ">
                                    <div className="space-y-2">
                                        <Button
                                            type="primary"
                                            block
                                            onClick={showStrokeAnimation}
                                            loading={isAnimating}
                                        >
                                            {isAnimating ? 'Đang phát...' : 'Phát动画 thứ tự nét'}
                                        </Button>
                                        <div className="text-sm text-secondary-600 dark:text-secondary-800">
                                            <p>• Nhấn và kéo để viết từng nét</p>
                                            <p>• Số nét: {kanji.stroke_count}</p>
                                            <p>• Click "Hiện gợi ý" để xem thứ tự</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </Tabs.TabPane>
            </Tabs>
        </Modal>
    );
};

export default KanjiModal;
