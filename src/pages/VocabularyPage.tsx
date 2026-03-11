import React from "react";
import { useParams } from "react-router-dom";
import VocabularyList from "../components/VocabularyList";

const VocabularyPage: React.FC = () => {
  // Get lesson number from URL params
  const { lessonNumber } = useParams<{ lessonNumber: string }>();
  const lessonNum = lessonNumber ? parseInt(lessonNumber) : 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <VocabularyList lessonNumber={lessonNum} />
    </div>
  );
};

export default VocabularyPage;
