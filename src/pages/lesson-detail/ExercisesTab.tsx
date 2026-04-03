import React from "react";
import {
  Button,
  Card,
  Space,
  Typography,
  Input,
} from "antd";
import { CheckCircle, ChevronLeft, ChevronRight, Bot } from "lucide-react";
import ReorderExercise from "@components/exercises/ReorderExercise";
import type { Exercise } from "../../types/lesson";

const { Title, Text, Paragraph } = Typography;

type ExercisesTabProps = {
  exercises: Exercise[];
  exerciseResults: Record<string, any>;
  exerciseAnswers: Record<string, string | string[]>;
  answerStatus: Record<string, "correct" | "incorrect" | null>;
  showExplanation: Record<string, boolean>;
  currentExerciseIndex: number;
  setCurrentExerciseIndex: React.Dispatch<React.SetStateAction<number>>;
  setExerciseAnswers: React.Dispatch<
    React.SetStateAction<Record<string, string | string[]>>
  >;
  handleAnswerSelect: (exerciseId: string, answer: string | string[]) => void;
  handleAllExercisesSubmit: () => void;
  handleMarkLessonComplete: () => void;
  onGoToTab: (tab: "ai") => void;
  lessonInfo?: {
    title?: string;
    lessonNumber?: number;
    level?: string;
  };
};

