import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    Button,
    Typography,
    Progress,
    Space,
    Divider,
    Radio,
    Input,
    message,
    Modal,
    Row,
    Col,
    Tag,
    Drawer,
    List,
    Badge,
    Tooltip,
    Alert,
    Affix
} from "antd";
import {
    ClockCircleOutlined,
    LeftOutlined,
    RightOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    StopOutlined,
    BookOutlined,
    FlagOutlined,
    EyeOutlined,
    QuestionCircleOutlined,
    FullscreenOutlined,
    CompressOutlined,
    SoundOutlined,
    FileTextOutlined
} from "@ant-design/icons";
import { jlptTests, type Test, type TestSection } from "../data/jlptTests";
import { sampleQuestions, type Question } from "../data/sampleQuestions";

const { Title, Text, Paragraph } = Typography;

interface TestAttempt {
    id: string;
    testId: string;
    startTime: Date;
    endTime?: Date;
    answers: Record<string, string | number>;
    score?: number;
    completed: boolean;
    currentSection?: number;
    currentQuestion?: number;
    flaggedQuestions?: string[];
    reviewedQuestions?: string[];
}

const TestDetail: React.FC = () => {
    const { testId, attempt } = useParams<{ testId: string; attempt: string }>();
    const navigate = useNavigate();

    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentAttempt, setCurrentAttempt] = useState<TestAttempt | null>(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | number>>({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTestActive, setIsTestActive] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showInstructionsModal, setShowInstructionsModal] = useState(true);
    const [showQuestionOverview, setShowQuestionOverview] = useState(false);
    const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
    const [reviewMode, setReviewMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Load test data and attempt
    useEffect(() => {
        if (testId) {
            const foundTest = jlptTests.find(t => t.id === testId);
            if (foundTest) {
                setTest(foundTest);
                setTimeRemaining(foundTest.duration * 60); // Convert minutes to seconds

                // Filter questions for this test
                const testQuestions = sampleQuestions.filter(q =>
                    q.level === foundTest.level &&
                    foundTest.sections.some(section => section.id === q.sectionId)
                ).slice(0, foundTest.questions);
                setQuestions(testQuestions);
            }
        }

        if (attempt) {
            const attemptData = localStorage.getItem(attempt);
            if (attemptData) {
                const parsedAttempt: TestAttempt = JSON.parse(attemptData);
                setCurrentAttempt(parsedAttempt);
                setAnswers(parsedAttempt.answers);
                if (parsedAttempt.currentSection !== undefined) {
                    setCurrentSectionIndex(parsedAttempt.currentSection);
                }
                if (parsedAttempt.currentQuestion !== undefined) {
                    setCurrentQuestionIndex(parsedAttempt.currentQuestion);
                }
            }
        }
    }, [testId, attempt]);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTestActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleSubmitTest();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTestActive, timeRemaining]);

    // Save progress
    useEffect(() => {
        if (currentAttempt && isTestActive) {
            const updatedAttempt = {
                ...currentAttempt,
                answers,
                currentSection: currentSectionIndex,
                currentQuestion: currentQuestionIndex
            };
            localStorage.setItem(attempt!, JSON.stringify(updatedAttempt));
        }
    }, [answers, currentSectionIndex, currentQuestionIndex, currentAttempt, attempt, isTestActive]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getCurrentSection = (): TestSection | null => {
        if (!test || currentSectionIndex >= test.sections.length) return null;
        return test.sections[currentSectionIndex];
    };

    const getCurrentQuestion = (): Question | null => {
        const section = getCurrentSection();
        if (!section) return null;

        const sectionQuestions = questions.filter(q => q.sectionId === section.id);
        if (currentQuestionIndex >= sectionQuestions.length) return null;

        return sectionQuestions[currentQuestionIndex];
    };

    const handleAnswerChange = (questionId: string, answer: string | number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleStartTest = () => {
        setIsTestActive(true);
        message.success("Bài thi đã bắt đầu!");
    };

    const handleNextQuestion = () => {
        const section = getCurrentSection();
        if (!section) return;

        const sectionQuestions = questions.filter(q => q.sectionId === section.id);

        if (currentQuestionIndex < sectionQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Move to next section
            if (currentSectionIndex < test!.sections.length - 1) {
                setCurrentSectionIndex(prev => prev + 1);
                setCurrentQuestionIndex(0);
            } else {
                // Test completed
                setShowSubmitModal(true);
            }
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        } else if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1);
            const prevSection = test!.sections[currentSectionIndex - 1];
            const prevSectionQuestions = questions.filter(q => q.sectionId === prevSection.id);
            setCurrentQuestionIndex(prevSectionQuestions.length - 1);
        }
    };

    const handleSubmitTest = () => {
        setIsTestActive(false);
        setShowSubmitModal(true);
    };

    const confirmSubmitTest = () => {
        if (!currentAttempt || !test) return;

        // Calculate score
        let correctAnswers = 0;
        questions.forEach(question => {
            if (answers[question.id] === question.correctAnswer) {
                correctAnswers++;
            }
        });

        const score = Math.round((correctAnswers / questions.length) * 100);

        // Update attempt
        const completedAttempt: TestAttempt = {
            ...currentAttempt,
            endTime: new Date(),
            score,
            completed: true
        };

        localStorage.setItem(attempt!, JSON.stringify(completedAttempt));

        // Update test in jlptTests
        const testIndex = jlptTests.findIndex(t => t.id === test.id);
        if (testIndex !== -1) {
            jlptTests[testIndex].completed = true;
            jlptTests[testIndex].score = score;
            jlptTests[testIndex].date = new Date().toISOString().split('T')[0];
        }

        message.success(`Bài thi đã hoàn thành! Điểm của bạn: ${score}%`);
        navigate(`/test-results/${test.id}`);
    };

    // Enhanced feature handlers
    const handleFlagQuestion = (questionId: string) => {
        setFlaggedQuestions(prev => {
            const newFlagged = prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId];

            // Update attempt with flagged questions
            if (currentAttempt) {
                const updatedAttempt = {
                    ...currentAttempt,
                    flaggedQuestions: newFlagged
                };
                localStorage.setItem(attempt!, JSON.stringify(updatedAttempt));
            }

            return newFlagged;
        });
    };

    const handleJumpToQuestion = (sectionIndex: number, questionIndex: number) => {
        setCurrentSectionIndex(sectionIndex);
        setCurrentQuestionIndex(questionIndex);
        setShowQuestionOverview(false);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleStartReview = () => {
        setReviewMode(true);
        setShowQuestionOverview(true);
    };

    const handleExitReview = () => {
        setReviewMode(false);
        setShowQuestionOverview(false);
    };

    const getQuestionStatus = (questionId: string) => {
        const hasAnswer = answers[questionId] !== undefined;
        const isFlagged = flaggedQuestions.includes(questionId);

        if (isFlagged) return 'flagged';
        if (hasAnswer) return 'answered';
        return 'unanswered';
    };

    const getQuestionStatusColor = (status: string) => {
        switch (status) {
            case 'answered': return 'green';
            case 'flagged': return 'orange';
            default: return 'default';
        }
    };

    const getQuestionStatusIcon = (status: string) => {
        switch (status) {
            case 'answered': return <CheckCircleOutlined />;
            case 'flagged': return <FlagOutlined />;
            default: return <QuestionCircleOutlined />;
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!isTestActive || showInstructionsModal) return;

            switch (e.key) {
                case 'ArrowLeft':
                    handlePreviousQuestion();
                    break;
                case 'ArrowRight':
                    handleNextQuestion();
                    break;
                case 'f':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        const question = getCurrentQuestion();
                        if (question) handleFlagQuestion(question.id);
                    }
                    break;
                case 'Escape':
                    if (showQuestionOverview) {
                        setShowQuestionOverview(false);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isTestActive, showInstructionsModal, showQuestionOverview, currentSectionIndex, currentQuestionIndex]);

    const renderQuestion = () => {
        const question = getCurrentQuestion();
        if (!question) return null;

        const isFlagged = flaggedQuestions.includes(question.id);

        switch (question.type) {
            case "multiple-choice":
                return (
                    <Card className="mb-4">
                        <div className="flex justify-between items-start mb-4">
                            <Title level={4} className="!mb-0">{question.question}</Title>
                            <Tooltip title={isFlagged ? "Bỏ đánh dấu" : "Đánh dấu câu hỏi"}>
                                <Button
                                    type={isFlagged ? "primary" : "default"}
                                    icon={<FlagOutlined />}
                                    onClick={() => handleFlagQuestion(question.id)}
                                    className={isFlagged ? "text-orange-500 border-orange-500" : ""}
                                />
                            </Tooltip>
                        </div>
                        <Radio.Group
                            value={answers[question.id]}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="w-full"
                        >
                            <Space direction="vertical" className="w-full">
                                {question.options?.map((option, index) => (
                                    <Radio key={index} value={index}>
                                        {option}
                                    </Radio>
                                ))}
                            </Space>
                        </Radio.Group>
                    </Card>
                );

            case "text-input":
                return (
                    <Card className="mb-4">
                        <div className="flex justify-between items-start mb-4">
                            <Title level={4} className="!mb-0">{question.question}</Title>
                            <Tooltip title={isFlagged ? "Bỏ đánh dấu" : "Đánh dấu câu hỏi"}>
                                <Button
                                    type={isFlagged ? "primary" : "default"}
                                    icon={<FlagOutlined />}
                                    onClick={() => handleFlagQuestion(question.id)}
                                    className={isFlagged ? "text-orange-500 border-orange-500" : ""}
                                />
                            </Tooltip>
                        </div>
                        <Input
                            value={answers[question.id] as string || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            placeholder="Nhập câu trả lời của bạn"
                            size="large"
                        />
                    </Card>
                );

            case "reading":
                return (
                    <Card className="mb-4">
                        <div className="flex justify-between items-start mb-4">
                            <Title level={4} className="!mb-0">{question.question}</Title>
                            <Tooltip title={isFlagged ? "Bỏ đánh dấu" : "Đánh dấu câu hỏi"}>
                                <Button
                                    type={isFlagged ? "primary" : "default"}
                                    icon={<FlagOutlined />}
                                    onClick={() => handleFlagQuestion(question.id)}
                                    className={isFlagged ? "text-orange-500 border-orange-500" : ""}
                                />
                            </Tooltip>
                        </div>
                        {question.readingText && (
                            <div className="mb-4 p-4 bg-gray-50 rounded">
                                <Paragraph>{question.readingText}</Paragraph>
                            </div>
                        )}
                        <Radio.Group
                            value={answers[question.id]}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="w-full"
                        >
                            <Space direction="vertical" className="w-full">
                                {question.options?.map((option, index) => (
                                    <Radio key={index} value={index}>
                                        {option}
                                    </Radio>
                                ))}
                            </Space>
                        </Radio.Group>
                    </Card>
                );

            case "listening":
                return (
                    <Card className="mb-4">
                        <div className="flex justify-between items-start mb-4">
                            <Title level={4} className="!mb-0">{question.question}</Title>
                            <Tooltip title={isFlagged ? "Bỏ đánh dấu" : "Đánh dấu câu hỏi"}>
                                <Button
                                    type={isFlagged ? "primary" : "default"}
                                    icon={<FlagOutlined />}
                                    onClick={() => handleFlagQuestion(question.id)}
                                    className={isFlagged ? "text-orange-500 border-orange-500" : ""}
                                />
                            </Tooltip>
                        </div>
                        <div className="text-center mb-4">
                            <Button
                                type="primary"
                                icon={<SoundOutlined />}
                                size="large"
                                onClick={() => message.info("Tính năng phát audio sẽ được triển khai sau")}
                            >
                                Nghe audio
                            </Button>
                        </div>
                        <Radio.Group
                            value={answers[question.id]}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="w-full"
                        >
                            <Space direction="vertical" className="w-full">
                                {question.options?.map((option, index) => (
                                    <Radio key={index} value={index}>
                                        {option}
                                    </Radio>
                                ))}
                            </Space>
                        </Radio.Group>
                    </Card>
                );

            default:
                return (
                    <Card className="mb-4">
                        <div className="flex justify-between items-start mb-4">
                            <Title level={4} className="!mb-0">{question.question}</Title>
                            <Tooltip title={isFlagged ? "Bỏ đánh dấu" : "Đánh dấu câu hỏi"}>
                                <Button
                                    type={isFlagged ? "primary" : "default"}
                                    icon={<FlagOutlined />}
                                    onClick={() => handleFlagQuestion(question.id)}
                                    className={isFlagged ? "text-orange-500 border-orange-500" : ""}
                                />
                            </Tooltip>
                        </div>
                        <Text type="secondary">Loại câu hỏi chưa được hỗ trợ</Text>
                    </Card>
                );
        }
    };

    if (!test) {
        return (
            <div className="p-6">
                <Text>Không tìm thấy bài thi</Text>
            </div>
        );
    }

    const currentSection = getCurrentSection();
    const currentQuestion = getCurrentQuestion();
    const totalQuestions = test.questions;
    const answeredQuestions = Object.keys(answers).length;
    const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    return (
        <div className="p-6 max-w-7xl mx-auto bg-secondary-50 dark:bg-secondary-950 min-h-screen">
            {/* Instructions Modal */}
            <Modal
                title="Hướng dẫn bài thi"
                open={showInstructionsModal}
                onCancel={() => setShowInstructionsModal(false)}
                footer={[
                    <Button key="cancel" onClick={() => navigate("/tests")}>
                        Quay lại
                    </Button>,
                    <Button key="start" type="primary" onClick={() => setShowInstructionsModal(false)}>
                        Bắt đầu làm bài
                    </Button>
                ]}
                width={800}
            >
                <div className="space-y-4">
                    <div className="flex items-start">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">1</div>
                        <div>
                            <Text strong>Thời gian làm bài</Text>
                            <div className="text-gray-600">{`${test.duration} phút cho tổng cộng ${test.questions} câu hỏi`}</div>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">2</div>
                        <div>
                            <Text strong>Cấu trúc bài thi</Text>
                            <div className="text-gray-600">{test.sections.map(s => s.name).join(", ")}</div>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">3</div>
                        <div>
                            <Text strong>Đánh dấu câu hỏi</Text>
                            <div className="text-gray-600">Sử dụng nút cờ để đánh dấu các câu hỏi cần xem lại</div>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">4</div>
                        <div>
                            <Text strong>Phím tắt</Text>
                            <div className="text-gray-600">← → để chuyển câu, Ctrl+F để đánh dấu, ESC để đóng cửa sổ</div>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">5</div>
                        <div>
                            <Text strong>Nộp bài</Text>
                            <div className="text-gray-600">Hoàn thành tất cả câu hỏi hoặc hết thời gian</div>
                        </div>
                    </div>
                </div>
                <Alert
                    message="Lưu ý quan trọng"
                    description="Bài thi sẽ tự động nộp khi hết thời gian. Đảm bảo kết nối internet ổn định."
                    type="warning"
                    showIcon
                    className="mt-4"
                />
            </Modal>

            {/* Question Overview Drawer */}
            <Drawer
                title={reviewMode ? "Xem lại câu trả lời" : "Tổng quan câu hỏi"}
                open={showQuestionOverview}
                onClose={reviewMode ? handleExitReview : () => setShowQuestionOverview(false)}
                width={400}
                extra={
                    reviewMode && (
                        <Button type="primary" onClick={handleExitReview}>
                            Thoát xem lại
                        </Button>
                    )
                }
            >
                <div className="space-y-4">
                    {test.sections.map((section, sectionIndex) => {
                        const sectionQuestions = questions.filter(q => q.sectionId === section.id);
                        return (
                            <div key={section.id}>
                                <div className="flex items-center mb-2">
                                    {React.createElement(section.icon as any)}
                                    <Text strong className="ml-2">{section.name}</Text>
                                    <Badge count={sectionQuestions.length} className="ml-auto" />
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {sectionQuestions.map((question, questionIndex) => {
                                        const status = getQuestionStatus(question.id);
                                        const isCurrent = sectionIndex === currentSectionIndex && questionIndex === currentQuestionIndex;
                                        return (
                                            <Tooltip key={question.id} title={`Câu ${questionIndex + 1} - ${status}`}>
                                                <Button
                                                    size="small"
                                                    type={isCurrent ? "primary" : "default"}
                                                    className={`
                                                        ${getQuestionStatusColor(status) === 'green' ? 'bg-green-100 border-green-500' : ''}
                                                        ${getQuestionStatusColor(status) === 'orange' ? 'bg-orange-100 border-orange-500' : ''}
                                                    `}
                                                    onClick={() => handleJumpToQuestion(sectionIndex, questionIndex)}
                                                >
                                                    {getQuestionStatusIcon(status)}
                                                </Button>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <Divider />

                <div className="space-y-2">
                    <div className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        <Text>Đã trả lời ({Object.keys(answers).length})</Text>
                    </div>
                    <div className="flex items-center">
                        <FlagOutlined className="text-orange-500 mr-2" />
                        <Text>Đã đánh dấu ({flaggedQuestions.length})</Text>
                    </div>
                    <div className="flex items-center">
                        <QuestionCircleOutlined className="text-gray-400 mr-2" />
                        <Text>Chưa trả lời ({totalQuestions - Object.keys(answers).length})</Text>
                    </div>
                </div>
            </Drawer>

            {/* Header */}
            <div className="mb-6">
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={2} className="!mb-2">{test.title}</Title>
                        <Text type="secondary">{test.description}</Text>
                    </Col>
                    <Col>
                        <Space direction="vertical" align="end">
                            <Space>
                                <Tag color="blue">{test.level}</Tag>
                                <Tag color="green">{test.difficulty}</Tag>
                            </Space>
                            <Space>
                                <Tooltip title="Toàn màn hình">
                                    <Button
                                        icon={isFullscreen ? <CompressOutlined /> : <FullscreenOutlined />}
                                        onClick={toggleFullscreen}
                                    />
                                </Tooltip>
                                <Tooltip title="Tổng quan câu hỏi">
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={() => setShowQuestionOverview(true)}
                                    />
                                </Tooltip>
                                {answeredQuestions > 0 && !reviewMode && (
                                    <Tooltip title="Xem lại câu trả lời">
                                        <Button
                                            icon={<BookOutlined />}
                                            onClick={handleStartReview}
                                        />
                                    </Tooltip>
                                )}
                            </Space>
                        </Space>
                    </Col>
                </Row>
            </div>

            {/* Test Info Bar */}
            <Card className="mb-6">
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space size="large">
                            <div>
                                <Text type="secondary">Thời gian</Text>
                                <div className={`flex items-center ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
                                    <ClockCircleOutlined className="mr-2" />
                                    <Text strong>{formatTime(timeRemaining)}</Text>
                                    {timeRemaining < 300 && <Tag color="red" className="ml-2">Sắp hết thời gian!</Tag>}
                                </div>
                            </div>
                            <div>
                                <Text type="secondary">Phần thi</Text>
                                <div>
                                    <Text strong>{currentSection?.name || 'Hoàn thành'}</Text>
                                </div>
                            </div>
                            <div>
                                <Text type="secondary">Câu hỏi</Text>
                                <div>
                                    <Text strong>{answeredQuestions}/{totalQuestions}</Text>
                                </div>
                            </div>
                            <div>
                                <Text type="secondary">Đánh dấu</Text>
                                <div>
                                    <Badge count={flaggedQuestions.length} />
                                </div>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            {!isTestActive && timeRemaining === test.duration * 60 && (
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<PlayCircleOutlined />}
                                    onClick={handleStartTest}
                                >
                                    Bắt đầu bài thi
                                </Button>
                            )}
                            {isTestActive && (
                                <>
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={() => setShowQuestionOverview(true)}
                                    >
                                        Tổng quan
                                    </Button>
                                    <Button
                                        danger
                                        size="large"
                                        icon={<StopOutlined />}
                                        onClick={handleSubmitTest}
                                    >
                                        Nộp bài
                                    </Button>
                                </>
                            )}
                        </Space>
                    </Col>
                </Row>
                <Progress percent={progress} className="mt-4" strokeColor={progress > 80 ? '#52c41a' : progress > 50 ? '#fa8c16' : '#f5222d'} />
            </Card>

            {/* Question Content */}
            {isTestActive && currentQuestion && (
                <Card>
                    <div className="mb-4 flex justify-between items-center">
                        <Space>
                            <Tag color="blue">Câu {currentQuestionIndex + 1}</Tag>
                            <Tag color="green">{currentSection?.name}</Tag>
                            {flaggedQuestions.includes(currentQuestion.id) && (
                                <Tag color="orange" icon={<FlagOutlined />}>Đã đánh dấu</Tag>
                            )}
                        </Space>
                        <Text type="secondary" className="text-sm">
                            Phím tắt: ← → chuyển câu | Ctrl+F đánh dấu | ESC đóng
                        </Text>
                    </div>

                    {renderQuestion()}

                    {/* Navigation */}
                    <Divider />
                    <Row justify="space-between">
                        <Col>
                            <Space>
                                <Button
                                    icon={<LeftOutlined />}
                                    onClick={handlePreviousQuestion}
                                    disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
                                >
                                    Câu trước
                                </Button>
                                <Button
                                    icon={<EyeOutlined />}
                                    onClick={() => setShowQuestionOverview(true)}
                                >
                                    Tổng quan
                                </Button>
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                <Tooltip title={flaggedQuestions.includes(currentQuestion.id) ? "Bỏ đánh dấu" : "Đánh dấu câu hỏi"}>
                                    <Button
                                        type={flaggedQuestions.includes(currentQuestion.id) ? "primary" : "default"}
                                        icon={<FlagOutlined />}
                                        onClick={() => handleFlagQuestion(currentQuestion.id)}
                                        className={flaggedQuestions.includes(currentQuestion.id) ? "text-orange-500 border-orange-500" : ""}
                                    >
                                        {flaggedQuestions.includes(currentQuestion.id) ? "Đã đánh dấu" : "Đánh dấu"}
                                    </Button>
                                </Tooltip>
                                <Button
                                    type="primary"
                                    icon={<RightOutlined />}
                                    onClick={handleNextQuestion}
                                >
                                    {currentSectionIndex === test.sections.length - 1 &&
                                        currentQuestionIndex === questions.filter(q => q.sectionId === currentSection?.id).length - 1
                                        ? 'Hoàn thành' : 'Câu tiếp theo'}
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            )}

            {!isTestActive && timeRemaining !== test.duration * 60 && (
                <Card>
                    <div className="text-center py-8">
                        <PlayCircleOutlined className="text-6xl text-blue-500 mb-4" />
                        <Title level={3}>Bài thi đã tạm dừng</Title>
                        <Paragraph>Nhấn nút "Bắt đầu bài thi" để tiếp tục</Paragraph>
                        <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={handleStartTest}>
                            Tiếp tục làm bài
                        </Button>
                    </div>
                </Card>
            )}

            {/* Submit Confirmation Modal */}
            <Modal
                title="Xác nhận nộp bài"
                open={showSubmitModal}
                onOk={confirmSubmitTest}
                onCancel={() => setShowSubmitModal(false)}
                okText="Nộp bài"
                cancelText="Tiếp tục làm bài"
            >
                <p>Bạn có chắc chắn muốn nộp bài không?</p>
                <p>Bạn đã trả lời {answeredQuestions}/{totalQuestions} câu hỏi.</p>
                {flaggedQuestions.length > 0 && (
                    <p>Bạn còn {flaggedQuestions.length} câu hỏi đã đánh dấu cần xem lại.</p>
                )}
                <p>Bài thi sẽ không thể thay đổi sau khi nộp.</p>
            </Modal>
        </div>
    );
};

export default TestDetail;
