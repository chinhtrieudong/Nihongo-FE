import React from "react";
import { Card, Typography } from "antd";
import GrammarSectionAccordion from "../../components/GrammarSectionAccordion";
import type { GrammarPattern } from "../../types/lesson";

const { Title, Text } = Typography;

type GrammarTabProps = {
  lessonNumber?: number;
  grammars: GrammarPattern[];
};

const GrammarTab: React.FC<GrammarTabProps> = ({ lessonNumber, grammars }) => {
  return (
    <div style={{ padding: "24px" }}>
      <Card className="bg-white dark:bg-secondary-925 border-secondary-200 dark:border-secondary-900">
        <div className="mb-4">
          <Title level={4}>Ngữ pháp bài {lessonNumber}</Title>
        </div>

        {grammars.length > 0 ? (
          <GrammarSectionAccordion
            sections={grammars.map((grammar, index) => ({
              id: `section${index + 1}`,
              title: grammar.pattern || `Ngữ pháp ${index + 1}`,
              structure: grammar.structure ? [grammar.structure] : [grammar.pattern || ""],
              meaning: grammar.meaning_vi
                ? [grammar.meaning_vi]
                : grammar.meaning
                  ? [grammar.meaning]
                  : [""],
              examples:
                grammar.examples?.map((ex) => ({
                  japanese: ex.japanese,
                  vietnamese: ex.vietnamese || ex.meaning || "",
                })) || [],
              comparison: grammar.comparison ? [grammar.comparison] : [],
            }))}
          />
        ) : (
          <div className="text-center py-8">
            <Text type="secondary" className="text-secondary-600 dark:text-secondary-800">
              Chưa có dữ liệu ngữ pháp cho bài học này.
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default GrammarTab;
