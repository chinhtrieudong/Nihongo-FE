import React from "react";
import { Button, Card, Input, Space, Typography } from "antd";
import {
  CheckCircleOutlined,
  LeftOutlined,
  RightOutlined,
  RobotOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import ReorderExercise from "../../components/ReorderExercise";
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
  onGoToTab: (tab: "ai" | "summary") => void;
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
}) => {
  return (
    <div style={{ padding: "24px" }}>
      <Title level={3} className="mb-6">
        BÀI TẬP
      </Title>

      {(Object.keys(exerciseResults).length > 0 ||
        Object.keys(exerciseAnswers).length === exercises.length) && (
        <Card className="mb-6 bg-white dark:bg-secondary-925 border-secondary-200 dark:border-secondary-900">
          <Title level={4}>Kết quả tổng hợp</Title>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Title level={2} style={{ color: "#1890ff" }}>
                {Object.keys(exerciseResults).length ||
                  Object.keys(exerciseAnswers).length}
              </Title>
              <Text type="secondary">Đã làm</Text>
            </div>
            <div className="text-center">
              <Title level={2} style={{ color: "#52c41a" }}>
                {Object.values(answerStatus).filter((status) => status === "correct")
                  .length}
              </Title>
              <Text type="secondary">Đúng</Text>
            </div>
            <div className="text-center">
              <Title level={2} style={{ color: "#ff4d4f" }}>
                {Object.values(answerStatus).filter((status) => status === "incorrect")
                  .length}
              </Title>
              <Text type="secondary">Sai</Text>
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
                  <Button type="primary" icon={<RobotOutlined />} onClick={() => onGoToTab("ai")}>
                    Luyện tập với AI
                  </Button>
                  <Button icon={<TrophyOutlined />} onClick={() => onGoToTab("summary")}>
                    Xem tổng kết
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={handleMarkLessonComplete}
                    style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                  >
                    Hoàn thành bài học
                  </Button>
                </Space>
                <Text type="secondary" className="block mt-4">
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
        <Card className="bg-white dark:bg-secondary-925 border-secondary-200 dark:border-secondary-900">
          <div className="flex justify-between items-center mb-4">
            <Title level={4}>Bài tập {currentExerciseIndex + 1}</Title>
            <Text type="secondary">
              {currentExerciseIndex + 1} / {exercises.length}
            </Text>
          </div>

          <div className="mb-6">
            <Paragraph className="text-lg mb-4">
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
                      className={`cursor-pointer transition-colors ${
                        isSelected && status === "correct"
                          ? "border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                          : isSelected && status === "incorrect"
                            ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                            : "hover:bg-secondary-100 dark:hover:bg-secondary-900"
                      } bg-white dark:bg-secondary-925 border-secondary-200 dark:border-secondary-900`}
                      onClick={() => handleAnswerSelect(exerciseId, option)}
                    >
                      <Space>
                        <input
                          type="radio"
                          name="exercise"
                          value={option}
                          checked={isSelected}
                          onChange={(e) => handleAnswerSelect(exerciseId, e.target.value)}
                          className="mr-3"
                        />
                        <Text
                          className={
                            isSelected && status === "correct"
                              ? "text-green-700 dark:text-green-400 font-medium"
                              : isSelected && status === "incorrect"
                                ? "text-red-700 dark:text-red-400"
                                : ""
                          }
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
                className={`mb-4 ${
                  answerStatus[
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
                size="large"
              />
            )}

            {exercises[currentExerciseIndex].type === "reorder" && (
              <ReorderExercise
                exercise={exercises[currentExerciseIndex]}
                setAnswer={(answer) =>
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

          {showExplanation[
            exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
          ] && (
            <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <Title level={5} style={{ color: "#1890ff" }}>
                💡 Giải thích:
              </Title>
              <Text type="secondary">{exercises[currentExerciseIndex].explanation}</Text>
            </Card>
          )}

          {exerciseResults[
            exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
          ] && (
            <Card
              className={`mb-4 ${
                exerciseResults[
                  exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`
                ].isCorrect
                  ? "border-green-200 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                  : "border-red-200 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
              } bg-white dark:bg-secondary-925`}
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
                <Paragraph type="secondary">
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
              icon={<LeftOutlined />}
              onClick={() => setCurrentExerciseIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentExerciseIndex === 0}
            >
              Trước
            </Button>

            {exercises[currentExerciseIndex]?.type === "reorder" && (
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
              icon={<RightOutlined />}
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
