import React, { useState, useRef, useEffect } from 'react';
import { KanjiItem } from '../../../types/kanji.js';
import { Modal, Tabs, Tag, Button, Collapse, Typography, Card } from 'antd';
import { SoundOutlined, ReloadOutlined } from '@ant-design/icons';
import HanziWriter from 'hanzi-writer';

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
    const [score, setScore] = useState<number | null>(null);
    const [showScore, setShowScore] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hanziWriterRef = useRef<any>(null);
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

    useEffect(() => {
        // Initialize HanziWriter when kanji changes or hint is shown
        if (kanji && showHint && hanziWriterRef.current === null) {
            const targetDiv = document.createElement('div');
            targetDiv.id = 'hanzi-writer-target';
            targetDiv.style.width = '200px';
            targetDiv.style.height = '200px';

            // Find the hint section and append the writer
            const hintSection = document.querySelector('.hint-writer-container');
            if (hintSection) {
                hintSection.innerHTML = '';
                hintSection.appendChild(targetDiv);

                try {
                    // Check if dark mode is active
                    const isDarkMode = document.documentElement.classList.contains('dark');

                    hanziWriterRef.current = HanziWriter.create(targetDiv, kanji.character, {
                        width: 200,
                        height: 200,
                        padding: 5,
                        strokeAnimationSpeed: 1,
                        delayBetweenStrokes: 300,
                        strokeColor: '#1890ff',
                        outlineColor: isDarkMode ? '#666' : '#ddd',
                        drawingColor: '#000000',
                        showCharacter: false,
                        showOutline: true
                    });

                    // Start animation
                    setTimeout(() => {
                        if (hanziWriterRef.current) {
                            hanziWriterRef.current.animateCharacter();
                        }
                    }, 100);
                } catch (error) {
                    console.error('Error initializing HanziWriter:', error);
                }
            }
        }

        return () => {
            // Cleanup when hint is hidden or component unmounts
            if (!showHint && hanziWriterRef.current) {
                const targetDiv = document.getElementById('hanzi-writer-target');
                if (targetDiv) {
                    targetDiv.remove();
                }
                hanziWriterRef.current = null;
            }
        };
    }, [kanji, showHint]);

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

        // Draw on canvas with dark mode support
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Check if dark mode is active
        const isDarkMode = document.documentElement.classList.contains('dark');
        ctx.strokeStyle = isDarkMode ? '#ffffff' : '#000000';

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
        setScore(null);
        setShowScore(false);
    };

    const evaluateWriting = () => {
        if (!kanji || drawnStrokes.length === 0) {
            alert('Vui lòng viết kanji trước khi chấm điểm!');
            return;
        }

        // Simple scoring algorithm based on stroke count and coverage
        let calculatedScore = 0;

        // Score based on stroke count (40% of total)
        const expectedStrokes = kanji.stroke_count || 1;
        const actualStrokes = drawnStrokes.length;
        const strokeScore = Math.max(0, 40 - Math.abs(expectedStrokes - actualStrokes) * 10);
        calculatedScore += strokeScore;

        // Score based on stroke coverage (30% of total)
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                let drawnPixels = 0;

                for (let i = 3; i < pixels.length; i += 4) {
                    if (pixels[i] > 0) drawnPixels++;
                }

                const coverageRatio = drawnPixels / (canvas.width * canvas.height);
                const coverageScore = Math.min(30, coverageRatio * 100);
                calculatedScore += coverageScore;
            }
        }

        // Score based on stroke length and complexity (30% of total)
        let totalStrokeLength = 0;
        drawnStrokes.forEach(stroke => {
            for (let i = 1; i < stroke.points.length; i++) {
                const dx = stroke.points[i].x - stroke.points[i - 1].x;
                const dy = stroke.points[i].y - stroke.points[i - 1].y;
                totalStrokeLength += Math.sqrt(dx * dx + dy * dy);
            }
        });

        const complexityScore = Math.min(30, (totalStrokeLength / expectedStrokes) * 2);
        calculatedScore += complexityScore;

        setScore(Math.round(calculatedScore));
        setShowScore(true);
    };

    const reloadStrokeAnimation = () => {
        if (!kanji || !hanziWriterRef.current) return;

        try {
            // Restart the animation
            hanziWriterRef.current.animateCharacter();
        } catch (error) {
            console.error('Error reloading stroke animation:', error);
        }
    };

    const showStrokeAnimation = () => {
        if (!kanji) return;

        setIsAnimating(true);

        try {
            // Clear canvas first
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }

            // Simple stroke animation using canvas API
            animateKanjiStrokes(kanji.character);

            setTimeout(() => {
                setIsAnimating(false);
            }, 2000);
        } catch (error) {
            console.error('Error animating kanji:', error);
            setIsAnimating(false);
        }
    };

    const animateKanjiStrokes = (character: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Simple placeholder animation - draw the character with animation
        ctx.font = '120px "KaiTi", "STKaiti", "Arial Unicode MS", sans-serif';
        ctx.fillStyle = '#1890ff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let opacity = 0;
        const fadeIn = setInterval(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = opacity * 0.8; // Slightly transparent for softer look
            ctx.fillText(character, canvas.width / 2, canvas.height / 2);

            opacity += 0.03; // Slower fade-in for smoother effect
            if (opacity >= 1) {
                clearInterval(fadeIn);
                ctx.globalAlpha = 0.8;
            }
        }, 60); // Slightly slower interval
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
                                                                <div className="text-sm text-secondary-800 dark:text-secondary-400">{word.example_jp}</div>
                                                                <div className="text-sm text-secondary-700 dark:text-secondary-800">{word.example_vi}</div>
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
                                        className="border-2 border-gray-300 dark:border-gray-600 rounded-lg mx-auto cursor-crosshair bg-white dark:bg-gray-800"
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
                                        {showHint && (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <p className="font-medium">Gợi ý:</p>
                                                    <Button
                                                        size="small"
                                                        icon={<ReloadOutlined />}
                                                        onClick={reloadStrokeAnimation}
                                                        title="Tải lại hoạt ảnh nét vẽ"
                                                    >
                                                        Tải lại
                                                    </Button>
                                                </div>
                                                <div className="hint-writer-container mb-4 flex justify-center">
                                                    {/* HanziWriter will be rendered here */}
                                                </div>
                                            </>
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
                                            {isAnimating ? 'Đang phát...' : 'Phát hoạt ảnh nét vẽ'}
                                        </Button>
                                        <Button
                                            type="default"
                                            block
                                            onClick={evaluateWriting}
                                            disabled={drawnStrokes.length === 0}
                                        >
                                            Chấm điểm viết
                                        </Button>
                                        {showScore && score !== null && (
                                            <div className="p-3 bg-secondary-50 dark:bg-secondary-925 rounded-lg">
                                                <div className="text-center">
                                                    <div className={`text-2xl font-bold mb-2 ${score >= 80 ? 'text-green-600 dark:text-green-400' :
                                                        score >= 60 ? 'text-blue-600 dark:text-blue-400' :
                                                            score >= 40 ? 'text-orange-600 dark:text-orange-400' :
                                                                'text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {score}/100 điểm
                                                    </div>
                                                    <div className={`text-sm font-medium ${score >= 80 ? 'text-green-700 dark:text-green-300' :
                                                        score >= 60 ? 'text-blue-700 dark:text-blue-300' :
                                                            score >= 40 ? 'text-orange-700 dark:text-orange-300' :
                                                                'text-red-700 dark:text-red-300'
                                                        }`}>
                                                        {score >= 80 ? 'Tuyệt vời! 🎉' :
                                                            score >= 60 ? 'Khá tốt! 👍' :
                                                                score >= 40 ? 'Cần cố gắng! 💪' : 'Thử lại nhé! 📝'}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="text-sm text-secondary-900 dark:text-secondary-300">
                                            <p>• Nhấn và kéo để viết từng nét</p>
                                            <p>• Số nét: {kanji.stroke_count}</p>
                                            <p>• Click "Hiện gợi ý" để xem cách viết</p>
                                            <p>• "Chấm điểm viết" để đánh giá</p>
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
