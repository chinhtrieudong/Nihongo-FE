import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Spin, message, Tooltip, Tabs, Progress, Tag, Row, Col, Drawer, Badge, Space } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, BookOutlined, EditOutlined, CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined, AudioOutlined, ThunderboltOutlined, UserOutlined } from '@ant-design/icons';
import { Grid } from 'antd';
import { ConversationLesson, conversationLessonAPI } from '../services/conversationLessonAPI';

// Import components
import ConversationDialogue from '../components/conversation/ConversationDialogue';
import DictationExerciseComponent from '../components/conversation/DictationExercise';
import ListeningMCQ from '../components/conversation/ListeningMCQ';
import SentenceReorder from '../components/conversation/SentenceReorder';
import RolePlay from '../components/conversation/RolePlay';
import SituationResponse from '../components/conversation/SituationResponse';

const { Title, Text } = Typography;

const EXERCISE_ORDER = ['dialogue', 'dictation', 'comprehension', 'reorder', 'roleplay', 'reaction_speaking'] as const;
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
            console.log('Loading lesson with ID:', id);
            const response = await conversationLessonAPI.getLessonById(id);
            console.log('API Response:', response);
            
            if (response.success && response.data) {
                console.log('Lesson data:', response.data);
                console.log('Exercises:', response.data.exercises);
                setLesson(response.data);
            } else {
                console.error('API returned unsuccessful response:', response);
                messageApi.error('Không thể tải bài học');
            }
        } catch (error: any) {
            console.error('Error loading lesson:', error);
            const errorMessage = error?.message || 'Không thể tải bài học. Vui lòng thử lại.';
            messageApi.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getExerciseName = (type: string) => {
        const names: { [key: string]: string } = {
            'dialogue': 'Hội thoại',
            'dictation': 'Bài tập nghe-viết',
            'comprehension': 'Bài tập đọc-hiểu',
            'reorder': 'Bài tập sắp xếp câu',
            'roleplay': 'Đóng vai',
            'reaction_speaking': 'Phản xạ nói'
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

    const handleTabChange = useCallback((key: string) => {
        setActiveTab(key);
    }, []);

    const getExerciseIcon = (type: string) => {
        const icons: { [key: string]: React.ReactNode } = {
            'dialogue': <PlayCircleOutlined />,
            'dictation': <EditOutlined />,
            'comprehension': <BookOutlined />,
            'reorder': <EditOutlined />,
            'roleplay': <UserOutlined />,
            'reaction_speaking': <ThunderboltOutlined />
        };
        return icons[type] || <BookOutlined />;
    };


    const handleProgressCallback = useCallback((current: number, total: number) => {
        console.log(`Progress: ${current}/${total}`);
    }, []);

    // Get list of exercises that have data
    const getAvailableExercises = useCallback(() => {
        if (!lesson) return ['dialogue'];
        
        const available = ['dialogue']; // Always include dialogue
        
        if (lesson.exercises?.dictation && lesson.exercises.dictation.length > 0) {
            available.push('dictation');
        }
        if (lesson.exercises?.comprehension_mcq && lesson.exercises.comprehension_mcq.length > 0) {
            available.push('comprehension');
        }
        if (lesson.exercises?.reorder && lesson.exercises.reorder.length > 0) {
            available.push('reorder');
        }
        if (lesson.exercises?.roleplay && lesson.exercises.roleplay.roles && lesson.exercises.roleplay.roles.length > 0) {
            available.push('roleplay');
        }
        if (lesson.exercises?.reaction_speaking && lesson.exercises.reaction_speaking.length > 0) {
            available.push('reaction_speaking');
        }
        
        return available;
    }, [lesson]);

    // Define tab items with responsive labels - show all tabs
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
            children: lesson?.exercises?.dictation && lesson.exercises.dictation.length > 0 ? (
                <DictationExerciseComponent
                    exercises={lesson.exercises.dictation}
                    dialogue={lesson?.dialogue || []}
                    onSubmit={(answers) => handleExerciseComplete('dictation', answers)}
                    onProgress={handleProgressCallback}
                />
            ) : (
                <Card className="text-center py-8">
                    <Text type="secondary">Không có bài tập nghe-viết</Text>
                </Card>
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
            children: lesson?.exercises?.comprehension_mcq && lesson.exercises.comprehension_mcq.length > 0 ? (
                <ListeningMCQ
                    exercises={lesson.exercises.comprehension_mcq}
                    variant="reading"
                    onSubmit={(answers) => handleExerciseComplete('comprehension', answers)}
                    onProgress={handleProgressCallback}
                />
            ) : (
                <Card className="text-center py-8">
                    <Text type="secondary">Không có bài tập đọc-hiểu</Text>
                </Card>
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
            children: lesson?.exercises?.reorder && lesson.exercises.reorder.length > 0 ? (
                <SentenceReorder
                    exercises={lesson.exercises.reorder}
                    onSubmit={(answers) => handleExerciseComplete('reorder', answers)}
                    onProgress={handleProgressCallback}
                />
            ) : (
                <Card className="text-center py-8">
                    <Text type="secondary">Không có bài tập sắp xếp</Text>
                </Card>
            ),
        },
        {
            key: 'roleplay',
            label: screens.xs ? 'Đóng vai' : (
                <span>
                    <UserOutlined />
                    <span className="ml-1">Đóng vai</span>
                </span>
            ),
            children: lesson?.exercises?.roleplay ? (
                <RolePlay
                    exercise={lesson.exercises.roleplay}
                    onSubmit={(role, audioBlob) => handleExerciseComplete('roleplay', { role, audioBlob })}
                    onProgress={handleProgressCallback}
                />
            ) : (
                <Card className="text-center py-8">
                    <Text type="secondary">Không có bài tập đóng vai</Text>
                </Card>
            ),
        },
        {
            key: 'reaction_speaking',
            label: screens.xs ? 'Phản xạ' : (
                <span>
                    <ThunderboltOutlined />
                    <span className="ml-1">Phản xạ nói</span>
                </span>
            ),
            children: lesson?.exercises?.reaction_speaking && lesson.exercises.reaction_speaking.length > 0 ? (
                <SituationResponse
                    exercises={lesson.exercises.reaction_speaking}
                    onSubmit={(responses) => handleExerciseComplete('reaction_speaking', responses)}
                    onProgress={handleProgressCallback}
                />
            ) : (
                <Card className="text-center py-8">
                    <Text type="secondary">Không có bài tập phản xạ nói</Text>
                </Card>
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
                <div className="sticky top-14 z-20 bg-white dark:bg-secondary-900 border-b px-3 py-1">
                    <Button
                        type="text"
                        icon={<TrophyOutlined />}
                        onClick={() => setMobileDrawerVisible(true)}
                        className="w-full text-xs"
                        size="small"
                    >
                        {completedExercises.size}/6 bài tập
                    </Button>
                </div>
            )}

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={18}>
                        <Card className="shadow-sm" styles={{ body: { padding: screens.xs ? '12px' : '24px' } }}>
                            <Tabs
                                activeKey={activeTab}
                                onChange={handleTabChange}
                                items={tabItems}
                                size={screens.xs ? 'small' : 'middle'}
                            />
                        </Card>
                    </Col>
                    {!screens.xs && (
                        <Col xs={24} lg={6}>
                            <Card 
                                className="mb-4 shadow-sm" 
                                title={
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-semibold">Tiến độ</span>
                                        <Text type="secondary" className="text-sm">
                                            {completedExercises.size}/6
                                        </Text>
                                    </div>
                                }
                                size="small"
                            >
                                <Progress 
                                    percent={Math.round((completedExercises.size / 6) * 100)} 
                                    size="small"
                                    showInfo={false}
                                />
                                <div className="mt-3 space-y-2">
                                    {EXERCISE_ORDER.map(key => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                {getExerciseIcon(key)}
                                                <Text className={`${completedExercises.has(key) ? 'line-through text-green-600' : ''} text-sm`}>
                                                    {getExerciseName(key)}
                                                </Text>
                                            </span>
                                            {completedExercises.has(key) && <CheckCircleOutlined className="text-green-500 text-sm" />}
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
                size="default"
                styles={{ wrapper: { height: '50vh' } }}
            >
                <div className="p-3">
                    <Progress type="circle" percent={Math.round((completedExercises.size / 6) * 100)} size={60} />
                    <div className="mt-3 space-y-2">
                        {EXERCISE_ORDER.map(key => (
                            <div key={key} className="flex items-center justify-between p-2 border rounded text-sm">
                                <span className="flex items-center gap-2">
                                    {getExerciseIcon(key)}
                                    <Text strong className="text-sm">{getExerciseName(key)}</Text>
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
