import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Input,
  Button,
  Card,
  Modal,
  Typography,
  Tag,
  Space,
  Progress,
  Statistic,
  Row,
  Col,
  Switch,
  Empty,
  Spin,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  SoundOutlined,
  BookOutlined,
  PlayCircleOutlined,
  CloseOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { VocabularyItem as VocabularyItemType } from '../types/lesson';

const { Title, Text, Paragraph } = Typography;

interface VocabularyTableProps {
  data: VocabularyItemType[];
  loading?: boolean;
}

const VocabularyTable: React.FC<VocabularyTableProps> = ({ data, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRomaji, setShowRomaji] = useState(true);
  const [showHanViet, setShowHanViet] = useState(true);
  const [selectedWord, setSelectedWord] = useState<VocabularyItemType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'flashcard'>('table');
  type SessionStatus = 'unanswered' | 'known' | 'unknown';
  const [cardStatus, setCardStatus] = useState<Record<string, SessionStatus>>({});
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isStudyComplete, setIsStudyComplete] = useState(false);
  const [studyMode, setStudyMode] = useState<'all' | 'unremembered'>('all');
  // Track which cards have been evaluated in this session
  const [evaluatedCards, setEvaluatedCards] = useState<Set<string>>(new Set());
  const [shuffledCards, setShuffledCards] = useState<VocabularyItemType[]>([]);

  useEffect(() => {
    const initialStatus: Record<string, SessionStatus> = {};
    data.forEach((item, index) => {
      // ✅ Tạo ID từ kanji + hiragana + index
      const uniqueId = item.id || `${item.kanji}_${item.hiragana || item.katakana}_${index}`;
      initialStatus[uniqueId] = 'unanswered';
    });
    setCardStatus(initialStatus);

    if (data.length > 0 && shuffledCards.length === 0) {
      // ✅ Gắn ID cho mỗi thẻ
      const cardsWithIds = data.map((item, index) => ({
        ...item,
        id: item.id || `${item.kanji}_${item.hiragana || item.katakana}_${index}`
      }));
      setShuffledCards(cardsWithIds);
    }
  }, [data]);

  const cardsToStudy = useMemo(() => {
    if (shuffledCards.length > 0) {
      return shuffledCards;
    }
    return data.map((item, index) => ({
      ...item,
      id: item.id || `${item.kanji}_${item.hiragana || item.katakana}_${index}`
    }));
  }, [shuffledCards, data]);

  const sessionKnownCount = useMemo(() => {
    const currentCardIds = new Set(cardsToStudy.map(c => c.id));
    const count = Object.entries(cardStatus)
      .filter(([id, status]) => currentCardIds.has(id) && status === 'known')
      .length;
    return count;
  }, [cardStatus, cardsToStudy]);

  const sessionUnknownCount = useMemo(() => {
    const currentCardIds = new Set(cardsToStudy.map(c => c.id));
    const count = Object.entries(cardStatus)
      .filter(([id, status]) => currentCardIds.has(id) && status === 'unknown')
      .length;
    return count;
  }, [cardStatus, cardsToStudy]);

  const totalCount = cardsToStudy.length;
  const knownCount = sessionKnownCount;
  const unknownCount = sessionUnknownCount;

  const globalUnknownCount = Object.values(cardStatus).filter(s => s === 'unknown').length;

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return data.filter(item =>
      item.kanji.includes(searchTerm) ||
      (item.hiragana && item.hiragana.includes(searchTerm)) ||
      (item.katakana && item.katakana.includes(searchTerm)) ||
      item.romaji.toLowerCase().includes(lowerSearchTerm) ||
      (item.meaning_vi && item.meaning_vi.toLowerCase().includes(lowerSearchTerm)) ||
      (item.hanviet && item.hanviet.toLowerCase().includes(lowerSearchTerm))
    );
  }, [data, searchTerm]);

  const handleWordClick = (word: VocabularyItemType) => {

    setSelectedWord(word);
    setShowModal(true);
  };

  const handlePlayAudio = (audioUrl: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // Dùng audio file từ public folder
    const audio = new Audio(audioUrl);
    audio.play().catch(err => console.error("Audio playback failed:", err));
  };

  // Text-to-Speech functionality
  const speakText = (text: string, lang: string = 'ja-JP') => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8; // Slightly slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 1;

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Text-to-speech not supported in this browser');
    }
  };

  const handlePlayHiraKanaAudio = (text: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    // Try TTS first, fallback to audio file if available
    speakText(text);
  };

  const handleMemoryEvaluation = (status: 'unknown' | 'known') => {
    if (!currentCard) return;


    setCardStatus(prev => {
      const newStatus = {
        ...prev,
        [currentCard.id]: status
      };
      return newStatus;
    });

    moveToNextCard();
  };


  const moveToNextCard = () => {
    if (currentCardIndex < cardsToStudy.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
      setShowAnswer(false);
    } else {
      // Study session complete
      setIsStudyComplete(true);
    }
  };

  const shuffleCards = () => {
    const shuffled = [...cardsToStudy].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
  };

  const resetStudySession = (mode: 'all' | 'unremembered' = 'all') => {
    setStudyMode(mode);

    // ✅ Đảm bảo data có ID
    const dataWithIds = data.map((item, index) => ({
      ...item,
      id: item.id || `${item.kanji}_${item.hiragana || item.katakana}_${index}`
    }));

    const cardsToUse =
      mode === 'unremembered'
        ? dataWithIds.filter(card => cardStatus[card.id] === 'unknown')
        : dataWithIds;

    // ✅ SHUFFLE NGAY KHI RESET
    const shuffled = [...cardsToUse].sort(() => Math.random() - 0.5);

    // Reset status only for cards in this session
    const resetStatus: Record<string, SessionStatus> = {};
    cardsToUse.forEach(c => resetStatus[c.id] = 'unanswered');

    // Keep existing status for cards not in this session
    const newStatus = { ...cardStatus };
    Object.keys(resetStatus).forEach(id => {
      newStatus[id] = 'unanswered';
    });

    setCardStatus(newStatus);
    setShuffledCards(shuffled); // ✅ Set shuffled cards
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setIsStudyComplete(false);
    setEvaluatedCards(new Set());
  };


  const currentCard = cardsToStudy[currentCardIndex];


  const flipCard = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          flipCard();
          break;
        case 'ArrowLeft':
          handleMemoryEvaluation('unknown');
          break;
        case 'ArrowRight':
          handleMemoryEvaluation('known');
          break;
        case 's':
        case 'S':
          shuffleCards();
          break;
      }
    };

    // ✅ Chỉ kích hoạt phím tắt khi chưa hoàn thành
    if (viewMode === 'flashcard' && !isStudyComplete) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [viewMode, currentCardIndex, cardsToStudy, isFlipped, currentCard, isStudyComplete]);

  useEffect(() => {
    // ✅ Chỉ hoàn thành khi đã đánh giá HẾT tất cả thẻ (không còn 'unanswered')
    const currentCardIds = new Set(cardsToStudy.map(c => c.id));
    const unansweredCount = Object.entries(cardStatus)
      .filter(([id, status]) => currentCardIds.has(id) && status === 'unanswered')
      .length;

    // Đếm số thẻ đã đánh giá (known + unknown)
    const evaluatedCount = Object.entries(cardStatus)
      .filter(([id, status]) => currentCardIds.has(id) && (status === 'known' || status === 'unknown'))
      .length;

    // Chỉ hoàn thành khi: không còn unanswered VÀ đã có ít nhất 1 thẻ được đánh giá
    if (unansweredCount === 0 && evaluatedCount > 0 && cardsToStudy.length > 0) {
      setIsStudyComplete(true);
    }
  }, [cardStatus, cardsToStudy]);


  if (viewMode === 'flashcard') {
    // Show completion screen if study session is complete
    if (isStudyComplete) {
      return (
        <div className="p-6">
          <Card className="mb-6">
            <div className="flex justify-between items-center">
              <Title level={2}>Kết thúc buổi học</Title>
              <Button
                type="primary"
                icon={<BookOutlined />}
                onClick={() => setViewMode('table')}
              >
                Xem bảng
              </Button>
            </div>
          </Card>

          <Card className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Title level={1} className="text-secondary-900 dark:text-secondary-100 mb-6">
                🎉 Hoàn thành!
              </Title>

              <Row gutter={24} className="mb-8">
                <Col span={8}>
                  <Statistic
                    title="Tổng"
                    value={totalCount}
                    styles={{ content: { color: '#1890ff' } }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Đã nhớ"
                    value={knownCount}
                    styles={{ content: { color: '#52c41a' } }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Chưa nhớ"
                    value={unknownCount}
                    styles={{ content: { color: '#ff4d4f' } }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Col>
              </Row>

              <Space size="large" className="justify-center">
                <Button
                  type="primary"
                  size="large"
                  icon={<SwapOutlined />}
                  onClick={() => resetStudySession('all')}
                >
                  Học lại toàn bộ
                </Button>
                {globalUnknownCount > 0 && (
                  <Button
                    type="default"
                    size="large"
                    onClick={() => resetStudySession('unremembered')}
                  >
                    Chỉ học {globalUnknownCount} thẻ chưa nhớ
                  </Button>
                )}
              </Space>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="p-6">
        <Card className="mb-6">
          <div className="flex justify-between items-center">
            <Title level={2}>Flashcard Từ Vựng</Title>
            <Button
              type="primary"
              icon={<BookOutlined />}
              onClick={() => setViewMode('table')}
            >
              Xem bảng
            </Button>
          </div>
        </Card>

        {cardsToStudy.length === 0 ? (
          <Card>
            <Empty
              description={
                <div className="text-center">
                  <Title level={4} type="secondary">
                    {studyMode === 'unremembered' ? 'Không có thẻ nào cần học lại!' : 'Không có từ vựng nào!'}
                  </Title>
                  {studyMode === 'unremembered' && (
                    <Button
                      type="primary"
                      onClick={() => resetStudySession('all')}
                      className="mt-4"
                    >
                      Học lại toàn bộ
                    </Button>
                  )}
                </div>
              }
            />
          </Card>
        ) : (
          <>
            <div className="flex justify-center items-center min-h-[50vh] p-4">
              <Card
                className="cursor-pointer transition-all duration-300 hover:scale-105"
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  height: '350px',
                }}
                onClick={flipCard}
              >
                {/* Front of card */}
                {!isFlipped && (
                  <div className="absolute inset-0 p-8 flex flex-col items-center justify-center">
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<SoundOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        const hiraKanaText = currentCard?.hiragana || currentCard?.katakana || '';
                        if (hiraKanaText) {
                          handlePlayHiraKanaAudio(hiraKanaText, e);
                        }
                      }}
                      className="absolute top-4 right-4"
                      disabled={!currentCard?.hiragana && !currentCard?.katakana}
                    />

                    <Title level={1} className="text-secondary-900 dark:text-secondary-100 mb-4">
                      {currentCard?.kanji}
                    </Title>

                    <Title level={3} type="secondary" className="mb-4 text-secondary-700 dark:text-secondary-300">
                      {currentCard?.hiragana || currentCard?.katakana}
                    </Title>
                  </div>
                )}

                {/* Back of card */}
                {isFlipped && (
                  <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 p-8 flex flex-col items-center justify-center">
                    {currentCard?.hanviet && (
                      <Title level={2} className="text-purple-600 dark:text-purple-400 mb-6">
                        {currentCard.hanviet.toUpperCase().replace(/,/g, '')}
                      </Title>
                    )}

                    <Title level={3} className="text-secondary-800 dark:text-secondary-200">
                      {currentCard?.meaning_vi || 'Đang cập nhật nghĩa...'}
                    </Title>
                  </div>
                )}
              </Card>
            </div>

            {/* Status Bar */}
            <Card className="mt-8">
              <Row justify="center" align="middle" gutter={16}>
                <Col>
                  <Space>
                    <CloseCircleOutlined className="text-red-500" />
                    <Text strong type="danger">{sessionUnknownCount}</Text>
                  </Space>
                </Col>

                <Col flex="auto">
                  <div className="text-center">
                    <Text strong>{currentCardIndex + 1} / {cardsToStudy.length}</Text>
                    <Progress
                      percent={((currentCardIndex + 1) / cardsToStudy.length) * 100}
                      showInfo={false}
                      strokeColor="#1890ff"
                    />
                  </div>
                </Col>

                <Col>
                  <Space>
                    <CheckCircleOutlined className="text-green-500" />
                    <Text strong type="success">{sessionKnownCount}</Text>
                  </Space>
                </Col>

                <Col>
                  <Button
                    type="default"
                    icon={<SwapOutlined />}
                    onClick={shuffleCards}
                  />
                </Col>
              </Row>
            </Card>

            {/* Memory Evaluation Buttons */}
            <Card className="mt-6">
              <Row justify="center" gutter={16}>
                <Col>
                  <Button
                    type="primary"
                    danger
                    size="large"
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleMemoryEvaluation('unknown')}
                  >
                    Chưa nhớ
                  </Button>
                </Col>

                <Col>
                  <Button
                    type="primary"
                    size="large"
                    onClick={flipCard}
                  >
                    Lật thẻ (Space)
                  </Button>
                </Col>

                <Col>
                  <Button
                    type="primary"
                    size="large"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleMemoryEvaluation('known')}
                  >
                    Đã nhớ
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Keyboard Shortcuts */}
            <div className="text-center mt-4">
              <Text type="secondary">
                Space → Lật thẻ | ← → Chưa nhớ/Đã nhớ | S → Trộn thẻ
              </Text>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with controls */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
          <Title level={2} className="mb-2 sm:mb-0">Từ Vựng</Title>
          <Button
            type="primary"
            icon={<BookOutlined />}
            onClick={() => setViewMode('flashcard')}
          >
            Chế độ Flashcard
          </Button>
        </div>

        <Space orientation="vertical" className="w-full">
          {/* Search */}
          <Input.Search
            placeholder="Tìm kiếm từ vựng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            size="large"
          />

          {/* Toggles */}
          <Space>
            <Text>Hiện Hán Việt:</Text>
            <Switch
              checked={showHanViet}
              onChange={setShowHanViet}
            />
          </Space>
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          dataSource={filteredData}
          loading={loading}
          rowKey={(record) => record.id || `${record.kanji}_${record.hiragana || record.katakana}_${Math.random().toString(36).substr(2, 9)}`}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} từ`,
          }}
          // scroll={{ x: 800 }}
          columns={[
            {
              title: 'STT',
              dataIndex: 'index',
              key: 'index',
              width: 60,
              render: (_: any, __: any, index: number) => index + 1,
            },
            {
              title: 'Kanji',
              dataIndex: 'kanji',
              key: 'kanji',
              width: 120,
              render: (text: string) => <Text strong>{text || '-'}</Text>,
            },
            {
              title: 'Hira/Kana',
              dataIndex: 'hiragana',
              key: 'hiragana',
              width: 150,
              render: (text: string, record: any) => (
                <Text>{text || record.katakana || '-'}</Text>
              ),
            },
            ...(showHanViet ? [{
              title: 'Hán Việt',
              dataIndex: 'hanviet',
              key: 'hanviet',
              width: 150,
              render: (text: string) => (
                <Text type="secondary">
                  {text ? text.toUpperCase().replace(/,/g, '') : '-'}
                </Text>
              ),
            }] : []),
            {
              title: 'Nghĩa tiếng Việt',
              dataIndex: 'meaning_vi',
              key: 'meaning_vi',
              render: (text: string) => <Text>{text || '-'}</Text>,
            },
            {
              title: 'Nghe',
              key: 'audio',
              width: 80,
              align: 'center',
              render: (_: any, record: any) => {
                const hiraKanaText = record.hiragana || record.katakana || '';
                return (
                  <Button
                    type="text"
                    icon={<SoundOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hiraKanaText) {
                        handlePlayHiraKanaAudio(hiraKanaText, e);
                      }
                    }}
                    disabled={!hiraKanaText}
                  />
                );
              },
            },
          ]}
          onRow={(record) => ({
            onClick: () => handleWordClick(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={<Title level={3}>Chi tiết từ vựng</Title>}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="close" icon={<CloseOutlined />} onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <Space orientation="vertical" className="w-full" size="large">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong className="text-secondary-900 dark:text-secondary-600">Kanji</Text>
              <div className="p-3 bg-secondary-50 dark:bg-secondary-925 rounded">
                <Text className="text-2xl font-bold">{selectedWord?.kanji || '-'}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text strong className="text-secondary-900 dark:text-secondary-600">Hira/Kana</Text>
              <div className="p-3 bg-secondary-50 dark:bg-secondary-925 rounded">
                <Text className="text-2xl">{selectedWord?.hiragana || selectedWord?.katakana || '-'}</Text>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong className="text-secondary-900 dark:text-secondary-600">Hán Việt</Text>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                <Text className="text-lg text-purple-600 dark:text-purple-400 font-medium">
                  {selectedWord?.hanviet ? selectedWord.hanviet.toUpperCase().replace(/,/g, '') : '-'}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <Text strong className="text-secondary-900 dark:text-secondary-600">Romaji (tách âm)</Text>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <Text className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                  {selectedWord?.romaji || '-'}
                </Text>
              </div>
            </Col>
          </Row>

          <div>
            <Text strong className="text-secondary-900 dark:text-secondary-600">Nghĩa tiếng Việt</Text>
            <div className="p-3 bg-secondary-50 dark:bg-secondary-925 rounded">
              <Text className="text-xl font-semibold text-secondary-900 dark:text-secondary-600">
                {selectedWord?.meaning_vi || '-'}
              </Text>
            </div>
          </div>

          {selectedWord?.kanji && selectedWord.kanji_analysis &&
            Array.isArray(selectedWord.kanji_analysis) && selectedWord.kanji_analysis.length > 0 && (
              <div>
                <Text strong className="text-secondary-900 dark:text-secondary-600">Phân tích Kanji</Text>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                  <Space orientation="vertical" className="w-full">
                    {selectedWord.kanji_analysis.map((kanji, index) => (
                      <div key={index} className="border-b border-orange-200 pb-2 last:border-b-0">
                        <Text className="font-semibold text-lg text-orange-800 dark:text-orange-600">
                          {kanji.character}
                        </Text>
                        <div className="text-sm text-secondary-700 dark:text-secondary-800">
                          <Text strong>Hán Việt:</Text> {kanji.hanviet || 'N/A'}
                        </div>
                        <div className="text-sm text-secondary-700 dark:text-secondary-800">
                          <Text strong>Bộ thủ:</Text> {kanji.radicals && kanji.radicals.length > 0 ? (
                            <Space wrap>
                              {kanji.radicals.map((radical, radIndex) => (
                                <Tag key={radIndex} color="blue" className="mb-1">
                                  {radical.radical} - {radical.hanviet}
                                </Tag>
                              ))}
                            </Space>
                          ) : "Không có"}
                        </div>
                        <div className="text-sm text-secondary-700 dark:text-secondary-800">
                          <Text strong>Nghĩa:</Text> {kanji.meaning || 'N/A'}
                        </div>
                        {kanji.image_explanation && (
                          <div className="text-sm text-secondary-700 dark:text-secondary-800">
                            <Text strong>Giải thích:</Text> {kanji.image_explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </Space>
                </div>
              </div>
            )}

          {selectedWord?.example_jp && (
            <div>
              <Text strong className="text-gray-900 dark:text-gray-100">Ví dụ</Text>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <Tooltip
                  title={selectedWord.example_vi || 'Không có bản dịch...'}
                  placement="bottom"
                  arrow={false}
                  overlayInnerStyle={{
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff',
                    color: document.documentElement.classList.contains('dark') ? '#ffffff' : 'rgba(0, 0, 0, 0.88)',
                    border: document.documentElement.classList.contains('dark') ? '1px solid #4b5563' : '1px solid #d9d9d9',
                    borderRadius: '6px'
                  }}
                >
                  <Text className="text-xl text-gray-700 dark:text-gray-300 italic cursor-pointer hover:text-blue-600 transition-colors duration-200"
                    style={{ textDecoration: 'underline dotted' }}
                  >
                    {selectedWord.example_jp || '-'}
                  </Text>
                </Tooltip>
              </div>
            </div>
          )}

          <div className="text-center">
            <Button
              type="primary"
              icon={<SoundOutlined />}
              onClick={(e) => {
                const hiraKanaText = selectedWord?.hiragana || selectedWord?.katakana || '';
                if (hiraKanaText) {
                  handlePlayHiraKanaAudio(hiraKanaText, e);
                }
              }}
              disabled={!selectedWord?.hiragana && !selectedWord?.katakana}
            >
              Nghe phát âm
            </Button>
          </div>
        </Space>
      </Modal>
    </div>

  );
};

export default VocabularyTable;
