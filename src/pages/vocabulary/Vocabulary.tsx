import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Tag,
  Row,
  Col,
  Statistic,
  Table,
} from 'antd';
import type { SelectProps } from 'antd';
import { Book, Search } from 'lucide-react';
import { EmptyState, SearchFilter } from "../../components/common";
import FuriganaText from "../../components/common/FuriganaText";
import { lessons, levels } from "../../data/vocabulary";

const { Text } = Typography;

const Vocabulary: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredVocab = useMemo(() => {
    let result = lessons;
    if (selectedLesson) {
      result = result.filter((lesson: any) => lesson.lessonNumber === selectedLesson);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result
        .map((lesson: any) => ({
          ...lesson,
          vocabularies: lesson.vocabularies.filter((v: any) =>
            v.kanji.toLowerCase().includes(q) ||
            v.hiragana.toLowerCase().includes(q) ||
            v.romaji.toLowerCase().includes(q) ||
            v.meaning.toLowerCase().includes(q)
          ),
        }))
        .filter((lesson: any) => lesson.vocabularies.length > 0);
    }
    return result;
  }, [selectedLesson, searchQuery]);

  const handleSearch = (value: string) => setSearchQuery(value);

  const totalWords = (filteredVocab as any[]).reduce((sum: number, lesson: any) => sum + lesson.vocabularies.length, 0);

  const columns = [
    {
      title: 'Kanji',
      dataIndex: 'kanji',
      key: 'kanji',
      render: (text: string) => (
        <FuriganaText 
          text={text}
          className="text-blue-600 dark:text-blue-400 font-japanese"
          style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: '16px' }}
        />
      ),
    },
    {
      title: 'Hiragana',
      dataIndex: 'hiragana',
      key: 'hiragana',
      render: (text: string) => text || '-',
    },
    {
      title: 'Romaji',
      dataIndex: 'romaji',
      key: 'romaji',
    },
    {
      title: 'Nghĩa',
      dataIndex: 'meaning',
      key: 'meaning',
    },
    {
      title: 'Loại',
      dataIndex: 'partOfSpeech',
      key: 'partOfSpeech',
      render: (text: string) => {
        const colors: Record<string, string> = {
          noun: 'blue', verb: 'green', adjective: 'orange',
          prefix: 'purple', suffix: 'magenta', pronoun: 'cyan',
          adverb: 'geekblue'
        };
        return <Tag color={colors[text] || 'default'}>{text}</Tag>;
      },
    },
  ];

  return (
    <div className="vocabulary-page min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-3">
            Từ vựng tiếng Nhật
          </h1>
          <p className="text-text-sub text-lg">
            Từ vựng Minna no Nihongo N5 • {totalWords} từ
          </p>
        </div>

        <SearchFilter
          searchValue={searchQuery}
          searchPlaceholder="Tìm từ vựng: 学生 / gakusei / học sinh..."
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
          ]}
        />

        {totalWords > 0 && (
          <Card className="mb-6 sm:mb-8 bg-surface-1 border border-border" variant="borderless">
            <Row gutter={[8, 16]}>
              <Col xs={24} sm={8}>
                <Statistic title="Tổng số từ" value={totalWords}
                  styles={{ content: { fontSize: '1.25rem', color: 'inherit' } }} />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic title="Số bài"
                  value={selectedLesson ? 1 : lessons.length}
                  styles={{ content: { fontSize: '1.25rem', color: 'inherit' } }} />
              </Col>
            </Row>
          </Card>
        )}

        {filteredVocab.length > 0 ? (
          <div className="space-y-6">
            {(filteredVocab as any[]).map((lesson: any) => (
              <Card key={lesson.lessonNumber}
                title={
                  <div className="flex items-center gap-3">
                    <Book className="w-5 h-5 text-blue-500" />
                    <span>Bài {lesson.lessonNumber}: {lesson.title}</span>
                    <Tag color="green" className="ml-2">{lesson.vocabularies.length} từ</Tag>
                  </div>
                }
                className="vocabulary-content-card bg-surface-1 border border-border"
              >
                <Table
                  dataSource={lesson.vocabularies}
                  columns={columns}
                  rowKey={(record) => `${lesson.lessonNumber}_${record.romaji}`}
                  size="middle"
                  pagination={false}
                  className="vocabulary-table"
                />
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-surface-1 border border-border" variant="borderless">
            <EmptyState type="search" title="Không tìm thấy từ vựng"
              description="Vui lòng thử lại với bộ lọc khác hoặc từ khóa tìm kiếm mới."
              size="default" />
          </Card>
        )}
      </div>
    </div>
  );
};

export default Vocabulary;
