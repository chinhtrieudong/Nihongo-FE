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
  const transformedSections = grammars.map((item, index) => {
    // Only include fields that actually exist in the API data
    const section: any = {
      id: item.id || `grammar_${index}`,
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

    if (item.comparison && item.comparison.length > 0) {
      section.comparison = item.comparison;
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

  return (
    <div style={{ padding: "24px" }}>
      <Card className="bg-white dark:bg-secondary-925 border-secondary-200 dark:border-secondary-900">
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
          <GrammarSectionAccordion sections={transformedSections} />
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
