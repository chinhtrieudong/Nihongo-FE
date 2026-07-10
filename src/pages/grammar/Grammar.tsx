import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Tag,
  Row,
  Col,
  Statistic,
  Collapse,
} from 'antd';
import type { SelectProps } from 'antd';
import { Book, CheckCircle } from 'lucide-react';
import { EmptyState, SearchFilter } from "../../components/common";
import FuriganaText from "../../components/common/FuriganaText";
import { lessons, categories, levels } from "../../data/grammar";

const { Text, Paragraph } = Typography;

const Grammar: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string[]>(['N5']);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLessons = useMemo(() => {
    let result = lessons;
    if (selectedLevel.length > 0) {
      result = result.filter((lesson: any) => selectedLevel.includes(lesson.level));
    }
    if (selectedCategory.length > 0) {
      result = result
        .map((lesson: any) => ({
          ...lesson,
          grammars: lesson.grammars.filter((g: any) =>
            selectedCategory.includes(g.category)
          ),
        }))
        .filter((lesson: any) => lesson.grammars.length > 0);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result
        .map((lesson: any) => ({
          ...lesson,
          grammars: lesson.grammars.filter((g: any) =>
            g.pattern.toLowerCase().includes(q) ||
            g.meaning.toLowerCase().includes(q) ||
            g.explanation.toLowerCase().includes(q) ||
            g.title.toLowerCase().includes(q)
          ),
        }))
        .filter((lesson: any) => lesson.grammars.length > 0);
    }
    return result;
  }, [selectedLevel, selectedCategory, searchQuery]);

  const handleSearch = (value: string) => setSearchQuery(value);
  const handleLevelChange = (levels: string[]) => setSelectedLevel(levels || []);
  const handleCategoryChange = (categories: string[]) => setSelectedCategory(categories || []);

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      N5: 'green', N4: 'blue', N3: 'orange', N2: 'red', N1: 'purple'
    };
    return colors[level] || 'default';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      particles: 'cyan', verb_forms: 'geekblue', adjectives: 'gold',
      conjunctions: 'lime', expressions: 'magenta', time: 'volcano',
      comparison: 'purple', conditionals: 'orange',
      basic_sentence_structure: 'blue', copula: 'green',
      negative_form: 'red', questions: 'orange',
      possessive: 'purple', honorifics: 'magenta',
      demonstratives: 'cyan', confirmation: 'lime',
      acknowledgment: 'gold', location_words: 'geekblue',
      direction_words: 'volcano', location_sentences: 'blue',
      existence_verbs: 'green', time_telling: 'orange',
      time_words: 'purple', dates: 'red'
    };
    return colors[category] || 'default';
  };

  const renderLevelTag: SelectProps<string[]>['tagRender'] = (props) => {
    const { label, value, closable, onClose } = props;
    return (
      <Tag color={getLevelColor(String(value))} closable={closable} onClose={onClose}
        className="m-0.5 !px-1 !py-0 text-xs">{label}</Tag>
    );
  };

  const renderCategoryTag: SelectProps<string[]>['tagRender'] = (props) => {
    const { label, value, closable, onClose } = props;
    return (
      <Tag color={getCategoryColor(String(value))} closable={closable} onClose={onClose}
        className="m-0.5 !px-1 !py-0 text-xs">{label}</Tag>
    );
  };

  const displayLessons = selectedLesson
    ? filteredLessons.filter((lesson: any) => lesson.lessonNumber === selectedLesson)
    : filteredLessons;

  const totalGrammars = (displayLessons as any[]).reduce((sum: number, lesson: any) => sum + lesson.grammars.length, 0);

  return (
    <div className="grammar-page min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-3">
            Ngữ pháp tiếng Nhật
          </h1>
          <p className="text-text-sub text-lg">
            Hệ thống ngữ pháp theo trình độ JLPT • Học qua ví dụ thực tế
          </p>
        </div>

        {/* Filters */}
        <SearchFilter
          searchValue={searchQuery}
          searchPlaceholder="Tìm ngữ pháp: ～ですか / 何～ / この～"
          onSearchChange={handleSearch}
          className="mb-6"
          filters={[
            {
              key: 'lesson',
              value: selectedLesson ? String(selectedLesson) : '',
              placeholder: 'Chọn bài',
              onChange: (val) => setSelectedLesson(val && val !== '' ? Number(val) : null),
              options: [
                { value: '', label: 'Tất cả các bài' },
                ...(lessons || []).map((lesson: any) => ({
                  value: String(lesson.lessonNumber),
                  label: `Bài ${lesson.lessonNumber}: ${lesson.title}`,
                })),
              ],
            },
            {
              key: 'level',
              value: selectedLevel,
              placeholder: 'Chọn cấp độ',
              mode: 'multiple',
              tagRender: renderLevelTag,
              onChange: handleLevelChange,
              options: levels.map((level: string) => ({
                value: level,
                label: <Tag color={getLevelColor(level)} className="m-0">{level}</Tag>,
              })),
            },
            {
              key: 'category',
              value: selectedCategory,
              placeholder: 'Chọn danh mục',
              mode: 'multiple',
              tagRender: renderCategoryTag,
              onChange: handleCategoryChange,
              options: categories.map((cat: any) => ({
                value: cat.value,
                label: <Tag color={getCategoryColor(cat.value)} className="m-0">{cat.label}</Tag>,
              })),
            },
          ]}
        />

        {/* Stats */}
        {totalGrammars > 0 && (
          <Card className="mb-6 sm:mb-8 bg-surface-1 border border-border" variant="borderless">
            <Row gutter={[8, 16]}>
              <Col xs={24} sm={8}>
                <Statistic title="Tổng số ngữ pháp" value={totalGrammars}
                  styles={{ content: { fontSize: '1.5rem', color: 'inherit' } }} />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic title="Trình độ"
                  value={selectedLevel.length ? selectedLevel.join(', ') : 'Tất cả'}
                  styles={{ content: { fontSize: '1.5rem', color: 'inherit' } }} />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic title="Danh mục"
                  value={selectedCategory.length ? selectedCategory.length : 'Tất cả'}
                  styles={{ content: { fontSize: '1.5rem', color: 'inherit' } }} />
              </Col>
            </Row>
          </Card>
        )}

        {/* Lessons */}
        {displayLessons.length > 0 ? (
          <div className="space-y-6">
            {(displayLessons as any[]).map((lesson: any) => (
              <Card key={lesson.lessonNumber}
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Book className="w-5 h-5 text-blue-500" />
                      <span className="text-xl font-bold">
                        Bài {lesson.lessonNumber}: {lesson.title}
                      </span>
                      <Tag color={getLevelColor(lesson.level)} className="text-base px-2 py-0.5">{lesson.level}</Tag>
                    </div>
                    <Text type="secondary" className="text-base">{lesson.grammars.length} ngữ pháp</Text>
                  </div>
                }
                className="grammar-content-card bg-surface-1 border border-border"
              >
                <div className="mb-4">
                  <Text className="text-lg text-gray-600 dark:text-gray-400">{lesson.description}</Text>
                </div>

                <Collapse
                  size="large"
                  items={lesson.grammars.map((grammar: any) => ({
                    key: grammar.id,
                    label: (
                      <div className="flex items-center justify-between w-full gap-2 pr-4">
                        <div className="flex items-start md:items-center gap-2 flex-1">
                          <Text strong className="text-2xl text-blue-700 dark:text-blue-400 whitespace-normal break-words font-japanese" 
                            style={{ fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif", fontSize: '1.5rem' }}>
                            {grammar.pattern}
                          </Text>
                          <Tag color={getCategoryColor(grammar.category)} 
                            className="text-sm flex-shrink-0 mt-1 md:mt-0 px-2 py-0.5">
                            {categories.find((c: any) => c.value === grammar.category)?.label || grammar.category}
                          </Tag>
                        </div>
                      </div>
                    ),
                    children: (
                      <div className="space-y-5">
                        {/* Explanation */}
                        <div>
                          <Text strong className="text-xl">Giải thích:</Text>
                          <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-xl font-japanese" 
                              style={{ fontFamily: "'Noto Sans JP', sans-serif", lineHeight: '1.8', fontSize: '1.15rem' }}>
                              {grammar.explanation}
                            </p>
                          </div>
                        </div>

                        {/* Structure */}
                        <div>
                          <Text strong className="text-xl">Cấu trúc:</Text>
                          <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-xl font-mono font-semibold text-blue-700 dark:text-blue-400"
                              style={{ fontFamily: "'Noto Sans JP', monospace", lineHeight: '1.8', fontSize: '1.3rem' }}>
                              {grammar.structure}
                            </p>
                          </div>
                        </div>

                        {/* Examples */}
                        <div>
                          <Text strong className="text-xl">Ví dụ:</Text>
                          <div className="mt-2">
                            {grammar.examples.map((example: any, index: number) => (
                              <div key={index} className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                <div className="flex items-start gap-2 mb-1">
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  <FuriganaText 
                                    text={example.japanese}
                                    className="text-2xl text-blue-600 dark:text-blue-400 font-japanese"
                                    style={{ fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif", lineHeight: '1.8' }}
                                  />
                                </div>
                                <Text className="text-xl text-gray-600 dark:text-gray-400 ml-8 font-japanese"
                                  style={{ fontFamily: "'Noto Sans JP', sans-serif", lineHeight: '1.6' }}>
                                  {example.vietnamese}
                                </Text>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        {grammar.notes && (
                          <div>
                            <Text strong className="text-xl">Ghi chú:</Text>
                            <Paragraph className="mt-1 text-orange-600 dark:text-orange-400 italic text-lg">
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
          <Card className="bg-surface-1 border border-border" variant="borderless">
            <EmptyState type="search" title="Không tìm thấy dữ liệu ngữ pháp"
              description="Vui lòng thử lại với bộ lọc khác hoặc từ khóa tìm kiếm mới."
              size="default" />
          </Card>
        )}
      </div>

      <style>{`
        .furigana-ruby {
          ruby-align: center;
        }
        .furigana-rt {
          font-size: 0.55em;
          color: #666;
        }
        .dark .furigana-rt {
          color: #999;
        }
      `}</style>
    </div>
  );
};

export default Grammar;