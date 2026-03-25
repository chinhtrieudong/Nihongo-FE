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
  Divider,
  Collapse,
  List
} from 'antd';
import type { SelectProps } from 'antd';
import { SearchOutlined, ExperimentOutlined, BookOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { grammarAPI } from '../services/grammarApi';

const { Title, Text, Paragraph } = Typography;

interface GrammarExample {
  japanese: string;
  vietnamese: string;
}

interface GrammarItem {
  id: string;
  title: string;
  pattern: string;
  meaning: string;
  explanation: string;
  structure: string;
  examples: GrammarExample[];
  notes?: string;
  category: string;
}

interface Lesson {
  lessonNumber: number;
  title: string;
  title_jp: string;
  level: string;
  description: string;
  grammars: GrammarItem[];
}

interface GrammarData {
  lessons: Lesson[];
  categories: { value: string; label: string }[];
  levels: string[];
}

const Grammar: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string[]>(['N5']);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [grammarData, setGrammarData] = useState<GrammarData | null>(null);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load grammar data from API
  useEffect(() => {
    const loadGrammarData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const levelParam = selectedLevel.length ? selectedLevel.join(',') : undefined;
        const categoryParam = selectedCategory.length ? selectedCategory.join(',') : undefined;
        
        let response;
        
        if (searchQuery.trim()) {
          // Search mode
          response = await grammarAPI.searchGrammar({
            q: searchQuery,
            level: levelParam,
            category: categoryParam,
            page: 1,
            limit: 50
          });
        } else {
          // Normal mode - get all with optional multi-level/category filter
          response = await grammarAPI.getAllGrammar({
            level: levelParam,
            category: categoryParam,
            page: 1,
            limit: 50
          });
        }
        
        if (response.success && response.data) {
          setGrammarData({
            lessons: response.data.lessons,
            categories: response.data.categories,
            levels: response.data.levels
          });
          setFilteredLessons(response.data.lessons);
        }
      } catch (err) {
        console.error('Error loading grammar data:', err);
        setError('Không thể tải dữ liệu ngữ pháp. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    loadGrammarData();
  }, [selectedLevel, selectedCategory, searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleLevelChange = (levels: string[]) => {
    setSelectedLevel(levels || []);
  };

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategory(categories || []);
  };

  const categories = grammarData?.categories || [];
  const levels = grammarData?.levels || ['N5', 'N4', 'N3', 'N2', 'N1'];

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
      verb_forms: 'geekblue',
      adjectives: 'gold',
      conjunctions: 'lime',
      expressions: 'magenta',
      time: 'volcano',
      comparison: 'purple',
      conditionals: 'orange',
      basic_sentence_structure: 'blue',
      copula: 'green',
      negative_form: 'red',
      questions: 'orange',
      possessive: 'purple',
      honorifics: 'magenta',
      demonstratives: 'cyan',
      confirmation: 'lime',
      acknowledgment: 'gold',
      location_words: 'geekblue',
      direction_words: 'volcano',
      location_sentences: 'blue',
      existence_verbs: 'green',
      time_telling: 'orange',
      time_words: 'purple',
      dates: 'red'
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

  const totalGrammars = filteredLessons.reduce((sum, lesson) => sum + lesson.grammars.length, 0);

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
        {totalGrammars > 0 && (
          <Card className="mb-6 sm:mb-8 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700" variant="borderless">
            <Row gutter={[8, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Tổng số ngữ pháp"
                  value={totalGrammars}
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
                  value={selectedCategory.length ? selectedCategory.length : 'Tất cả'}
                  valueStyle={{ fontSize: '1.2rem', color: 'inherit' }}
                />
              </Col>
            </Row>
          </Card>
        )}

        <Spin spinning={loading} size="large">
          {error ? (
            <Card className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700" variant="borderless">
              <div className="text-center py-8">
                <Text type="danger" className="text-lg">
                  ⚠️ {error}
                </Text>
              </div>
            </Card>
          ) : filteredLessons.length > 0 ? (
            <div className="space-y-6">
              {filteredLessons.map((lesson) => (
                <Card
                  key={lesson.lessonNumber}
                  title={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOutlined className="text-blue-500" />
                        <span>
                          Bài {lesson.lessonNumber}: {lesson.title}
                        </span>
                        <Tag color={getLevelColor(lesson.level)}>{lesson.level}</Tag>
                      </div>
                      <Text type="secondary" className="text-sm">
                        {lesson.grammars.length} ngữ pháp
                      </Text>
                    </div>
                  }
                  className="grammar-content-card bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700"
                >
                  <div className="mb-4">
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      {lesson.description}
                    </Text>
                  </div>
                  
                  <Collapse
                    items={lesson.grammars.map((grammar) => ({
                      key: grammar.id,
                      label: (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Text strong>{grammar.pattern}</Text>
                            <Tag color={getCategoryColor(grammar.category)} className="text-xs">
                              {categories.find(c => c.value === grammar.category)?.label || grammar.category}
                            </Tag>
                          </div>
                          <Text type="secondary" className="text-sm">
                            {grammar.meaning}
                          </Text>
                        </div>
                      ),
                      children: (
                        <div className="space-y-4">
                          <div>
                            <Text strong className="text-base">Giải thích:</Text>
                            <Paragraph className="mt-1 text-gray-700 dark:text-gray-300">
                              {grammar.explanation}
                            </Paragraph>
                          </div>
                          
                          <div>
                            <Text strong className="text-base">Cấu trúc:</Text>
                            <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                              <code className="text-lg font-mono">{grammar.structure}</code>
                            </div>
                          </div>
                          
                          <div>
                            <Text strong className="text-base">Ví dụ:</Text>
                            <List
                              className="mt-2"
                              dataSource={grammar.examples}
                              renderItem={(example) => (
                                <List.Item className="border-0 px-0">
                                  <div className="w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                      <CheckCircleOutlined className="text-green-500" />
                                      <Text strong className="text-blue-600 dark:text-blue-400">
                                        {example.japanese}
                                      </Text>
                                    </div>
                                    <Text className="text-gray-600 dark:text-gray-400 ml-6">
                                      {example.vietnamese}
                                    </Text>
                                  </div>
                                </List.Item>
                              )}
                            />
                          </div>
                          
                          {grammar.notes && (
                            <div>
                              <Text strong className="text-base">Ghi chú:</Text>
                              <Paragraph className="mt-1 text-orange-600 dark:text-orange-400 italic">
                                {grammar.notes}
                              </Paragraph>
                            </div>
                          )}
                        </div>
                      )
                    }))}
                  />
                </Card>
              ))}
            </div>
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
    </div>
  );
};

export default Grammar;