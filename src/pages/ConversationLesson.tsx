import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Spin, message, Tooltip, Tabs, Progress, Divider, Tag, Row, Col, Drawer, Badge, Space } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, BookOutlined, EditOutlined, CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { Grid } from 'antd';
import { ConversationLesson, DialogueLine, DictationExercise, MCQExercise, ReorderExercise, conversationLessonAPI } from '../services/conversationLessonAPI';

// Import components
import ConversationDialogue from '../components/conversation/ConversationDialogue';
import DictationExerciseComponent from '../components/conversation/DictationExercise';
import ListeningMCQ from '../components/conversation/ListeningMCQ';
import SentenceReorder from '../components/conversation/SentenceReorder';

const { Title, Text } = Typography;

const EXERCISE_ORDER = ['dialogue', 'dictation', 'comprehension', 'reorder'] as const;
type ExerciseKey = (typeof EXERCISE_ORDER)[number];
const isExerciseKey = (value: string): value is ExerciseKey =>
    (EXERCISE_ORDER as readonly string[]).includes(value);

const ConversationLessonPage: React.FC = () => {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();
    const screens = Grid.useBreakpoint();
    const [messageApi, contextHolder] = message.useMessage();

    // State
    const [lesson, setLesson] = useState<ConversationLesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dialogue');
    const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);


    useEffect(() => {
        if (lessonId) {
            loadLesson(lessonId);
        }
    }, [lessonId]);

    const loadLesson = async (id: string) => {
        try {
            setLoading(true);
            const response = await conversationLessonAPI.getLessonById(id);
            if (response.success) {
                setLesson(response.data);
            } else {
                messageApi.error('Không thể tải bài học');
            }
        } catch (error) {
            console.error('Error loading lesson:', error);
            messageApi.error('Không thể tải bài học. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const getExerciseName = (type: string) => {
        const names: { [key: string]: string } = {
            'dialogue': 'Hội thoại',
            'dictation': 'Bài tập nghe-viết',
            'comprehension': 'Bài tập đọc-hiểu',
            'reorder': 'Bài tập sắp xếp câu'
        };
        return names[type] || type;
    };

    const handleExerciseComplete = useCallback((type: string, data: any) => {
        if (!isExerciseKey(type)) return;

        let wasAlreadyCompleted = false;
        setCompletedExercises((prev) => {
            wasAlreadyCompleted = prev.has(type);
            if (wasAlreadyCompleted) return prev;
            const next = new Set(prev);
            next.add(type);
            return next;
        });

        if (!wasAlreadyCompleted) {
            messageApi.success(`Hoàn thành ${getExerciseName(type)}`);
        }

    }, [messageApi]);

    const getExerciseIcon = (type: string) => {
        const icons: { [key: string]: React.ReactNode } = {
            'dialogue': <PlayCircleOutlined />,
            'dictation': <EditOutlined />,
            'comprehension': <BookOutlined />,
            'reorder': <EditOutlined />
        };
        return icons[type] || <BookOutlined />;
    };


    const handleProgressCallback = useCallback((current: number, total: number) => {
        console.log(`Progress: ${current}/${total}`);
    }, []);

    // Define tab items with responsive labels
    const tabItems = [
        {
            key: 'dialogue',
            label: screens.xs ? 'Hội thoại' : (
                <span>
                    <PlayCircleOutlined />
                    <span className="ml-1">Hội thoại</span>
                </span>
            ),
            children: (
                <ConversationDialogue
                    dialogue={lesson?.dialogue || []}
                    onStepComplete={() => handleExerciseComplete('dialogue', {})}
                    autoPlay={false}
                />
            ),
        },
        {
            key: 'dictation',
            label: screens.xs ? 'Nghe-viết' : (
                <span>
                    <EditOutlined />
                    <span className="ml-1">Nghe - viết</span>
                </span>
            ),
            children: (
                <DictationExerciseComponent
                    exercises={lesson?.exercises?.dictation || []}
                    dialogue={lesson?.dialogue || []}
                    onSubmit={(answers) => handleExerciseComplete('dictation', answers)}
                    onProgress={handleProgressCallback}
                />
            ),
        },
        {
            key: 'comprehension',
            label: screens.xs ? 'Đọc-hiểu' : (
                <span>
                    <BookOutlined />
                    <span className="ml-1">Đọc hiểu</span>
                </span>
            ),
            children: (
                <ListeningMCQ
                    exercises={lesson?.exercises?.comprehension_mcq || []}
                    variant="reading"
                    onSubmit={(answers) => handleExerciseComplete('comprehension', answers)}
                    onProgress={handleProgressCallback}
                />
            ),
        },
        {
            key: 'reorder',
            label: screens.xs ? 'Sắp xếp' : (
                <span>
                    <EditOutlined />
                    <span className="ml-1">Sắp xếp</span>
                </span>
            ),
            children: (
                <SentenceReorder
                    exercises={lesson?.exercises?.reorder || []}
                    onSubmit={(answers) => handleExerciseComplete('reorder', answers)}
                    onProgress={handleProgressCallback}
                />
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-full">
                <Spin size="large" />
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="flex justify-center items-center min-h-full">
                <Card className="text-center py-8">
                    <Text type="secondary">Không tìm thấy bài học</Text>
                    <Button type="primary" className="mt-4" onClick={() => navigate('/conversation')}>
                        Quay lại
                    </Button>
                </Card>
            </div>
        );
    }


    return (
            <div className="min-h-full overflow-x-hidden">
            {contextHolder}
            {/* Header - Responsive */}
            <div className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Tooltip title="Quay lại danh sách bài học">
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate('/conversation')}
                                    className="border-0 shadow-sm hover:shadow-md flex-shrink-0"
                                    size={screens.xs ? 'small' : 'middle'}
                                />
                            </Tooltip>
                            <div className="min-w-0 flex-1">
                                <Title level={screens.xs ? 5 : 3} className="!mb-1 text-secondary-900 dark:text-secondary-100 line-clamp-2">
                                    {lesson.lesson_title}
                                </Title>
                                <Text className={`${screens.xs ? 'text-xs' : 'text-sm'} text-slate-600 dark:text-secondary-400 line-clamp-1`}>
                                    {lesson.situation_vi}
                                </Text>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Mobile Progress Indicator */}
                            {screens.xs && (
                                <div className="flex items-center gap-2 mr-2">
                                    <Badge count={completedExercises.size} size="small">
                                        <TrophyOutlined className="text-lg text-yellow-500" />
                                    </Badge>
                                    <Text className="text-xs text-slate-600 dark:text-secondary-400">
                                        {completedExercises.size}/4
                                    </Text>
                                </div>
                            )}

                            {/* Tags - Responsive */}
                            <Space size={screens.xs ? 'small' : 'middle'} wrap>
                                <Tag color="blue" className={screens.xs ? 'text-xs' : ''}>{lesson.level}</Tag>
                                {!screens.xs && (
                                    <Tag color="green">
                                        <ClockCircleOutlined className="mr-1" />
                                        {lesson.estimated_duration} phút
                                    </Tag>
                                )}
                                <Tag color="orange" className={screens.xs ? 'text-xs' : ''}>
                                    {screens.xs ? `${lesson.difficulty}/5` : `Độ khó: ${lesson.difficulty}/5`}
                                </Tag>
                            </Space>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Progress Button */}
            {screens.xs && (
                <div className="sticky top-14 z-20 bg-white dark:bg-secondary-900 border-b px-4 py-2">
                    <Button
                        type="primary"
                        icon={<TrophyOutlined />}
                        onClick={() => setMobileDrawerVisible(true)}
                        className="w-full"
                        size="small"
                    >
                        Tiến độ: {completedExercises.size}/4
                    </Button>
                </div>
            )}

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={16}>
                        <Card className="shadow-sm" styles={{ body: { padding: screens.xs ? '12px' : '24px' } }}>
                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                items={tabItems}
                                size={screens.xs ? 'small' : 'middle'}
                            />
                        </Card>
                    </Col>
                    {!screens.xs && (
                        <Col xs={24} lg={8}>
                            <Card className="mb-4 shadow-sm" title="Tiến độ học tập">
                                <Progress percent={Math.round((completedExercises.size / 4) * 100)} />
                                <div className="mt-4 space-y-2">
                                    {['dialogue', 'dictation', 'comprehension', 'reorder'].map(key => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                {getExerciseIcon(key)}
                                                <Text className={completedExercises.has(key) ? 'line-through' : ''}>
                                                    {getExerciseName(key)}
                                                </Text>
                                            </span>
                                            {completedExercises.has(key) && <CheckCircleOutlined className="text-green-500" />}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </Col>
                    )}
                </Row>
            </div>

            {/* Mobile Progress Drawer */}
            <Drawer
                title="Tiến độ học tập"
                placement="bottom"
                onClose={() => setMobileDrawerVisible(false)}
                open={mobileDrawerVisible}
                size="large"
                styles={{ wrapper: { height: '70vh' } }}
            >
                <div className="p-4">
                    <Progress type="circle" percent={Math.round((completedExercises.size / 4) * 100)} size={80} />
                    <div className="mt-4 space-y-3">
                        {['dialogue', 'dictation', 'comprehension', 'reorder'].map(key => (
                            <div key={key} className="flex items-center justify-between p-3 border rounded">
                                <span className="flex items-center gap-2">
                                    {getExerciseIcon(key)}
                                    <Text strong>{getExerciseName(key)}</Text>
                                </span>
                                {completedExercises.has(key) && <CheckCircleOutlined className="text-green-500" />}
                            </div>
                        ))}
                    </div>
                </div>
            </Drawer>
        </div>
    );
};

export default ConversationLessonPage;
