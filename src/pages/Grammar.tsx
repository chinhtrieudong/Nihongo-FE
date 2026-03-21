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
import type { SelectProps } from 'antd';
import { SearchOutlined, ExperimentOutlined } from '@ant-design/icons';
import { grammarAPI, GrammarItem } from '../services/grammarApi';
import GrammarSectionAccordion from '../components/GrammarSectionAccordion';

const { Title, Text, Paragraph } = Typography;
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
          console.log('Grammar data from API:', response.data.grammar);
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

  // Transform grammar data to match expected format for GrammarSectionAccordion
  const transformedSections = grammarData.map((item, index) => {
    // Only include fields that actually exist in the API data
    const section: any = {
      id: item.id,
      title: item.pattern,
      subtitle: item.meaning_vi,
    };

    // Conditionally add fields only if they exist and have data
    if (item.structure) {
      section.structure = [item.structure];
    }

    if (item.meaning_vi) {
      section.meaning = [item.meaning_vi];
    }

    if (item.examples && item.examples.length > 0) {
      section.examples = item.examples;
      section.preview = item.examples[0].japanese;
    }

    if (item.comparisons && item.comparisons.length > 0) {
      section.comparison = item.comparisons;
    }

    if (item.structure) {
      section.formation = item.structure;
    }

    if (item.usage_vi) {
      section.usage = item.usage_vi;
    }

    if (item.level) {
      section.level = item.level;
    }

    if (item.importance) {
      section.importance = item.importance;
    }

    return section;
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

  const renderLevelTag: SelectProps<string[]>['tagRender'] = (props) => {
    const { label, value, closable, onClose } = props;
    return (
      <Tag
        color={getLevelColor(String(value))}
        closable={closable}
        onClose={onClose}
        className="mr-1"
      >
        {label}
      </Tag>
    );
  };

  const renderCategoryTag: SelectProps<string[]>['tagRender'] = (props) => {
    const { label, value, closable, onClose } = props;
    return (
      <Tag
        color={getCategoryColor(String(value))}
        closable={closable}
        onClose={onClose}
        className="mr-1"
      >
        {label}
      </Tag>
    );
  };

  return (
    <div className="grammar-page min-h-full bg-gray-50 dark:bg-secondary-900 academic-canvas">
      {/* Desktop Layout */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-secondary-100 mb-3">
            Học Ngữ pháp
          </h1>
          <p className="text-gray-600 dark:text-secondary-400 text-lg">
            Học theo lộ trình JLPT • Có ví dụ • Có luyện tập
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 rounded-2xl border border-[#e6e8ee] dark:border-secondary-700 bg-[#f3f4f8] dark:bg-secondary-800 shadow-none p-2.5 sm:p-3">
          <div className="flex flex-col md:flex-row md:items-center gap-1.5">
            <div className="flex-1 min-w-0">
              <Input
                placeholder="Tìm ngữ pháp: ～ですか / 何～ / この～"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
                size="small"
                prefix={<SearchOutlined className="text-secondary-500" />}
                className="w-full [&_.ant-input-prefix]:text-secondary-500"
              />
            </div>
            <div className="w-full md:w-[180px]">
              <Select
                value={selectedLevel}
                onChange={handleLevelChange}
                mode="multiple"
                maxTagCount="responsive"
                tagRender={renderLevelTag}
                allowClear
                placeholder="Chọn cấp độ"
                size="small"
                className="w-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-[#d9dce5] [&_.ant-select-selector]:!bg-white"
                options={levels.map((level) => ({
                  value: level,
                  label: <Tag color={getLevelColor(level)} className="m-0">{level}</Tag>,
                }))}
              />
            </div>
            <div className="w-full md:w-[180px]">
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                mode="multiple"
                maxTagCount="responsive"
                tagRender={renderCategoryTag}
                allowClear
                placeholder="Chọn danh mục"
                size="small"
                className="w-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-[#d9dce5] [&_.ant-select-selector]:!bg-white"
                options={categories.map((cat) => ({
                  value: cat.value,
                  label: <Tag color={getCategoryColor(cat.value)} className="m-0">{cat.label}</Tag>,
                }))}
              />
            </div>
          </div>
        </div>

        {/* Results Statistics */}
        {totalItems > 0 && (
          <Card className="mb-6 sm:mb-8 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700" variant="borderless">
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
              className="grammar-content-card bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700"
            >
              <GrammarSectionAccordion sections={transformedSections} />

              {/* Load More Button */}
              {hasMore && (
                <>
                  <Divider />
                  <div className="text-center mt-4">
                    <Button
                      onClick={loadMore}
                      loading={loading}
                      className="rounded-xl"
                    >
                      {loading ? 'Đang tải...' : 'Xem thêm'}
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ) : (
            !loading && (
              <Card className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700" variant="borderless">
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
