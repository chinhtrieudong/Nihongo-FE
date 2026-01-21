import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonAPI } from '../services/api';
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    SoundOutlined,
    EditOutlined,
    ReadOutlined,
    QuestionCircleOutlined,
    RobotOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    LeftOutlined,
    RightOutlined,
    BookOutlined,
    FormOutlined,
    AudioOutlined,
    BulbOutlined
} from '@ant-design/icons';
import { Collapse, Card, Button, Input, Select, Tabs, Space, Divider, Tag } from 'antd';

const { Panel } = Collapse;
const { TabPane } = Tabs;

// Utility functions to transform backend data
const getSimpleReadings = (kanjiData: KanjiData) => ({
    onyomi: kanjiData.onyomi.map(o => o.kana),
    kunyomi: kanjiData.kunyomi.map(k => k.kana),
    onyomiWithRomaji: kanjiData.onyomi.map(o => `${o.kana} (${o.romaji})`),
    kunyomiWithRomaji: kanjiData.kunyomi.map(k => `${k.kana} (${k.romaji})`)
});

const getSimpleWords = (kanjiData: KanjiData) =>
    kanjiData.vocabulary_examples.map(v => ({
        word: v.word,
        reading: v.hiragana,
        romaji: v.romaji,
        hanviet: v.hanviet,
        meaning: v.meaning_vi,
        example: v.example_jp,
        exampleVi: v.example_vi,
        audio_url: v.audio_url
    }));

const getJLPTColor = (level: string) => {
    switch (level) {
        case 'N5': return 'green';
        case 'N4': return 'blue';
        case 'N3': return 'orange';
        case 'N2': return 'red';
        case 'N1': return 'purple';
        default: return 'default';
    }
};

// Backend response interfaces
interface OnyomiReading {
    kana: string;
    romaji: string;
    _id?: string;
}

interface KunyomiReading {
    kana: string;
    romaji: string;
    _id?: string;
}

interface Radical {
    symbol: string;
    hanviet: string;
    name_vi: string;
    meaning: string;
}

interface KanjiAnalysis {
    component: string;
    hanviet: string;
    role: string;
    meaning: string;
    position: string;
    _id?: string;
}

interface VocabularyExample {
    word: string;
    hiragana: string;
    romaji: string;
    hanviet: string;
    meaning_vi: string;
    example_jp: string;
    example_vi: string;
    audio_url: string;
    _id?: string;
}