const ExercisesTab: React.FC<ExercisesTabProps> = ({
  exercises,
  exerciseResults,
  exerciseAnswers,
  answerStatus,
  showExplanation,
  currentExerciseIndex,
  setCurrentExerciseIndex,
  setExerciseAnswers,
  handleAnswerSelect,
  handleAllExercisesSubmit,
  handleMarkLessonComplete,
  onGoToTab,
  lessonInfo,
}) => {
  const pickFirstText = (...values: unknown[]): string => {
    for (const value of values) {
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
      if (typeof value === "number") {
        return String(value);
      }
    }
    return "";
  };

  const getRomaji = (data: any): string =>
    pickFirstText(
      data?.romaji,
      data?.question_romaji,
      data?.questionRomaji,
      data?.jp_romaji,
      data?.jpRomaji,
      data?.japanese_romaji,
      data?.japaneseRomaji,
      data?.text_romaji,
      data?.textRomaji,
    );

  const getMeaning = (data: any): string =>
    pickFirstText(
      data?.meaning,
      data?.meaning_vi,
      data?.meaningVi,
      data?.translation,
      data?.viTranslation,
      data?.vietnamese,
      data?.question_translation,
      data?.questionTranslation,
    );

  const getJapaneseText = (data: any): string =>
    pickFirstText(data?.question, data?.japanese, data?.jpText, data?.text);

  return (
    <div style={{ padding: "24px" }}>
      <Card className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 mb-6">
        <div className="flex items-center gap-4">
          <Text className="!text-secondary-700 dark:!text-secondary-400">
            Tổng số bài tập: <strong>{exercises.length}</strong>
          </Text>
          {lessonInfo?.level && (
            <Text className="!text-secondary-700 dark:!text-secondary-400">
              Cấp độ: <strong>{lessonInfo.level}</strong>
            </Text>
          )}
        </div>
      </Card>

      {(Object.keys(exerciseResults).length > 0 ||
        Object.keys(exerciseAnswers).length === exercises.length) && (
          <Card className="mb-6 bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700">
            <Title level={4}>Kết quả tổng hợp</Title>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Title level={2} style={{ color: "var(--info)" }}>
                  {Object.keys(exerciseResults).length ||
                    Object.keys(exerciseAnswers).length}
                </Title>
                <Text className="!text-secondary-700 dark:!text-secondary-400">Đã làm</Text>
              </div>
              <div className="text-center">
                <Title level={2} style={{ color: "var(--success)" }}>
                  {Object.values(answerStatus).filter((status) => status === "correct")
                    .length}
                </Title>
                <Text className="!text-secondary-700 dark:!text-secondary-400">Đúng</Text>
              </div>
              <div className="text-center">
                <Title level={2} style={{ color: "var(--error)" }}>
                  {Object.values(answerStatus).filter((status) => status === "incorrect")
                    .length}
                </Title>
                <Text className="!text-secondary-700 dark:!text-secondary-400">Sai</Text>
              </div>
            </div>

            {Object.keys(exerciseAnswers).length === exercises.length && (
              <Card className="mt-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎉</div>
                  <Title level={4} type="success" className="mb-2">
                    Xuất sắc! Bạn đã hoàn thành tất cả bài tập!
                  </Title>
                  <Paragraph type="success" className="mb-4">
                    Bạn đã nắm vững từ vựng, ngữ pháp và cấu trúc câu cơ bản của bài học
                    này.
                  </Paragraph>
                  <Space className="justify-center">
                    <Button type="primary" icon={<Bot className="w-4 h-4" />} onClick={() => onGoToTab("ai")}>
                      Luyện tập với AI
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckCircle className="w-4 h-4" />}
                      onClick={handleMarkLessonComplete}
                      style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                    >
                      Hoàn thành bài học
                    </Button>
                  </Space>
                  <Text className="block mt-4 !text-secondary-700 dark:!text-secondary-400">
                    Hoặc chọn bài tiếp theo ở sidebar để tiếp tục lộ trình học
                  </Text>
                </div>
              </Card>
            )}

            {Object.keys(exerciseAnswers).length < exercises.length && (
              <Button
                type="primary"
                onClick={handleAllExercisesSubmit}
                className="mt-4 w-full"
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                Nộp tất cả bài tập
              </Button>
            )}
          </Card>
        )}

      {exercises.length > 0 && (
        <Card className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700" styles={{ body: { padding: 12 } }}>
          <div className="flex justify-between items-center mb-4">
            <Title level={5} className="!mb-0 text-sm">Bài tập {currentExerciseIndex + 1}</Title>
            <Text className="text-xs !text-secondary-700 dark:!text-secondary-400">
              {currentExerciseIndex + 1} / {exercises.length}
            </Text>
          </div>

          {/* Mondai Audio Section */}
          {exercises[currentExerciseIndex].audioUrl && (
            <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="mb-3">
                <Text strong className="text-blue-700 dark:text-blue-300 block">
                  {exercises[currentExerciseIndex].title || "Bài tập nghe hiểu"}
                </Text>
                {exercises[currentExerciseIndex].description && (
                  <Text className="block text-sm mt-1 text-secondary-700 dark:text-secondary-400">
                    {exercises[currentExerciseIndex].description}
                  </Text>
                )}
              </div>

              <audio controls preload="metadata" className="w-full">
                <source src={exercises[currentExerciseIndex].audioUrl} />
              </audio>

              {exercises[currentExerciseIndex].instructions && (
                <Card size="small" className="mt-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                  <Text className="text-sm text-gray-700 dark:text-gray-300">
                    📋 <strong>Hướng dẫn:</strong> {exercises[currentExerciseIndex].instructions}
                  </Text>
                </Card>
              )}
            </Card>
          )}

          {/* Mondai Items/Questions */}
          {exercises[currentExerciseIndex].items && Array.isArray(exercises[currentExerciseIndex].items) && (
            <div className="space-y-4 mb-4">
              {exercises[currentExerciseIndex].items!.map((item: any, itemIndex: number) => {
                const questionText = getJapaneseText(item);
                const questionRomaji = getRomaji(item);
                const questionMeaning = getMeaning(item);
                const displayQuestionMeaning = questionMeaning || "Chưa có nghĩa";
                const answerRomaji = pickFirstText(
                  item.correct_answer_romaji,
                  item.correctAnswerRomaji,
                  item.answer_romaji,
                );

                return (
                  <Card key={itemIndex} size="small" className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Text strong className="text-blue-600 dark:text-blue-400 min-w-[24px]">
                          {itemIndex + 1}.
                        </Text>
                        <div className="flex-1">
                          <Text className="text-sm font-medium block mb-1 font-japanese">
                            {questionText || "Chưa có câu hỏi"}
                          </Text>
                          {questionRomaji && (
                            <Text className="text-xs italic block !text-secondary-700 dark:!text-secondary-400">
                              {questionRomaji}
                            </Text>
                          )}
                          <Text
                            className={`text-xs block mb-3 ${questionMeaning ? "text-green-600 dark:text-green-400" : "!text-secondary-700 dark:!text-secondary-400"}`}
                          >
                            Nghĩa: {displayQuestionMeaning}
                          </Text>

                          {/* Fill blank input */}
                          {item.type === "fill_blank" && (
                            <div className="space-y-2">
                              <Input
                                placeholder="Nhập câu trả lời..."
                                value={String(
                                  exerciseAnswers[`${exercises[currentExerciseIndex].id}_item_${itemIndex}`] || ""
                                )}
                                onChange={(e) =>
                                  handleAnswerSelect(
                                    `${exercises[currentExerciseIndex].id}_item_${itemIndex}`,
                                    e.target.value
                                  )
                                }
                                className={`mb-2 ${answerStatus[`${exercises[currentExerciseIndex].id}_item_${itemIndex}`] === "correct"
                                  ? "border-green-300 bg-green-50"
                                  : answerStatus[`${exercises[currentExerciseIndex].id}_item_${itemIndex}`] === "incorrect"
                                    ? "border-red-300 bg-red-50"
                                    : ""
                                  }`}
                                size="small"
                              />

                              {/* Show explanation if answered correctly */}
                              {showExplanation[`${exercises[currentExerciseIndex].id}_item_${itemIndex}`] && (
                                <Card size="small" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                  <Text className="text-sm text-green-700 dark:text-green-300">
                                    ✅ <strong>Đáp án mẫu:</strong> {item.correct_answer}
                                  </Text>
                                  {answerRomaji && (
                                    <Text className="text-xs italic block mt-1 !text-secondary-700 dark:!text-secondary-400">
                                      {answerRomaji}
                                    </Text>
                                  )}
                                  {item.correct_answer_translation && (
                                    <Text className="text-xs block mt-1 text-green-700 dark:text-green-300">
                                      {item.correct_answer_translation}
                                    </Text>
                                  )}
                                  {item.explanation && (
                                    <Text className="text-xs block mt-2 !text-secondary-700 dark:!text-secondary-400">
                                      💡 {item.explanation}
                                    </Text>
                                  )}
                                </Card>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Mondai Dialogues */}
          {exercises[currentExerciseIndex].dialogues && Array.isArray(exercises[currentExerciseIndex].dialogues) && (
            <div className="space-y-4 mb-4">
              {exercises[currentExerciseIndex].dialogues!.map((dialogue: any, dialogueIndex: number) => (
                <Card key={dialogueIndex} className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700">
                  <Title level={5} className="mb-3 text-purple-600 dark:text-purple-400">
                    💬 Hội thoại {dialogue.dialogue_number}
                  </Title>

                  {/* Dialogue Content */}
                  <Card size="small" className="mb-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="space-y-2">
                      {dialogue.content && dialogue.content.map((line: any, lineIndex: number) => (
                        <div key={lineIndex} className="flex items-start gap-3">
                          <Text strong className="text-gray-600 dark:text-gray-400 min-w-[32px]">
                            {line.speaker}:
                          </Text>
                          <div>
                            {(() => {
                              const lineMeaning = getMeaning(line);
                              return (
                                <>
                                  <Text className="text-sm block font-japanese">
                                    {getJapaneseText(line)}
                                  </Text>
                                  {getRomaji(line) && (
                                    <Text className="text-xs italic block !text-secondary-700 dark:!text-secondary-400">
                                      {getRomaji(line)}
                                    </Text>
                                  )}
                                  <Text
                                    className={`text-xs block ${lineMeaning ? "text-green-600 dark:text-green-400" : "!text-secondary-700 dark:!text-secondary-400"}`}
                                  >
                                    Nghĩa: {lineMeaning || "Chưa có nghĩa"}
                                  </Text>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Dialogue Questions */}
                  {dialogue.questions && dialogue.questions.map((question: any, questionIndex: number) => {
                    const questionText = getJapaneseText(question);
                    const questionRomaji = getRomaji(question);
                    const questionMeaning = getMeaning(question);
                    const displayQuestionMeaning = questionMeaning || "Chưa có nghĩa";
                    return (
                      <Card key={questionIndex} size="small" className="mb-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <div className="space-y-3">
                          <Text className="text-sm font-medium block font-japanese">
                            {questionText || "Chưa có câu hỏi"}
                          </Text>
                          {questionRomaji && (
                            <Text className="text-xs italic block !text-secondary-700 dark:!text-secondary-400">
                              {questionRomaji}
                            </Text>
                          )}
                          <Text
                            className={`text-xs block ${questionMeaning ? "text-green-600 dark:text-green-400" : "!text-secondary-700 dark:!text-secondary-400"}`}
                          >
                            Nghĩa: {displayQuestionMeaning}
                          </Text>

                          {/* Multiple choice options */}
                          {question.type === "multiple_choice" && question.options && (
                            <Space orientation="vertical" className="w-full">
                              {question.options.map((option: string, optionIndex: number) => {
                                const questionId = `${exercises[currentExerciseIndex].id}_dialogue_${dialogueIndex}_question_${questionIndex}`;
                                const isSelected = exerciseAnswers[questionId] === option;
                                const status = answerStatus[questionId];

                                return (
                                  <Card
                                    key={optionIndex}
                                    size="small"
                                    className={`cursor-pointer transition-colors ${isSelected && status === "correct"
                                      ? "border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                                      : isSelected && status === "incorrect"
                                        ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                                        : "hover:bg-secondary-100 dark:hover:bg-secondary-900"
                                      } bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700`}
                                    onClick={() => handleAnswerSelect(questionId, option)}
                                  >
                                    <Space size={6}>
                                      <input
                                        type="radio"
                                        name={`question_${questionId}`}
                                        value={option}
                                        checked={isSelected}
                                        onChange={(e) => handleAnswerSelect(questionId, e.target.value)}
                                        className="mr-2"
                                        aria-label={`Option: ${option}`}
                                      />
                                      <Text
                                        className={`text-sm ${isSelected && status === "correct"
                                          ? "text-green-700 dark:text-green-400 font-medium"
                                          : isSelected && status === "incorrect"
                                            ? "text-red-700 dark:text-red-400"
                                            : ""
                                          }`}
                                      >
                                        {option}
                                      </Text>
                                    </Space>
                                  </Card>
                                );
                              })}
                            </Space>
                          )}

                          {/* Show explanation if answered */}
                          {(() => {
                            const questionId = `${exercises[currentExerciseIndex].id}_dialogue_${dialogueIndex}_question_${questionIndex}`;
                            return showExplanation[questionId] && question.explanation && (
                              <Card size="small" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                <Text className="text-sm text-green-700 dark:text-green-300">
                                  💡 <strong>Giải thích:</strong> {question.explanation}
                                </Text>
                              </Card>
                            );
                          })()}
                        </div>
                      </Card>
                    )
                  })}
                </Card>
              ))}
            </div>
          )}

          {/* Regular Exercise Rendering (for non-mondai exercises) */}
          {!exercises[currentExerciseIndex].audioUrl && (
            <div className="mb-6">
              <Paragraph className="text-sm mb-3 font-japanese">
                {exercises[currentExerciseIndex].question}
              </Paragraph>

              {exercises[currentExerciseIndex].type === "multiple-choice" && (
                <Space orientation="vertical" className="w-full">
                  {(exercises[currentExerciseIndex].content?.options ||
                    exercises[currentExerciseIndex].options)?.map((option, index) => {
                      const exerciseId =
                        exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`;
                      const isSelected = exerciseAnswers[exerciseId] === option;
                      const status = answerStatus[exerciseId];

                      return (
                        <Card
                          key={index}
                          className={`cursor-pointer transition-colors ${isSelected && status === "correct"
                            ? "border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                            : isSelected && status === "incorrect"
                              ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                              : "hover:bg-secondary-100 dark:hover:bg-secondary-900"
                            } bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700`}
                          styles={{ body: { padding: 10 } }}
                          onClick={() => handleAnswerSelect(exerciseId, option)}
                        >
                          <Space size={6}>
                            <input
                              type="radio"
                              name="exercise"
                              value={option}
                              checked={isSelected}
                              onChange={(e) => handleAnswerSelect(exerciseId, e.target.value)}
                              className="mr-3"
                              aria-label={`Option: ${option}`}
                            />
                            <Text
                              className={`text-sm ${isSelected && status === "correct"
                                ? "text-green-700 dark:text-green-400 font-medium"
                                : isSelected && status === "incorrect"
                                  ? "text-red-700 dark:text-red-400"
                                  : ""
                                }`}
                            >
                              {option}
                            </Text>
                          </Space>
                        </Card>
                      );
                    })}
                </Space>
              )}

              {(exercises[currentExerciseIndex].type === "fill_blank" ||
                exercises[currentExerciseIndex].type === "fill-blank") && (
                  <Input
                    placeholder="Type your answer..."
                    value={String(
                      exerciseAnswers[
                      exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
                      ] || ""
                    )}
                    onChange={(e) =>
                      handleAnswerSelect(
                        exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`,
                        e.target.value
                      )
                    }
                    className={`mb-4 ${answerStatus[
                      exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
                    ] === "correct"
                      ? "border-green-300 bg-green-50"
                      : answerStatus[
                        exercises[currentExerciseIndex].id ||
                        `exercise_${currentExerciseIndex}`
                      ] === "incorrect"
                        ? "border-red-300 bg-red-50"
                        : ""
                      }`}
                    size="middle"
                  />
                )}

              {exercises[currentExerciseIndex].type === "reorder" && (
                <ReorderExercise
                  exercise={exercises[currentExerciseIndex]}
                  setAnswer={(answer: string | string[]) =>
                    setExerciseAnswers((prev) => ({
                      ...prev,
                      [exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`]:
                        answer as string,
                    }))
                  }
                  onAnswerSelect={handleAnswerSelect}
                  answerStatus={
                    answerStatus[
                    exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
                    ]
                  }
                  exerciseAnswers={exerciseAnswers}
                  exerciseId={
                    exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
                  }
                />
              )}
            </div>
          )}

          {/* Explanation and Results (for both mondai and regular exercises) */}
          {showExplanation[
            exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
          ] && !exercises[currentExerciseIndex].audioUrl && (
              <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <Title level={5} style={{ color: "#1890ff" }}>
                  💡 Giải thích:
                </Title>
                <Text className="!text-secondary-700 dark:!text-secondary-400">
                  {exercises[currentExerciseIndex].explanation}
                </Text>
              </Card>
            )}

          {exerciseResults[
            exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
          ] && !exercises[currentExerciseIndex].audioUrl && (
              <Card
                className={`mb-4 ${exerciseResults[
                  exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
                ].isCorrect
                  ? "border-green-200 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                  : "border-red-200 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                  } bg-white dark:bg-secondary-800`}
              >
                <Title
                  level={5}
                  type={
                    exerciseResults[
                      exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
                    ].isCorrect
                      ? "success"
                      : "danger"
                  }
                >
                  {exerciseResults[
                    exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
                  ].isCorrect
                    ? "✅ Correct!"
                    : "❌ Incorrect"}
                </Title>
                <Paragraph>
                  {
                    exerciseResults[
                      exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
                    ].explanation
                  }
                </Paragraph>
                {exerciseResults[
                  exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
                ].feedback && (
                    <Paragraph className="!text-secondary-700 dark:!text-secondary-400">
                      {
                        exerciseResults[
                          exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
                        ].feedback
                      }
                    </Paragraph>
                  )}
              </Card>
            )}

          <div className="flex justify-between">
            <Button
              icon={<ChevronLeft className="w-4 h-4" />}
              onClick={() => setCurrentExerciseIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentExerciseIndex === 0}
            >
              Trước
            </Button>

            {exercises[currentExerciseIndex]?.type === "reorder" && !exercises[currentExerciseIndex].audioUrl && (
              <Button
                type="primary"
                onClick={() => {
                  const exerciseId =
                    exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`;
                  const currentAnswer = exerciseAnswers[exerciseId];
                  const answerToSubmit = Array.isArray(currentAnswer)
                    ? currentAnswer[0] || ""
                    : typeof currentAnswer === "string"
                      ? currentAnswer
                      : "";
                  handleAnswerSelect(exerciseId, answerToSubmit);
                }}
              >
                Xác nhận sắp xếp
              </Button>
            )}

            <Button
              icon={<ChevronRight className="w-4 h-4" />}
              onClick={() =>
                setCurrentExerciseIndex((prev) => Math.min(exercises.length - 1, prev + 1))
              }
              disabled={currentExerciseIndex === exercises.length - 1}
            >
              Tiếp theo
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ExercisesTab;
