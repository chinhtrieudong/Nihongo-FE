import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    Card,
    Button,
    Typography,
    Progress,
    Space,
    Divider,
    Radio,
    Input,
    Modal,
    Row,
    Col,
    Tag,
    Drawer,
    Badge,
    Tooltip,
    Alert,
    Spin,
    App as AntdApp
} from "antd";
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Play,
    ArrowLeft,
    Square,
    Book,
    FileText,
    Flag,
    Eye,
    HelpCircle,
    Maximize,
    Minimize,
    Volume2,
    Languages
} from "lucide-react";
import { EmptyState } from "../../components/common";
import { jlptTestsAPI } from "../../services/api";
import { jlptTests as localJlptTests } from "../../data/jlptTests";

const { Title, Text, Paragraph } = Typography;

interface TestSection {
    id: string;
    name: string;
    icon?: React.ReactNode;
    questions: number;
    duration: number;
    description: string;
    questionTypes: string[];
}

interface Test {
    id: string;
    level: string;
    title: string;
    title_vi?: string;
    description: string;
    description_vi?: string;
    duration: number;
    questions: number;
    difficulty: string;
    completed: boolean;
    score?: number;
    date?: string;
    sections: TestSection[];
    passing_score?: number;
    is_active?: boolean;
    version?: number;
}

interface Question {
    id: string;
    type: "multiple-choice" | "text-input" | "listening" | "reading";
    question: string;
    options?: string[];
    correctAnswer: string | number;
    explanation?: string;
    audioUrl?: string;
    readingText?: string;
    sectionId: string;
    level: string;
    difficulty: string;
}

