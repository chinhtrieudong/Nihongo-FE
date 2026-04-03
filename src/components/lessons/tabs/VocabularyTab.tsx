import React, { useState } from "react";
import { Badge, Button, Typography, Avatar, Input, Switch, Card, Row, Col } from "antd";
import { Grid } from "antd";
import {
    Book,
    Volume2,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Star,
    Lightbulb,
    Search,
    Menu,
} from "lucide-react";

const { Title } = Typography;

interface VocabularyTabProps {
    vocabulary: any[];
}

const VocabularyTab: React.FC<VocabularyTabProps> = ({ vocabulary }) => {
    const screens = Grid.useBreakpoint();
    const [currentCard, setCurrentCard] = useState(0);
    const [showMeaning, setShowMeaning] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showHanViet, setShowHanViet] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'flashcard' | 'list'>('flashcard');

    if (vocabulary.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex flex-col items-center">
                    <div className="w-20 h-20 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-4">
                        <Book className="w-8 h-8 text-secondary-400" />
                    </div>
                    <p className="text-secondary-700 dark:text-secondary-400 text-lg">
                        Chưa có từ vựng cho bài học này.
                    </p>
                </div>
            </div>
        );
    }

    // Filter vocabulary based on search
    const filteredVocabulary = vocabulary.filter(item =>
        item.kanji.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hiragana.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meaningVi.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const card = filteredVocabulary[currentCard] || vocabulary[0];

    const handleCardFlip = () => {
        setIsFlipped(!isFlipped);
        setShowMeaning(!showMeaning);
    };

    const handleNext = () => {
        setCurrentCard((prev) => (prev < vocabulary.length - 1 ? prev + 1 : 0));
        setIsFlipped(false);
        setShowMeaning(false);
    };

    const handlePrev = () => {
        setCurrentCard((prev) => (prev > 0 ? prev - 1 : vocabulary.length - 1));
        setIsFlipped(false);
        setShowMeaning(false);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Mobile-First Header */}
            <div className="px-4 sm:px-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Typography.Title
                            level={screens.xs ? 4 : 3}
                            className="!mb-1 !text-secondary-900 dark:!text-secondary-100 flex items-center gap-2"
                        >
                            <span className={screens.xs ? 'text-xl' : 'text-2xl'}>📚</span>
                            Từ vựng
                        </Typography.Title>
                        <Typography.Text className="text-sm text-secondary-600 dark:text-secondary-400">
                            {filteredVocabulary.length} từ vựng
                        </Typography.Text>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex items-center gap-2">
                        {screens.xs && (
                            <Button
                                icon={<Menu className="w-4 h-4" />}
                                onClick={() => setViewMode(viewMode === 'flashcard' ? 'list' : 'flashcard')}
                                size="small"
                            >
                                {viewMode === 'flashcard' ? 'List' : 'Card'}
                            </Button>
                        )}
                        <Badge
                            count={`${currentCard + 1}/${filteredVocabulary.length}`}
                            style={{ backgroundColor: '#1890ff' }}
                            className="text-xs sm:text-sm"
                        />
                    </div>
                </div>

                {/* Search and Controls */}
                <div className="mt-4 space-y-3">
                    <Input
                        placeholder="Tìm từ vựng..."
                        prefix={<Search className="w-4 h-4" />}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentCard(0);
                        }}
                        className="w-full"
                        size={screens.xs ? 'middle' : 'large'}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Button
                                icon={<Volume2 className="w-4 h-4" />}
                                size={screens.xs ? 'middle' : 'large'}
                                className="flex-1 sm:flex-none"
                            >
                                {screens.xs ? '🔊' : 'Phát âm'}
                            </Button>

                            {!screens.xs && (
                                <Button
                                    icon={<Book className="w-4 h-4" />}
                                    onClick={() => setViewMode(viewMode === 'flashcard' ? 'list' : 'flashcard')}
                                    className="flex-1 sm:flex-none"
                                >
                                    {viewMode === 'flashcard' ? 'Danh sách' : 'Flashcard'}
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Typography.Text className="text-sm text-secondary-600 dark:text-secondary-400">
                                Hiện Hán Việt:
                            </Typography.Text>
                            <Switch
                                checked={showHanViet}
                                onChange={setShowHanViet}
                                size={screens.xs ? 'small' : 'default'}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Flashcard View */}
            {viewMode === 'flashcard' && filteredVocabulary.length > 0 && (
                <div className="px-4 sm:px-0">
                    <div className="flex justify-center">
                        <div className="relative w-full max-w-md">
                            {/* Progress Dots - Mobile Optimized */}
                            <div className="flex justify-center gap-1.5 mb-4">
                                {filteredVocabulary.slice(0, screens.xs ? 5 : 7).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setCurrentCard(index);
                                            setIsFlipped(false);
                                            setShowMeaning(false);
                                        }}
                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentCard
                                            ? 'w-4 bg-primary-600'
                                            : 'bg-gray-300 dark:bg-secondary-600'
                                            }`}
                                    />
                                ))}
                                {filteredVocabulary.length > (screens.xs ? 5 : 7) && (
                                    <span className="text-xs text-secondary-500 self-center">
                                        +{filteredVocabulary.length - (screens.xs ? 5 : 7)}
                                    </span>
                                )}
                            </div>

                            {/* Mobile Flashcard */}
                            <div
                                className="relative h-56 sm:h-72 cursor-pointer"
                                onClick={handleCardFlip}
                            >
                                <div
                                    className={`absolute inset-0 w-full h-full transition-all duration-500 transform-gpu preserve-3d ${isFlipped ? 'rotate-y-180' : ''
                                        }`}
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {/* Front */}
                                    <div className="absolute inset-0 w-full h-full backface-hidden">
                                        <Card className="h-full bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-700 dark:to-primary-800 border-0 shadow-xl">
                                            <div className="h-full flex flex-col justify-center items-center text-white p-4">
                                                <div className="text-2xl sm:text-4xl font-bold mb-2 text-center font-kosugi">
                                                    {card.kanji}
                                                </div>
                                                <div className="text-base sm:text-xl mb-2 text-center opacity-90 font-japanese">
                                                    {card.hiragana}
                                                </div>
                                                <div className="text-xs sm:text-sm opacity-80 text-center">
                                                    {card.romaji}
                                                </div>
                                                {showHanViet && card.hanviet && (
                                                    <div className="mt-2 text-xs sm:text-sm opacity-70">
                                                        Hán Việt: {card.hanviet}
                                                    </div>
                                                )}
                                                <div className="mt-4 text-xs opacity-70">
                                                    Nhấn để xem nghĩa
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Back */}
                                    <div
                                        className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden"
                                        style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                                    >
                                        <Card className="h-full bg-gradient-to-br from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 border-0 shadow-xl">
                                            <div className="h-full flex flex-col justify-center text-white p-4">
                                                <div className="text-xl sm:text-2xl font-bold mb-3 text-center">
                                                    {card.meaningVi}
                                                </div>
                                                <div className="text-sm mb-4 text-center opacity-90">
                                                    {card.meaningEn}
                                                </div>
                                                {card.mnemonic && (
                                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Lightbulb className="w-4 h-4 text-yellow-300" />
                                                            <span className="text-sm font-medium">Mẹo ghi nhớ:</span>
                                                        </div>
                                                        <p className="text-xs opacity-90">{card.mnemonic}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Navigation */}
                            <div className="flex justify-between items-center mt-4 gap-2">
                                <Button
                                    onClick={handlePrev}
                                    icon={<ChevronLeft className="w-4 h-4" />}
                                    className="flex-1"
                                >
                                    {screens.xs ? '←' : 'Trước'}
                                </Button>
                                <div className="flex gap-1">
                                    <Button
                                        onClick={handleCardFlip}
                                        icon={isFlipped ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        size={screens.xs ? 'small' : 'middle'}
                                    />
                                    <Button
                                        icon={<Star className="w-4 h-4" />}
                                        size={screens.xs ? 'small' : 'middle'}
                                    />
                                </div>
                                <Button
                                    onClick={handleNext}
                                    icon={<ChevronRight className="w-4 h-4" />}
                                    type="primary"
                                    className="flex-1"
                                >
                                    {screens.xs ? '→' : 'Tiếp'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile-First List View */}
            {viewMode === 'list' && (
                <div className="px-4 sm:px-0">
                    <div className="space-y-3">
                        {filteredVocabulary.map((item, index) => (
                            <Card
                                key={item.id}
                                onClick={() => {
                                    setCurrentCard(index);
                                    setIsFlipped(false);
                                    setShowMeaning(false);
                                    if (screens.xs) setViewMode('flashcard');
                                }}
                                className={`cursor-pointer transition-all duration-200 ${index === currentCard
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                                    : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 hover:shadow-md'
                                    }`}
                                size="small"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                                {item.kanji}
                                            </span>
                                            <Badge count={index + 1} size="small" />
                                        </div>
                                        <div className="text-sm text-secondary-700 dark:text-secondary-400 mb-1">
                                            {item.hiragana}
                                        </div>
                                        <div className="text-xs text-secondary-500 dark:text-secondary-500 mb-2">
                                            {item.romaji}
                                        </div>
                                        {showHanViet && item.hanviet && (
                                            <div className="text-xs text-secondary-600 dark:text-secondary-400 mb-2">
                                                Hán Việt: {item.hanviet}
                                            </div>
                                        )}
                                        <div className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                                            {item.meaningVi}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 ml-3">
                                        <Button
                                            icon={<Volume2 className="w-4 h-4" />}
                                            size="small"
                                            type="text"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Play sound
                                            }}
                                        />
                                        <Button
                                            icon={<Star className="w-4 h-4" />}
                                            size="small"
                                            type="text"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Toggle favorite
                                            }}
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Desktop Grid View */}
            {!screens.xs && viewMode === 'flashcard' && (
                <div className="px-4 sm:px-0">
                    <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                            <Book className="w-5 h-5" />
                            Danh sách từ vựng
                        </h3>
                        <Row gutter={[16, 16]}>
                            {filteredVocabulary.map((item, index) => (
                                <Col xs={24} sm={12} lg={8} key={item.id}>
                                    <Card
                                        onClick={() => {
                                            setCurrentCard(index);
                                            setIsFlipped(false);
                                            setShowMeaning(false);
                                        }}
                                        className={`cursor-pointer transition-all duration-200 h-full ${index === currentCard
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                                            : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="font-bold text-lg text-primary-600 dark:text-primary-400 truncate">
                                                {item.kanji}
                                            </div>
                                            <Badge count={index + 1} size="small" />
                                        </div>
                                        <div className="text-sm text-secondary-700 dark:text-secondary-400 mb-1">
                                            {item.hiragana}
                                        </div>
                                        <div className="text-xs text-secondary-500 dark:text-secondary-500 mb-2">
                                            {item.romaji}
                                        </div>
                                        {showHanViet && item.hanviet && (
                                            <div className="text-xs text-secondary-600 dark:text-secondary-400 mb-2">
                                                Hán Việt: {item.hanviet}
                                            </div>
                                        )}
                                        <div className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                                            {item.meaningVi}
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VocabularyTab;
