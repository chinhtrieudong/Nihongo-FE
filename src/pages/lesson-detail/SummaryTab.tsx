import React from "react";
import { Card, Space, Typography } from "antd";
import { ReadOutlined } from "@ant-design/icons";
import InfinitejapaneseIcon from "../../components/icons/InfinitejapaneseIcon";
import type { GrammarPattern, VocabularyItem } from "../../types/lesson";

const { Title, Text } = Typography;

type SummaryTabProps = {
  vocabularies: VocabularyItem[];
  grammars: GrammarPattern[];
};

const SummaryTab: React.FC<SummaryTabProps> = ({ vocabularies, grammars }) => {
  return (
    <div style={{ padding: "24px" }}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <Title level={4} className="mb-4 flex items-center gap-2">
              <InfinitejapaneseIcon size={18} color="currentColor" strokeWidth={2.5} />
              <span>Từ vựng trọng tâm</span>
            </Title>
            <Space orientation="vertical" className="w-full">
              {vocabularies.slice(0, 5).map((vocab) => (
                <Card key={vocab.id} size="small" className="bg-secondary-50 dark:bg-secondary-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <Text strong>{vocab.kanji}</Text>
                      <Text className="ml-2 !text-secondary-700 dark:!text-secondary-400">
                        ({vocab.hiragana})
                      </Text>
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>

          <Card>
            <Title level={4} className="mb-4 flex items-center gap-2">
              <ReadOutlined />
              <span>Ngữ pháp chính</span>
            </Title>
            <Space orientation="vertical" className="w-full">
              {grammars.map((grammar) => (
                <Card key={grammar.id} size="small" className="bg-secondary-50 dark:bg-secondary-800">
                  <Text strong>{grammar.pattern}</Text>
                </Card>
              ))}
            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SummaryTab;
