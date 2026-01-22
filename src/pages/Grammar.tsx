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
import { SearchOutlined, BookOutlined, FilterOutlined } from '@ant-design/icons';
import { grammarAPI, GrammarItem } from '../services/grammarApi';
import GrammarSectionAccordion from '../components/GrammarSectionAccordion';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Grammar: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>('N5');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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

        if (searchQuery.trim()) {
          // Search mode
          response = await grammarAPI.searchGrammar({
            q: searchQuery,
            level: selectedLevel,
            category: selectedCategory || undefined,
            page: currentPage,
            limit: 20
          });
        } else {
          // Normal mode - get by level with optional category filter
          response = await grammarAPI.getGrammarByLevel(selectedLevel, {
            category: selectedCategory || undefined,
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

  // Transform grammar data to match expected format for GrammarSectionAccordion
  const transformedSections = grammarData.map((item, index) => ({
    id: item.id,
    title: `${item.pattern} - ${item.explanation.substring(0, 50)}...`,
    structure: [item.pattern],
    meaning: [item.explanation],
    examples: item.examples.map(ex => ({ japanese: ex.japanese, vietnamese: ex.vietnamese })),
    comparison: item.comparison ? [item.comparison] : [],
    formation: item.formation,
    usage: item.usage,
    level: item.level,
    category: item.category,
    importance: item.importance,
    examFrequency: item.exam_frequency,
    commonMistakes: item.common_mistakes,
    relatedPatterns: item.related_patterns
  }));

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const categories = [
    { value: '', label: 'Tất cả' },
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
    <div className="grammar-page p-6 bg-secondary-50 dark:bg-secondary-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6" variant="borderless">
          <div className="text-center">
            <Title level={2} className="mb-2">
              <BookOutlined className="mr-2" />
              Ngữ pháp Nhật Bản
            </Title>
            <Paragraph type="secondary" className="text-lg mb-0">
              Học ngữ pháp theo trình độ JLPT với hệ thống phân loại chi tiết
            </Paragraph>
          </div>
        </Card>

        {/* Filters and Search */}
        <Card className="mb-6" title={
          <span>
            <FilterOutlined className="mr-2" />
            Bộ lọc và Tìm kiếm
          </span>
        }>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Space orientation="vertical" className="w-full">
                <Text strong>Tìm kiếm ngữ pháp</Text>
                <Input.Search
                  placeholder="Nhập mẫu ngữ pháp, từ khóa..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onSearch={handleSearch}
                  allowClear
                  enterButton
                  size="large"
                  prefix={<SearchOutlined />}
                />
              </Space>
            </Col>
            <Col xs={24} md={6}>
              <Space orientation="vertical" className="w-full">
                <Text strong>Trình độ JLPT</Text>
                <Select
                  value={selectedLevel}
                  onChange={handleLevelChange}
                  size="large"
                  className="w-full"
                >
                  {levels.map(level => (
                    <Option key={level} value={level}>
                      <Tag color={getLevelColor(level)}>{level}</Tag>
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col xs={24} md={6}>
              <Space orientation="vertical" className="w-full">
                <Text strong>Danh mục</Text>
                <Select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  size="large"
                  className="w-full"
                  allowClear
                  placeholder="Chọn danh mục"
                >
                  {categories.map(cat => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.value && <Tag color={getCategoryColor(cat.value)} className="mr-2">{cat.label}</Tag>}
                      {cat.label}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Results Statistics */}
        {totalItems > 0 && (
          <Card className="mb-6" variant="borderless">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Kết quả hiện tại"
                  value={grammarData.length}
                  suffix={`/ ${totalItems}`}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Trình độ"
                  value={selectedLevel}
                  prefix={<Tag color={getLevelColor(selectedLevel)}>{selectedLevel}</Tag>}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Danh mục"
                  value={selectedCategory ? categories.find(c => c.value === selectedCategory)?.label : 'Tất cả'}
                />
              </Col>
            </Row>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mb-6" variant="borderless">
            <div className="text-center py-4">
              <Text type="danger" className="text-lg">
                ⚠️ {error}
              </Text>
            </div>
          </Card>
        )}

        {/* Grammar Content */}
        <Spin spinning={loading} size="large">
          {grammarData.length > 0 ? (
            <Card
              title={
                <div className="flex items-center justify-between">
                  <span>
                    <BookOutlined className="mr-2" />
                    Danh sách ngữ pháp
                  </span>
                  <Space>
                    <Tag color={getLevelColor(selectedLevel)}>{selectedLevel}</Tag>
                    {selectedCategory && (
                      <Tag color={getCategoryColor(selectedCategory)}>
                        {categories.find(c => c.value === selectedCategory)?.label}
                      </Tag>
                    )}
                  </Space>
                </div>
              }
              className="grammar-content-card"
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
            <Card variant="borderless">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-center">
                    <Title level={4} type="secondary">
                      Không tìm thấy dữ liệu ngữ pháp
                    </Title>
                    <Paragraph type="secondary">
                      Vui lòng thử lại với bộ lọc khác hoặc từ khóa tìm kiếm mới.
                    </Paragraph>
                  </div>
                }
              />
            </Card>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default Grammar;
