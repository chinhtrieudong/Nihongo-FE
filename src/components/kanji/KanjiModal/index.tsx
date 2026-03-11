import React, { useState, useRef, useEffect } from 'react';
import { KanjiItem } from '../../../types/kanji.js';
import { Modal, Tabs, Tag, Button, Collapse, Typography, Card } from 'antd';
import { SoundOutlined, ReloadOutlined } from '@ant-design/icons';
import HanziWriter from 'hanzi-writer';
import { getNanamiNaturalVoice } from '../../../utils/vocabularyUtils';

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

            // Try to use a Japanese voice (prefer Natural if available)
            const voices = window.speechSynthesis.getVoices();
            const japaneseVoices = voices.filter(voice => voice.lang.includes('ja'));

            // CHỈ sử dụng Microsoft Nanami Online (Natural)
            const nanamiNatural = getNanamiNaturalVoice();
            const preferredJapanese = nanamiNatural;

            if (preferredJapanese) {
                utterance.voice = preferredJapanese;
            } else {
                // Nếu không có Microsoft Nanami, không phát âm
                console.warn('Microsoft Nanami Online (Natural) not available. Please install the voice.');
                return;
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
        const onyomi = kanji.onyomi ? kanji.onyomi.map((o) => o.kana).join(', ') : '';
        const kunyomi = kanji.kunyomi ? kanji.kunyomi.map((k) => k.kana).join(', ') : '';
        const onyomiWithRomaji = kanji.onyomi
            ? kanji.onyomi.map((o) => (o.romaji ? `${o.kana} (${o.romaji})` : o.kana)).join(', ')
            : '';
        const kunyomiWithRomaji = kanji.kunyomi
            ? kanji.kunyomi.map((k) => (k.romaji ? `${k.kana} (${k.romaji})` : k.kana)).join(', ')
            : '';

        return { onyomi, kunyomi, onyomiWithRomaji, kunyomiWithRomaji };
    };

    const readings = getReadings();

    // Drawing functions
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let x, y;
        if ('touches' in e) {
            // Touch event
            x = (e.touches[0].clientX - rect.left) * scaleX;
            y = (e.touches[0].clientY - rect.top) * scaleY;
        } else {
            // Mouse event
            x = (e.clientX - rect.left) * scaleX;
            y = (e.clientY - rect.top) * scaleY;
        }

        setIsDrawing(true);
        const newStroke = { points: [{ x, y }] };
        setDrawnStrokes([...drawnStrokes, newStroke]);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let x, y;
        if ('touches' in e) {
            // Touch event
            x = (e.touches[0].clientX - rect.left) * scaleX;
            y = (e.touches[0].clientY - rect.top) * scaleY;
        } else {
            // Mouse event
            x = (e.clientX - rect.left) * scaleX;
            y = (e.clientY - rect.top) * scaleY;
        }

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

        let calculatedScore = 0;

        // Score based on stroke count (25% of total) - stricter
        const expectedStrokes = kanji.stroke_count || 1;
        const actualStrokes = drawnStrokes.length;
        const strokeScore = Math.max(0, 25 - Math.abs(expectedStrokes - actualStrokes) * 8);
        calculatedScore += strokeScore;

        // Score based on stroke order and direction (35% of total) - much stricter
        let orderScore = 0;
        if (actualStrokes === expectedStrokes) {
            // Check if strokes are in reasonable order (stricter check)
            const strokeOrderCorrect = checkStrokeOrder(drawnStrokes);
            orderScore = strokeOrderCorrect ? 35 : 10;
        } else {
            orderScore = Math.max(0, 35 - (Math.abs(expectedStrokes - actualStrokes) * 12));
        }
        calculatedScore += orderScore;

        // Score based on coverage and completeness (25% of total) - much stricter
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                let drawnPixels = 0;
                let totalPixels = canvas.width * canvas.height;

                // Count drawn pixels
                for (let i = 3; i < pixels.length; i += 4) {
                    const alpha = pixels[i];
                    if (alpha > 0) drawnPixels++;
                }

                // Much stricter coverage calculation
                const coverageRatio = drawnPixels / totalPixels;
                const expectedCoverage = Math.min(0.15, expectedStrokes * 0.02); // Much lower expected coverage
                const coverageScore = Math.min(25, (coverageRatio / expectedCoverage) * 25);
                calculatedScore += coverageScore;
            }
        }

        // Score based on stroke quality and continuity (15% of total) - NEW!
        let qualityScore = 0;
        let totalStrokeQuality = 0;
        let strokeCount = 0;

        drawnStrokes.forEach(stroke => {
            if (stroke.points.length > 1) {
                let strokeQuality = 0;
                let totalDistance = 0;
                let straightness = 0;

                for (let i = 1; i < stroke.points.length; i++) {
                    const dx = stroke.points[i].x - stroke.points[i - 1].x;
                    const dy = stroke.points[i].y - stroke.points[i - 1].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    totalDistance += distance;

                    // Check if stroke is reasonably straight (simplified)
                    if (i > 1) {
                        const prevDx = stroke.points[i - 1].x - stroke.points[i - 2].x;
                        const prevDy = stroke.points[i - 1].y - stroke.points[i - 2].y;
                        const prevDistance = Math.sqrt(prevDx * prevDx + prevDy * prevDy);

                        // Calculate angle change
                        const dotProduct = (dx * prevDx + dy * prevDy) / (distance * prevDistance);
                        straightness += Math.max(0, dotProduct); // Cosine of angle
                    }
                }

                // Score based on stroke length (should be reasonable for kanji)
                const expectedStrokeLength = 50 + Math.random() * 50; // 50-100 pixels
                const lengthScore = Math.max(0, 15 - Math.abs(totalDistance - expectedStrokeLength) / 5);
                strokeQuality += lengthScore;

                // Score based on straightness
                straightness = straightness / (stroke.points.length - 2);
                qualityScore += straightness * 5;

                totalStrokeQuality += strokeQuality;
                strokeCount++;
            }
        });

        if (strokeCount > 0) {
            qualityScore = (totalStrokeQuality / strokeCount) * 10;
            calculatedScore += Math.min(15, qualityScore);
        }

        setScore(Math.round(calculatedScore));
        setShowScore(true);
    };

    // Helper function to check stroke order (much stricter)
    const checkStrokeOrder = (strokes: Array<{ points: Array<{ x: number, y: number }> }>) => {
        if (strokes.length < 2) return true;

        let orderScore = 0;
        let maxDistance = 0;

        for (let i = 1; i < strokes.length; i++) {
            const previousEnd = strokes[i - 1].points[strokes[i - 1].points.length - 1];
            const currentStart = strokes[i].points[0];
            const distance = Math.sqrt(
                Math.pow(currentStart.x - previousEnd.x, 2) +
                Math.pow(currentStart.y - previousEnd.y, 2)
            );

            maxDistance = Math.max(maxDistance, distance);

            // Much stricter distance check
            if (distance > 80) {
                orderScore -= 10;
            } else if (distance > 50) {
                orderScore -= 5;
            } else if (distance < 30) {
                orderScore += 5; // Good continuity
            }
        }

        // Also check if strokes overlap too much (bad sign)
        let overlapCount = 0;
        for (let i = 0; i < strokes.length; i++) {
            for (let j = i + 1; j < strokes.length; j++) {
                const stroke1 = strokes[i];
                const stroke2 = strokes[j];

                // Check if strokes overlap significantly
                for (const point1 of stroke1.points) {
                    for (const point2 of stroke2.points) {
                        const distance = Math.sqrt(
                            Math.pow(point1.x - point2.x, 2) +
                            Math.pow(point1.y - point2.y, 2)
                        );
                        if (distance < 10) {
                            overlapCount++;
                            break;
                        }
                    }
                }
            }
        }

        if (overlapCount > 20) {
            orderScore -= 15; // Too much overlap
        }

        return orderScore >= 0 && maxDistance < 100;
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
                        <span className="text-2xl font-bold mr-2 font-kosugi">{kanji.character}</span>
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
            styles={{
                body: { paddingTop: '16px' },
                header: { marginBottom: '8px' }
            }}
            style={{ top: 20 }}
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
                                    <div className="text-6xl font-bold text-secondary-700 dark:text-secondary-400 mb-2 font-kosugi">{kanji.character}</div>
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
                                        <p className="text-sm text-secondary-600 dark:text-secondary-800 mt-2">
                                            {kanji.memory_tip || kanji.image_explanation || 'Chưa có cách nhớ'}
                                        </p>
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Drawing Canvas */}
                        <div className="space-y-4">
                            <Card title="Luyện viết" className="text-center">
                                <div className="flex justify-center items-center">
                                    <canvas
                                        ref={canvasRef}
                                        className="border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-crosshair bg-white dark:bg-gray-800"
                                        style={{
                                            touchAction: 'none',
                                            width: '300px',
                                            height: '300px',
                                            display: 'block'
                                        }}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    />
                                </div>
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
                                            <div className="hint-writer-container mb-4 flex justify-center border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
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
                </Tabs.TabPane>
            </Tabs>
        </Modal >
    );
};

export default KanjiModal;
