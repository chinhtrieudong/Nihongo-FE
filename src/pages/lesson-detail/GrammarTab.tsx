import React from "react";
import { Card, Typography } from "antd";
import GrammarSectionAccordion from "../../components/GrammarSectionAccordion";
import type { GrammarPattern } from "../../types/lesson";

const { Text } = Typography;

type GrammarTabProps = {
  grammars: GrammarPattern[];
  lessonInfo?: {
    level?: string;
  };
};

const GrammarTab: React.FC<GrammarTabProps> = ({ grammars, lessonInfo }) => {
  // Transform grammar data to match expected format for GrammarSectionAccordion
  // Only include fields that actually exist in the API data
  const transformedGrammars = grammars.map((item, index) => {
    // Transform to match GrammarPoint interface expected by GrammarSectionAccordion
    const grammar: any = {
      _id: item.id || `grammar_${index}`,
      title: item.pattern || item.title || "",
      explanation: item.explanation || item.meaning_vi || item.usage_vi || "",
      examples: item.examples ? item.examples.map(ex =>
        typeof ex === 'string' ? ex : ex.japanese || ""
      ) : [],
    };

    // Add additional fields if they exist
    if (item.structure) {
      grammar.structure = item.structure;
    }

    if (item.notes) {
      grammar.notes = item.notes;
    }

    if (item.category) {
      grammar.category = item.category;
    }

    if (item.level) {
      grammar.level = item.level;
    }

    if (item.meaning_vi) {
      grammar.meaning = [item.meaning_vi];
    }

    if (item.usage_vi) {
      grammar.usage = item.usage_vi;
    }

    return grammar;
  });

  return (
    <div style={{ padding: "24px" }}>
      <Card className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700">
        <div className="mb-4 flex items-center gap-4">
          <Text className="!text-secondary-700 dark:!text-secondary-400">
            Tổng số mẫu ngữ pháp: <strong>{grammars.length}</strong>
          </Text>
          {lessonInfo?.level && (
            <Text className="!text-secondary-700 dark:!text-secondary-400">
              Cấp độ: <strong>{lessonInfo.level}</strong>
            </Text>
          )}
        </div>

        {grammars.length > 0 ? (
          <GrammarSectionAccordion grammars={transformedGrammars} lessonInfo={lessonInfo} />
        ) : (
          <div className="text-center py-8">
            <Text className="!text-secondary-700 dark:!text-secondary-400">
              Chưa có dữ liệu ngữ pháp cho bài học này.
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default GrammarTab;