// Main KanjiData interface matching backend
interface KanjiData {
    _id: string;
    character: string;
    hanviet: string;
    meaning_vi: string;
    onyomi: OnyomiReading[];
    kunyomi: KunyomiReading[];
    stroke_count: number;
    jlpt_level: string;
    frequency: string;
    radical: Radical;
    structure: string;
    image_explanation: string;
    kanji_analysis: KanjiAnalysis[];
    vocabulary_examples: VocabularyExample[];
    category: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface KanjiDetailProps {
    lessonId?: string;
}

const KanjiDetail: React.FC<KanjiDetailProps> = ({ lessonId: propLessonId }) => {
    const { kanji, lessonId: urlLessonId } = useParams();
    const navigate = useNavigate();

    const lessonId = propLessonId || urlLessonId;

    const [kanjiData, setKanjiData] = useState<KanjiData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentMode, setCurrentMode] = useState<'learn' | 'write' | 'read' | 'quiz' | 'ai'>('learn');
    const [showAnswer, setShowAnswer] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [strokeSpeed, setStrokeSpeed] = useState(1);
    const [currentStroke, setCurrentStroke] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLesson, setSelectedLesson] = useState(lessonId || 'all');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedRadical, setSelectedRadical] = useState('all');
    const [selectedStrokeCount, setSelectedStrokeCount] = useState('all');
    const [showRomaji, setShowRomaji] = useState(false); // New state for romaji toggle

    useEffect(() => {
        const fetchKanjiData = async () => {
            try {
                setLoading(true);
                let response;

                if (kanji) {
                    // Fetch specific kanji
                    response = await lessonAPI.getKanji(kanji);
                } else if (lessonId) {
                    // Fetch kanji for specific lesson
                    response = await lessonAPI.getLessonKanji(lessonId);
                } else {
                    // Fetch all kanji with filters
                    response = await lessonAPI.getAllKanji({
                        lesson: selectedLesson,
                        level: selectedLevel,
                        radical: selectedRadical,
                        strokeCount: selectedStrokeCount,
                        search: searchTerm
                    });
                }

                if (response.success) {
                    setKanjiData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch kanji data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchKanjiData();
    }, [kanji, lessonId, selectedLesson, selectedLevel, selectedRadical, selectedStrokeCount, searchTerm]);

    const handleKeyPress = (e: KeyboardEvent) => {
        switch (e.key) {
            case ' ':
                e.preventDefault();
                setShowAnswer(!showAnswer);
                break;
            case 'ArrowLeft':
                navigateKanji('prev');
                break;
            case 'ArrowRight':
                navigateKanji('next');
                break;
            case 'r':
                setCurrentMode('write');
                break;
            case 'a':
                setCurrentMode('read');
                break;
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showAnswer]);

    const navigateKanji = (direction: 'prev' | 'next') => {
        // Implementation for navigating between kanji
        console.log(`Navigate ${direction}`);
    };

    const playStrokeOrder = () => {
        setIsPlaying(!isPlaying);
        // Implementation for stroke order animation
    };

    const handleSpeechRecognition = () => {
        // Implementation for speech recognition
        console.log('Start speech recognition');
    };

    const askAI = () => {
        // Implementation for AI explanation
        console.log('Ask AI about kanji');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!kanjiData) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">漢</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Không tìm thấy Hán tự</h3>
                <p className="text-gray-600">Vui lòng kiểm tra lại đường dẫn hoặc thử tìm kiếm Hán tự khác.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Kanji List Panel */}
                <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Bộ lọc</h3>

                        {/* Lesson Filter */}
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bài học</label>
                            <Select
                                value={selectedLesson}
                                onChange={setSelectedLesson}
                                className="w-full"
                                placeholder="Chọn bài học"
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
                                {Array.from({ length: 50 }, (_, i) => (
                                    <Select.Option key={i + 1} value={i + 1}>Bài {i + 1}</Select.Option>
                                ))}
                            </Select>
                        </div>

                        {/* JLPT Level Filter */}
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ JLPT</label>
                            <Select
                                value={selectedLevel}
                                onChange={setSelectedLevel}
                                className="w-full"
                                placeholder="Chọn trình độ"
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
                                <Select.Option value="N5">N5</Select.Option>
                                <Select.Option value="N4">N4</Select.Option>
                                <Select.Option value="N3">N3</Select.Option>
                                <Select.Option value="N2">N2</Select.Option>
                                <Select.Option value="N1">N1</Select.Option>
                            </Select>
                        </div>

                        {/* Stroke Count Filter */}
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số nét</label>
                            <Select
                                value={selectedStrokeCount}
                                onChange={setSelectedStrokeCount}
                                className="w-full"
                                placeholder="Chọn số nét"
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
                                {Array.from({ length: 20 }, (_, i) => (
                                    <Select.Option key={i + 1} value={i + 1}>{i + 1} nét</Select.Option>
                                ))}
                            </Select>
                        </div>

                        {/* Search */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                            <Input
                                placeholder="Hán tự, Hán Việt, nghĩa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Kanji List */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Danh sách Hán tự</h3>
                        <div className="space-y-2">
                            {/* This would be populated with filtered kanji list */}
                            <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <div className="text-2xl font-bold text-gray-800">{kanjiData.character}</div>
                                <div className="text-sm text-purple-600">{kanjiData.hanviet}</div>
                                <div className="text-xs text-gray-600">{kanjiData.meaning_vi}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    icon={<LeftOutlined />}
                                    onClick={() => navigateKanji('prev')}
                                />
                                <Button
                                    icon={<RightOutlined />}
                                    onClick={() => navigateKanji('next')}
                                />
                                <h1 className="text-2xl font-bold text-gray-800">Học Hán tự: {kanjiData.character}</h1>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    icon={showAnswer ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                    onClick={() => setShowAnswer(!showAnswer)}
                                >
                                    {showAnswer ? 'Ẩn' : 'Hiện'} đáp án
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => setShowRomaji(!showRomaji)}
                                >
                                    {showRomaji ? 'Ẩn' : 'Hiện'} Romaji
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Learning Modes Tabs */}
                    <Tabs activeKey={currentMode} onChange={(key: string) => setCurrentMode(key as any)} className="mb-6">
                        <TabPane tab={<span><BookOutlined />Học chữ</span>} key="learn" />
                        <TabPane tab={<span><EditOutlined />Viết</span>} key="write" />
                        <TabPane tab={<span><AudioOutlined />Đọc</span>} key="read" />
                        <TabPane tab={<span><QuestionCircleOutlined />Nhớ mặt chữ</span>} key="quiz" />
                        <TabPane tab={<span><RobotOutlined />Hỏi AI</span>} key="ai" />
                    </Tabs>

                    {/* Learn Mode Content */}
                    {currentMode === 'learn' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Core Info */}
                            <div className="space-y-4">
                                <Card title="Thông tin cơ bản" className="h-fit">
                                    <div className="text-center mb-4">
                                        <div className="text-6xl font-bold text-gray-800 mb-2">{kanjiData.character}</div>
                                        <div className="text-xl text-purple-600 font-medium">{kanjiData.hanviet}</div>
                                        <div className="text-lg text-gray-600">{kanjiData.meaning_vi}</div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Onyomi:</span>
                                            <span>{getSimpleReadings(kanjiData).onyomi.join(', ')}</span>
                                        </div>
                                        {showRomaji && (
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span></span>
                                                <span>{getSimpleReadings(kanjiData).onyomiWithRomaji.join(', ')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="font-medium">Kunyomi:</span>
                                            <span>{getSimpleReadings(kanjiData).kunyomi.join(', ')}</span>
                                        </div>
                                        {showRomaji && (
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span></span>
                                                <span>{getSimpleReadings(kanjiData).kunyomiWithRomaji.join(', ')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="font-medium">Số nét:</span>
                                            <span>{kanjiData.stroke_count}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">JLPT:</span>
                                            <Tag color={getJLPTColor(kanjiData.jlpt_level)}>
                                                {kanjiData.jlpt_level}
                                            </Tag>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Tần suất:</span>
                                            <span>{kanjiData.frequency}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Danh mục:</span>
                                            <Tag>{kanjiData.category}</Tag>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <Button
                                            size="small"
                                            onClick={() => setShowRomaji(!showRomaji)}
                                        >
                                            {showRomaji ? 'Ẩn' : 'Hiện'} Romaji
                                        </Button>
                                    </div>
                                </Card>

                                <Card title="Bộ thủ & Cấu tạo" className="h-fit">
                                    <Collapse>
                                        <Panel header={`Bộ thủ: ${kanjiData.radical.symbol} - ${kanjiData.radical.name_vi}`} key="radical">
                                            <p><strong>Ký hiệu:</strong> {kanjiData.radical.symbol}</p>
                                            <p><strong>Tên Hán Việt:</strong> {kanjiData.radical.hanviet}</p>
                                            <p><strong>Tên tiếng Việt:</strong> {kanjiData.radical.name_vi}</p>
                                            <p><strong>Nghĩa:</strong> {kanjiData.radical.meaning}</p>
                                        </Panel>
                                        <Panel header="Cấu tạo chữ" key="structure">
                                            <p>{kanjiData.structure}</p>
                                            <p className="text-sm text-gray-600 mt-2">{kanjiData.image_explanation}</p>
                                        </Panel>
                                        <Panel header="Phân tích chi tiết" key="analysis">
                                            <div className="space-y-2">
                                                {kanjiData.kanji_analysis.map((analysis, index) => (
                                                    <div key={index} className="p-2 border border-gray-200 rounded">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">{analysis.component}</span>
                                                            <Tag>{analysis.role}</Tag>
                                                        </div>
                                                        <div className="text-sm text-gray-600">{analysis.hanviet} - {analysis.meaning}</div>
                                                        <div className="text-xs text-gray-500">Vị trí: {analysis.position}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Panel>
                                    </Collapse>
                                </Card>
                            </div>

                            {/* Right Column - Stroke Order & Vocabulary */}
                            <div className="space-y-4">
                                <Card title="Thứ tự nét" className="h-fit">
                                    <div className="text-center mb-4">
                                        <div className="text-4xl font-bold text-gray-800 mb-4">{kanjiData.character}</div>
                                        <div className="flex justify-center items-center space-x-4">
                                            <Button
                                                icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                                                onClick={playStrokeOrder}
                                            >
                                                {isPlaying ? 'Dừng' : 'Phát'}
                                            </Button>
                                            <Select
                                                value={strokeSpeed}
                                                onChange={setStrokeSpeed}
                                                className="w-24"
                                            >
                                                <Select.Option value={0.5}>0.5x</Select.Option>
                                                <Select.Option value={1}>1x</Select.Option>
                                                <Select.Option value={1.5}>1.5x</Select.Option>
                                                <Select.Option value={2}>2x</Select.Option>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="text-center text-sm text-gray-600">
                                        Nét thứ {currentStroke + 1} / {kanjiData.stroke_count}
                                    </div>
                                </Card>

                                <Card title="Từ vựng sử dụng" className="h-fit">
                                    <div className="space-y-2">
                                        {getSimpleWords(kanjiData).map((word, index) => (
                                            <div key={index} className="p-2 border border-gray-200 rounded">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="font-medium">{word.word}</div>
                                                        <div className="text-sm text-gray-600">{word.reading}</div>
                                                        {showRomaji && (
                                                            <div className="text-xs text-gray-500">{word.romaji}</div>
                                                        )}
                                                        <div className="text-sm text-purple-600">{word.hanviet}</div>
                                                        <div className="text-sm">{word.meaning}</div>
                                                        {word.example && (
                                                            <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                                                                <div className="text-gray-700">{word.example}</div>
                                                                <div className="text-gray-600">{word.exampleVi}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {word.audio_url && (
                                                        <Button
                                                            icon={<SoundOutlined />}
                                                            size="small"
                                                            onClick={() => console.log('Play audio:', word.audio_url)}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Write Mode */}
                    {currentMode === 'write' && (
                        <Card title="Luyện viết Hán tự">
                            <div className="text-center">
                                <div className="mb-4">
                                    <canvas
                                        width={400}
                                        height={400}
                                        className="border-2 border-gray-300 rounded-lg mx-auto"
                                        style={{ touchAction: 'none' }}
                                    />
                                </div>
                                <div className="space-x-2">
                                    <Button type="primary">Kiểm tra</Button>
                                    <Button>Xóa</Button>
                                    <Button icon={<EyeOutlined />}>Hiện gợi ý</Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Read Mode */}
                    {currentMode === 'read' && (
                        <Card title="Luyện đọc Hán tự">
                            <div className="text-center">
                                <div className="text-6xl font-bold text-gray-800 mb-6">{kanjiData.character}</div>
                                <div className="mb-4">
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<AudioOutlined />}
                                        onClick={handleSpeechRecognition}
                                    >
                                        Bắt đầu ghi âm
                                    </Button>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Nhấn nút và đọc to Hán tự trên. Hệ thống sẽ nhận diện và đánh giá phát âm của bạn.
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Quiz Mode */}
                    {currentMode === 'quiz' && (
                        <Card title="Kiểm tra kiến thức">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Bộ thủ của {kanjiData.character} là gì?</h3>
                                    <Input placeholder="Nhập bộ thủ..." />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Hán Việt của {kanjiData.character} là gì?</h3>
                                    <Input placeholder="Nhập Hán Việt..." />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Nghĩa của {kanjiData.character} là gì?</h3>
                                    <Input placeholder="Nhập nghĩa..." />
                                </div>
                                <Button type="primary" className="w-full">Kiểm tra đáp án</Button>
                            </div>
                        </Card>
                    )}

                    {/* AI Mode */}
                    {currentMode === 'ai' && (
                        <Card title="Hỏi AI về Hán tự">
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium mb-2">
                                        <BulbOutlined /> Gợi ý câu hỏi:
                                    </h3>
                                    <div className="space-y-2">
                                        <Button block onClick={() => askAI()}>
                                            Giải thích {kanjiData.character} cho người mới bắt đầu
                                        </Button>
                                        <Button block onClick={() => askAI()}>
                                            Tại sao {kanjiData.character} lại có nghĩa là "{kanjiData.meaning_vi}"?
                                        </Button>
                                        <Button block onClick={() => askAI()}>
                                            Cho ví dụ thực tế sử dụng {kanjiData.character}
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <Input.TextArea
                                        rows={4}
                                        placeholder="Nhập câu hỏi của bạn về Hán tự này..."
                                    />
                                    <Button type="primary" className="mt-2" icon={<RobotOutlined />}>
                                        Gửi câu hỏi
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KanjiDetail;
