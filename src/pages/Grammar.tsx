import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Select,
  Button,
  Typography,
  Space,
  Tag,
  Spin,
  Empty,
  Row,
  Col,
  Statistic,
  Divider
} from 'antd';
import { SearchOutlined, ExperimentOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { grammarAPI, GrammarItem } from '../services/grammarApi';
import GrammarSectionAccordion from '../components/GrammarSectionAccordion';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Grammar: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string[]>(['N5']);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [grammarData, setGrammarData] = useState<GrammarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Load grammar data
  useEffect(() => {
    const loadGrammarData = async () => {
      setLoading(true);
      setError(null);

      try {
        let response;

        const levelParam = selectedLevel.length ? selectedLevel.join(',') : undefined;
        const categoryParam = selectedCategory.length ? selectedCategory.join(',') : undefined;

        if (searchQuery.trim()) {
          // Search mode
          response = await grammarAPI.searchGrammar({
            q: searchQuery,
            level: levelParam,
            category: categoryParam,
            page: currentPage,
            limit: 20
          });
        } else {
          // Normal mode - get all with optional multi-level/category filter
          response = await grammarAPI.getAllGrammar({
            level: levelParam,
            category: categoryParam,
            page: currentPage,
            limit: 20
          });
        }

        if (response.success && response.data) {
          setGrammarData(response.data.grammar);
          if (response.data.pagination) {
            setTotalItems(response.data.pagination.total);
            setHasMore(response.data.pagination.hasMore);
          }
        }
      } catch (err) {
        console.error('Error loading grammar data:', err);
        setError('Không thể tải dữ liệu ngữ pháp. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    loadGrammarData();
  }, [selectedLevel, selectedCategory, searchQuery, currentPage]);

  const getProgressMap = () => {
    try {
      const raw = localStorage.getItem('grammarProgress');
      return raw ? JSON.parse(raw) as Record<string, 'not_started' | 'in_progress' | 'completed'> : {};
    } catch {
      return {};
    }
  };

  const progressMap = getProgressMap();

  // Transform grammar data to match expected format for GrammarSectionAccordion
  const transformedSections = grammarData.map((item, index) => {
    const status = progressMap[item.id] || (index === 0 ? 'in_progress' : 'not_started');
    return {
    id: item.id,
    title: item.pattern,
    subtitle: item.explanation,
    structure: [item.pattern],
    meaning: [item.explanation],
    examples: item.examples.map(ex => ({ japanese: ex.japanese, vietnamese: ex.vietnamese })),
    preview: item.examples && item.examples.length > 0 ? item.examples[0].japanese : undefined,
    comparison: item.comparison ? [item.comparison] : [],
    formation: item.formation,
    usage: item.usage,
    level: item.level,
    category: item.category,
    importance: item.importance,
    examFrequency: item.exam_frequency,
    commonMistakes: item.common_mistakes,
    relatedPatterns: item.related_patterns,
    status,
    recommended: index === 0
  };
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleLevelChange = (levels: string[]) => {
    setSelectedLevel(levels || []);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategory(categories || []);
    setCurrentPage(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const categories = [
    { value: 'particles', label: 'Trợ từ' },
    { value: 'verb-forms', label: 'Dạng động từ' },
    { value: 'adjectives', label: 'Tính từ' },
    { value: 'conjunctions', label: 'Liên từ' },
    { value: 'expressions', label: 'Cụm từ' },
    { value: 'time', label: 'Thời gian' },
    { value: 'comparison', label: 'So sánh' },
    { value: 'conditionals', label: 'Điều kiện' }
  ];

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      N5: 'green',
      N4: 'blue',
      N3: 'orange',
      N2: 'red',
      N1: 'purple'
    };
    return colors[level] || 'default';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      particles: 'cyan',
      'verb-forms': 'geekblue',
      adjectives: 'gold',
      conjunctions: 'lime',
      expressions: 'magenta',
      time: 'volcano',
      comparison: 'purple',
      conditionals: 'orange'
    };
    return colors[category] || 'default';
  };

  return (
    <div className="grammar-page bg-secondary-50 dark:bg-secondary-950 min-h-full text-secondary-900 dark:text-secondary-100">
      {/* Desktop Layout */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <Card className="mb-4 sm:mb-6 bg-white dark:bg-secondary-925 border border-secondary-200 dark:border-secondary-900" variant="borderless">
          <div className="text-center">
            <Title level={2} className="mb-2 text-xl sm:text-2xl lg:text-3xl !text-secondary-900 dark:!text-secondary-100">
              <ExperimentOutlined className="mr-2" />
              Ngữ pháp Nhật Bản
            </Title>
            <Paragraph type="secondary" className="text-base sm:text-lg mb-4 !text-secondary-700 dark:!text-secondary-300">
              Học ngữ pháp theo JLPT • Có ví dụ • Có luyện tập
            </Paragraph>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <Button type="primary" size="middle" icon={<PlayCircleOutlined />}>
                Bắt đầu học N5
              </Button>
              <Button size="middle">
                Tiếp tục bài đang học
              </Button>
            </div>
          </div>
        </Card>

        {/* Filters and Search */}
        <Card className="mb-4 sm:mb-6 bg-white dark:bg-secondary-925 border border-secondary-200 dark:border-secondary-900" variant="borderless">
          <Row gutter={[8, 8]} align="middle">
            <Col xs={24} sm={24} md={12}>
              <Input
                placeholder="🔍 Tìm ngữ pháp: ～ですか / 何～ / この～"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
                size="middle"
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Select
                value={selectedLevel}
                onChange={handleLevelChange}
                size="middle"
                className="w-full"
                mode="multiple"
                maxTagCount="responsive"
                allowClear
                placeholder="JLPT: N5"
              >
                {levels.map(level => (
                  <Option key={level} value={level}>
                    <Tag color={getLevelColor(level)}>{level}</Tag>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                size="middle"
                className="w-full"
                mode="multiple"
                maxTagCount="responsive"
                allowClear
                placeholder="Loại: Câu hỏi"
              >
                {categories.map(cat => (
                  <Option key={cat.value} value={cat.value}>
                    <Tag color={getCategoryColor(cat.value)} className="mr-1">{cat.label}</Tag>
                    {cat.label}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Results Statistics */}
        {totalItems > 0 && (
          <Card className="mb-4 sm:mb-6 bg-white dark:bg-secondary-925 border border-secondary-200 dark:border-secondary-900" variant="borderless">
            <Row gutter={[8, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Kết quả hiện tại"
                  value={grammarData.length}
                  suffix={`/ ${totalItems}`}
                  valueStyle={{ fontSize: '1.2rem', color: 'inherit' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Trình độ"
                  value={selectedLevel.length ? selectedLevel.join(', ') : 'Tất cả'}
                  valueStyle={{ fontSize: '1.2rem', color: 'inherit' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Danh mục"
                  value={
                    selectedCategory.length
                      ? selectedCategory
                          .map(value => categories.find(c => c.value === value)?.label || value)
                          .join(', ')
                      : 'Tất cả'
                  }
                  valueStyle={{ fontSize: '1.2rem', color: 'inherit' }}
                />
              </Col>
            </Row>
          </Card>
        )}

        <Spin spinning={loading} size="large">
          {grammarData.length > 0 ? (
            <Card
              title={
                <div className="flex items-center justify-between">
                  <span>
                    Học theo lộ trình
                  </span>
                  <Space>
                    {selectedLevel.length > 0 ? (
                      selectedLevel.map(level => (
                        <Tag key={level} color={getLevelColor(level)}>{level}</Tag>
                      ))
                    ) : (
                      <Tag>Tất cả</Tag>
                    )}
                    {selectedCategory.length > 0 && (
                      selectedCategory.map(category => (
                        <Tag key={category} color={getCategoryColor(category)}>
                          {categories.find(c => c.value === category)?.label || category}
                        </Tag>
                      ))
                    )}
                  </Space>
                </div>
              }
              className="grammar-content-card bg-white dark:bg-secondary-925 border border-secondary-200 dark:border-secondary-900"
            >
              <GrammarSectionAccordion sections={transformedSections} />

              {/* Load More Button */}
              {hasMore && (
                <>
                  <Divider />
                  <div className="text-center mt-4">
                    <Button
                      type="primary"
                      size="large"
                      onClick={loadMore}
                      loading={loading}
                      icon={<SearchOutlined />}
                    >
                      Tải thêm kết quả
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ) : (
            !loading && (
              <Card className="bg-white dark:bg-secondary-925 border border-secondary-200 dark:border-secondary-900" variant="borderless">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="text-center">
                      <Title level={4} type="secondary" className="!text-secondary-700 dark:!text-secondary-300">
                        Không tìm thấy dữ liệu ngữ pháp
                      </Title>
                      <Paragraph type="secondary" className="!text-secondary-600 dark:!text-secondary-400">
                        Vui lòng thử lại với bộ lọc khác hoặc từ khóa tìm kiếm mới.
                      </Paragraph>
                    </div>
                  }
                />
              </Card>
            )
          )}
        </Spin>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed top-20 left-4 right-4 md:relative md:left-auto md:right-auto md:top-auto z-20">
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <div className="text-center py-4">
              <Text type="danger" className="text-lg">
                ⚠️ {error}
              </Text>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Grammar;