type TestQuestionsBundle = {
    test?: Partial<Test>;
    questions: Question[];
};

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
    const location = useLocation();
    const { message } = AntdApp.useApp();

    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentAttempt, setCurrentAttempt] = useState<TestAttempt | null>(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | number>>({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTestActive, setIsTestActive] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showInstructionsModal, setShowInstructionsModal] = useState(true);
    const [showQuestionOverview, setShowQuestionOverview] = useState(false);
    const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
    const [reviewMode, setReviewMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(true);

    const getSectionIcon = (section: Pick<TestSection, "id" | "name">) => {
        const key = String(section.id || section.name || "").toLowerCase();
        if (key.includes("vocab") || key.includes("từ vựng")) return <Book className="w-4 h-4" />;
        if (key.includes("grammar") || key.includes("ngữ pháp")) return <FileText className="w-4 h-4" />;
        if (key.includes("reading") || key.includes("đọc")) return <FileText className="w-4 h-4" />;
        if (key.includes("listen") || key.includes("nghe")) return <Volume2 className="w-4 h-4" />;
        if (key.includes("kanji")) return <Languages className="w-4 h-4" />;
        return <Book className="w-4 h-4" />;
    };

    // Load test data and attempt
    useEffect(() => {
        const fetchTestData = async () => {
            if (!testId) return;

            try {
                setLoading(true);
                // Prefer level from query param (?level=N5)
                const params = new URLSearchParams(location.search);
                const level = (params.get("level") || "").toUpperCase();
                if (!level) {
                    message.error("Thiếu level của bài thi (vd: ?level=N5).");
                    return;
                }

                const applyTestData = (testData: any) => {
                    setTest(testData);
                    setTimeRemaining(testData.duration * 60);
                };

                const tryLoadLocalQuestions = async (level: string, testId: string, baseTest: any) => {
                    try {
                        const res = await fetch(`/data/jlpt-tests/${encodeURIComponent(level)}/${encodeURIComponent(testId)}.json`);
                        if (!res.ok) return false;
                        const bundle = (await res.json()) as TestQuestionsBundle;
                        const qs = Array.isArray(bundle?.questions) ? bundle.questions : [];
                        if (qs.length === 0) return false;

                        const mergedTest = {
                            ...baseTest,
                            ...(bundle.test || {}),
                        };

                        // Keep metadata consistent with loaded question count
                        const countsBySection = new Map<string, number>();
                        qs.forEach((q) => countsBySection.set(q.sectionId, (countsBySection.get(q.sectionId) || 0) + 1));
                        const patchedSections = (mergedTest.sections || []).map((s: any) => ({
                            ...s,
                            questions: countsBySection.get(s.id) ?? s.questions,
                        }));

                        const patchedTest = {
                            ...mergedTest,
                            sections: patchedSections,
                            questions: qs.length,
                        };

                        setTest(patchedTest);
                        setTimeRemaining((patchedTest.duration || 0) * 60);
                        setQuestions(qs);
                        message.info("Đang dùng câu hỏi từ JSON local.");
                        return true;
                    } catch {
                        return false;
                    }
                };

                const generateMockQuestionsFromTest = (testData: any) => {
                    const sampleQuestions: Question[] = [];
                    testData.sections.forEach((section: TestSection, sectionIndex: number) => {
                        for (let i = 0; i < section.questions; i++) {
                            sampleQuestions.push({
                                id: `q_${sectionIndex}_${i}`,
                                type: "multiple-choice",
                                question: `Câu hỏi ${i + 1} - ${section.name}`,
                                options: ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
                                correctAnswer: 0,
                                sectionId: section.id,
                                level: testData.level,
                                difficulty: testData.difficulty
                            });
                        }
                    });
                    setQuestions(sampleQuestions);
                };

                try {
                    const response = await jlptTestsAPI.getTest(level, testId);
                    if (response?.success && response?.data) {
                        applyTestData(response.data);
                        const loaded = await tryLoadLocalQuestions(level, testId, response.data);
                        if (!loaded) {
                            generateMockQuestionsFromTest(response.data);
                        }
                        return;
                    }
                    // If backend returns a non-success payload, fall back to local JSON
                    const local = localJlptTests.find((t) => String(t.id) === String(testId) && String(t.level).toUpperCase() === level);
                    if (local) {
                        applyTestData(local);
                        const loaded = await tryLoadLocalQuestions(level, testId, local);
                        if (!loaded) {
                            generateMockQuestionsFromTest(local);
                        }
                        message.warning("Đang dùng dữ liệu JLPT local (backend chưa có endpoint).");
                        return;
                    }
                    message.error("Không tìm thấy bài thi (backend & local đều không có).");
                } catch (apiError) {
                    // Backend endpoint missing/404 → use local JSON
                    const local = localJlptTests.find((t) => String(t.id) === String(testId) && String(t.level).toUpperCase() === level);
                    if (local) {
                        applyTestData(local);
                        const loaded = await tryLoadLocalQuestions(level, testId, local);
                        if (!loaded) {
                            generateMockQuestionsFromTest(local);
                        }
                        message.warning("Đang dùng dữ liệu JLPT local (backend chưa có endpoint).");
                        return;
                    }
                    throw apiError;
                }
            } catch (error) {
                console.error('Error fetching test:', error);
                message.error('Không thể tải bài thi');
            } finally {
                setLoading(false);
            }
        };

        fetchTestData();

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
    }, [testId, attempt, location.search, message]);

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

        // Note: Test completion is stored in localStorage only
        // In a real app, this would be sent to the backend

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
            case 'answered': return <CheckCircle className="w-4 h-4" />;
            case 'flagged': return <Flag className="w-4 h-4" />;
            default: return <HelpCircle className="w-4 h-4" />;
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
                                    icon={<Flag className="w-4 h-4" />}
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
                            <Space orientation="vertical" className="w-full">
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
                                    icon={<Flag className="w-4 h-4" />}
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
                                    icon={<Flag className="w-4 h-4" />}
                                    onClick={() => handleFlagQuestion(question.id)}
                                    className={isFlagged ? "text-orange-500 border-orange-500" : ""}
                                />
                            </Tooltip>
                        </div>
                        {question.readingText && (
                            <div className="mb-4 p-4 bg-card rounded">
                                <Paragraph>{question.readingText}</Paragraph>
                            </div>
                        )}
                        <Radio.Group
                            value={answers[question.id]}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="w-full"
                        >
                            <Space orientation="vertical" className="w-full">
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
                                    icon={<Flag className="w-4 h-4" />}
                                    onClick={() => handleFlagQuestion(question.id)}
                                    className={isFlagged ? "text-orange-500 border-orange-500" : ""}
                                />
                            </Tooltip>
                        </div>
                        <div className="text-center mb-4">
                            <Button
                                type="primary"
                                icon={<Volume2 className="w-4 h-4" />}
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
                            <Space orientation="vertical" className="w-full">
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
                                    icon={<Flag className="w-4 h-4" />}
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
            <div className="min-h-full bg-bg p-8">
                <EmptyState
                    type="error"
                    title="Không tìm thấy bài thi"
                    description="Không tìm thấy bài thi bạn đang tìm kiếm."
                    action={{
                        label: "Quay lại danh sách",
                        onClick: () => navigate("/tests"),
                    }}
                />
            </div>
        );
    }

    const currentSection = getCurrentSection();
    const currentQuestion = getCurrentQuestion();
    const totalQuestions = test.questions;
    const answeredQuestions = Object.keys(answers).length;
    const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-full">
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
                    title="Lưu ý quan trọng"
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
                size={400}
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
                                    {section.icon ? section.icon : getSectionIcon(section)}
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
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <Text>Đã trả lời ({Object.keys(answers).length})</Text>
                    </div>
                    <div className="flex items-center">
                        <Flag className="w-4 h-4 text-orange-500 mr-2" />
                        <Text>Đã đánh dấu ({flaggedQuestions.length})</Text>
                    </div>
                    <div className="flex items-center">
                        <HelpCircle className="w-4 h-4 text-gray-400 mr-2" />
                        <Text>Chưa trả lời ({totalQuestions - Object.keys(answers).length})</Text>
                    </div>
                </div>
            </Drawer>

            {/* Header */}
            <div className="mb-6">
                <Row justify="space-between" align="middle">
                    <Col>
                        <div className="flex items-center gap-4 mb-2">
                            <Tooltip title="Quay lại danh sách bài thi">
                                <Button
                                    shape="circle"
                                    icon={<ArrowLeft className="w-4 h-4" />}
                                    onClick={() => navigate('/tests')}
                                    className="border-0 shadow-sm hover:shadow-md"
                                />
                            </Tooltip>
                            <Title level={2} className="!mb-0">{test.title}</Title>
                        </div>
                        <Text type="secondary">{test.description}</Text>
                    </Col>
                    <Col>
                        <Space orientation="vertical" align="end">
                            <Space>
                                <Tag color="blue">{test.level}</Tag>
                                <Tag color="green">{test.difficulty}</Tag>
                            </Space>
                            <Space>
                                <Tooltip title="Toàn màn hình">
                                    <Button
                                        icon={isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                                        onClick={toggleFullscreen}
                                    />
                                </Tooltip>
                                <Tooltip title="Tổng quan câu hỏi">
                                    <Button
                                        icon={<Eye className="w-4 h-4" />}
                                        onClick={() => setShowQuestionOverview(true)}
                                    />
                                </Tooltip>
                                {answeredQuestions > 0 && !reviewMode && (
                                    <Tooltip title="Xem lại câu trả lời">
                                        <Button
                                            icon={<Book className="w-4 h-4" />}
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
                                    <Clock className="w-4 h-4 mr-2" />
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
                                    icon={<Play className="w-4 h-4" />}
                                    onClick={handleStartTest}
                                >
                                    Bắt đầu bài thi
                                </Button>
                            )}
                            {isTestActive && (
                                <>
                                    <Button
                                        icon={<Eye className="w-4 h-4" />}
                                        onClick={() => setShowQuestionOverview(true)}
                                    >
                                        Tổng quan
                                    </Button>
                                    <Button
                                        danger
                                        size="large"
                                        icon={<Square className="w-4 h-4" />}
                                        onClick={handleSubmitTest}
                                    >
                                        Nộp bài
                                    </Button>
                                </>
                            )}
                        </Space>
                    </Col>
                </Row>
                <Progress percent={progress} className="mt-4" strokeColor={progress > 80 ? 'var(--success)' : progress > 50 ? 'var(--warning)' : 'var(--error)'} />
            </Card>

            {/* Question Content */}
            {isTestActive && currentQuestion && (
                <Card>
                    <div className="mb-4 flex justify-between items-center">
                        <Space>
                            <Tag color="blue">Câu {currentQuestionIndex + 1}</Tag>
                            <Tag color="green">{currentSection?.name}</Tag>
                            {flaggedQuestions.includes(currentQuestion.id) && (
                                <Tag color="orange" icon={<Flag className="w-4 h-4" />}>Đã đánh dấu</Tag>
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
                                    icon={<ChevronLeft className="w-4 h-4" />}
                                    onClick={handlePreviousQuestion}
                                    disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
                                >
                                    Câu trước
                                </Button>
                                <Button
                                    icon={<Eye className="w-4 h-4" />}
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
                                        icon={<Flag className="w-4 h-4" />}
                                        onClick={() => handleFlagQuestion(currentQuestion.id)}
                                        className={flaggedQuestions.includes(currentQuestion.id) ? "text-orange-500 border-orange-500" : ""}
                                    >
                                        {flaggedQuestions.includes(currentQuestion.id) ? "Đã đánh dấu" : "Đánh dấu"}
                                    </Button>
                                </Tooltip>
                                <Button
                                    type="primary"
                                    icon={<ChevronRight className="w-4 h-4" />}
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
                        <Play className="w-16 h-16 text-blue-500 mb-4" />
                        <Title level={3}>Bài thi đã tạm dừng</Title>
                        <Paragraph>Nhấn nút "Bắt đầu bài thi" để tiếp tục</Paragraph>
                        <Button type="primary" size="large" icon={<Play className="w-4 h-4" />} onClick={handleStartTest}>
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
