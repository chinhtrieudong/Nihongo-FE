import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Spin, message, Tooltip, Tabs, Progress, Divider, Tag, Row, Col } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, BookOutlined, SoundOutlined, EditOutlined, AudioOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { ConversationLesson, DialogueLine, DictationExercise, MCQExercise, ReorderExercise, RoleplayExercise, ShadowingExercise, ReactionSpeakingExercise, conversationLessonAPI } from '../services/conversationLessonAPI';

// Import components
import ConversationDialogue from '../components/conversation/ConversationDialogue';
import DictationExerciseComponent from '../components/conversation/DictationExercise';
import ListeningMCQ from '../components/conversation/ListeningMCQ';
import SentenceReorder from '../components/conversation/SentenceReorder';
import RolePlay from '../components/conversation/RolePlay';
import ShadowingTrainer from '../components/conversation/ShadowingTrainer';
import SituationResponse from '../components/conversation/SituationResponse';

const { Title, Text } = Typography;

const ConversationLessonPage: React.FC = () => {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();

    // State
    const [lesson, setLesson] = useState<ConversationLesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dialogue');
    const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());


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
                message.error('Không thể tải bài học');
            }
        } catch (error) {
            console.error('Error loading lesson:', error);
            message.error('Không thể tải bài học. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleExerciseComplete = useCallback((type: string, data: any) => {
        setCompletedExercises(prev => new Set(Array.from(prev).concat(type)));
        message.success(`Hoàn thành ${getExerciseName(type)}`);
    }, []);


    const getExerciseName = (type: string) => {
        const names: { [key: string]: string } = {
            'dialogue': 'Hội thoại',
            'dictation': 'Bài tập nghe-viết',
            'comprehension': 'Bài tập đọc-hiểu',
            'reorder': 'Bài tập sắp xếp câu',
            'roleplay': 'Bài tập đóng vai',
            'shadowing': 'Bài tập shadowing',
            'reaction': 'Bài tập phản xạ'
        };
        return names[type] || type;
    };

    const getExerciseIcon = (type: string) => {
        const icons: { [key: string]: React.ReactNode } = {
            'dialogue': <PlayCircleOutlined />,
            'dictation': <EditOutlined />,
            'comprehension': <BookOutlined />,
            'reorder': <EditOutlined />,
            'roleplay': <UserOutlined />,
            'shadowing': <SoundOutlined />,
            'reaction': <AudioOutlined />
        };
        return icons[type] || <BookOutlined />;
    };


    const handleProgressCallback = useCallback((current: number, total: number) => {
        console.log(`Progress: ${current}/${total}`);
    }, []);

    // Define tab items
    const tabItems = [
        {
            key: 'dialogue',
            label: (
                <span>
                    <PlayCircleOutlined />
                    <span>Dialogue</span>
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
            label: (
                <span>
                    <EditOutlined />
                    <span>Dictation</span>
                </span>
            ),
            children: (
                <DictationExerciseComponent
                    exercises={lesson?.exercises?.dictation || []}
                    onSubmit={(answers) => handleExerciseComplete('dictation', answers)}
                    onProgress={handleProgressCallback}
                />
            ),
        },
        {
            key: 'comprehension',
            label: (
                <span>
                    <BookOutlined />
                    <span>Comprehension</span>
                </span>
            ),
            children: (
                <ListeningMCQ
                    exercises={lesson?.exercises?.comprehension_mcq || []}
                    onSubmit={(answers) => handleExerciseComplete('comprehension', answers)}
                    onProgress={handleProgressCallback}
                />
            ),
        },
        {
            key: 'reorder',
            label: (
                <span>
                    <EditOutlined />
                    <span>Sentence Reorder</span>
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
        {
            key: 'roleplay',
            label: (
                <span>
                    <UserOutlined />
                    <span>Role Play</span>
                </span>
            ),
            children: (
                <RolePlay
                    exercise={lesson?.exercises?.roleplay || {} as RoleplayExercise}
                    onSubmit={(role, audio) => handleExerciseComplete('roleplay', { role, audio })}
                    onProgress={handleProgressCallback}
                />
            ),
        },
        {
            key: 'shadowing',
            label: (
                <span>
                    <SoundOutlined />
                    <span>Shadowing</span>
                </span>
            ),
            children: (
                <ShadowingTrainer
                    exercises={lesson?.exercises?.shadowing || []}
                    dialogue={lesson?.dialogue || []}
                    onSubmit={(scores) => handleExerciseComplete('shadowing', scores)}
                    onProgress={handleProgressCallback}
                />
            ),
        },
        {
            key: 'reaction',
            label: (
                <span>
                    <AudioOutlined />
                    <span>Reaction</span>
                </span>
            ),
            children: (
                <SituationResponse
                    exercises={lesson?.exercises?.reaction_speaking || []}
                    onSubmit={(responses) => handleExerciseComplete('reaction', responses)}
                    onProgress={handleProgressCallback}
                />
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="flex justify-center items-center min-h-screen">
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
        <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
            {/* Header */}
            <div className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Tooltip title="Quay lại danh sách bài học">
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate('/conversation')}
                                    className="border-0 shadow-sm hover:shadow-md"
                                />
                            </Tooltip>
                            <div>
                                <Title level={3} className="!mb-1 text-secondary-900 dark:text-secondary-100">
                                    {lesson.lesson_title}
                                </Title>
                                <Text className="text-gray-600 dark:text-secondary-400">
                                    {lesson.situation_vi}
                                </Text>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Tag color="blue">{lesson.level}</Tag>
                            <Tag color="green">
                                <ClockCircleOutlined className="mr-1" />
                                {lesson.estimated_duration} phút
                            </Tag>
                            <Tag color="orange">
                                Độ khó: {lesson.difficulty}/5
                            </Tag>
                        </div>
                    </div>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card className="shadow-sm">
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={tabItems}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card className="mb-4 shadow-sm" title="Tiến độ học tập">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <Text>Các bài tập đã hoàn thành</Text>
                                    <Text strong>{completedExercises.size}/7</Text>
                                </div>
                                <Progress
                                    percent={Math.round((completedExercises.size / 7) * 100)}
                                    strokeColor={{
                                        '0%': '#108ee9',
                                        '100%': '#52c41a',
                                    }}
                                />
                            </div>

                            <Divider className="my-4" />

                            <div className="space-y-2">
                                <Text strong>Các bài tập:</Text>
                                {[
                                    { key: 'dialogue', name: 'Hội thoại' },
                                    { key: 'dictation', name: 'Nghe-viết' },
                                    { key: 'comprehension', name: 'Đọc-hiểu' },
                                    { key: 'reorder', name: 'Sắp xếp câu' },
                                    { key: 'roleplay', name: 'Đóng vai' },
                                    { key: 'shadowing', name: 'Shadowing' },
                                    { key: 'reaction', name: 'Phản xạ' }
                                ].map(exercise => (
                                    <div key={exercise.key} className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            {getExerciseIcon(exercise.key)}
                                            <Text className={completedExercises.has(exercise.key) ? 'line-through text-gray-500 dark:text-secondary-500' : ''}>
                                                {exercise.name}
                                            </Text>
                                        </span>
                                        {completedExercises.has(exercise.key) && (
                                            <CheckCircleOutlined className="text-green-500" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Study Tips */}
                    <Card className="shadow-sm" title="Mẹo học tập">
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <BookOutlined className="text-blue-500 mt-1" />
                                <div>
                                    <Text strong className="block">Nghe kỹ</Text>
                                    <Text className="text-sm text-gray-600 dark:text-secondary-400">
                                        Lắng nghe nhiều lần để nắm rõ ngữ điệu và cách phát âm
                                    </Text>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <SoundOutlined className="text-green-500 mt-1" />
                                <div>
                                    <Text strong className="block">Lặp lại</Text>
                                    <Text className="text-sm text-gray-600 dark:text-secondary-400">
                                        Luyện tập shadowing để cải thiện phát âm tự nhiên
                                    </Text>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <EditOutlined className="text-orange-500 mt-1" />
                                <div>
                                    <Text strong className="block">Ghi chú</Text>
                                    <Text className="text-sm text-gray-600 dark:text-secondary-400">
                                        Ghi lại các từ vựng và mẫu câu mới gặp
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ConversationLessonPage;
