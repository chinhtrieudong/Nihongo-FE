import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  BookOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  ReadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import api, { lessonAPI } from "../services/api";
import { grammarAPI, GrammarItem } from "../services/grammarApi";
import { Lesson } from "../types/lesson";
import { KanjiItem } from "../types/kanji";

const { Title, Text } = Typography;
const { TextArea } = Input;

const PAGE_SIZE = 20;
const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"];
const LESSON_STATUS = ["not_started", "in_progress", "completed"] as const;

type AdminTab = "lessons" | "grammar" | "kanji";

type AdminTotals = {
  lessons: number;
  grammar: number;
  kanji: number;
};

const statusColor = (status?: string) => {
  switch (status) {
    case "completed":
      return "green";
    case "in_progress":
      return "blue";
    default:
      return "default";
  }
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("lessons");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [grammarItems, setGrammarItems] = useState<GrammarItem[]>([]);
  const [kanjiItems, setKanjiItems] = useState<KanjiItem[]>([]);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [grammarModalOpen, setGrammarModalOpen] = useState(false);
  const [kanjiModalOpen, setKanjiModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingGrammar, setEditingGrammar] = useState<GrammarItem | null>(null);
  const [editingKanji, setEditingKanji] = useState<KanjiItem | null>(null);
  const [totals, setTotals] = useState<AdminTotals>({
    lessons: 0,
    grammar: 0,
    kanji: 0,
  });

  const [lessonForm] = Form.useForm();
  const [grammarForm] = Form.useForm();
  const [kanjiForm] = Form.useForm();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [lessonResult, grammarResult, kanjiResult] = await Promise.allSettled([
        lessonAPI.getLessons(undefined, PAGE_SIZE, 0),
        grammarAPI.getAllGrammar({ page: 1, limit: PAGE_SIZE }),
        lessonAPI.getAllKanji({ page: 1, limit: PAGE_SIZE }),
      ]);

      const localErrors: string[] = [];

      if (lessonResult.status === "fulfilled") {
        const rawLessonData = lessonResult.value?.data?.lessons || [];
        const lessonData: Lesson[] = rawLessonData.map((item: any) => {
          const status = LESSON_STATUS.includes(item.status)
            ? item.status
            : "not_started";

          return {
            id: String(
              item.id ||
                item._id ||
                item.lessonId ||
                item.lesson_id ||
                item.lessonNumber ||
                item.lesson_number,
            ),
            lessonNumber: Number(item.lessonNumber || item.lesson_number || 0),
            title: item.title || item.lesson_title || "",
            description: item.description || "",
            level: item.level || item.jlpt_level || "N5",
            status,
            progress: Number(item.progress || 0),
            image_url: item.image_url,
          };
        });

        setLessons(lessonData);
        setTotals((prev) => ({
          ...prev,
          lessons: lessonResult.value?.data?.pagination?.total ?? lessonData.length,
        }));
      } else {
        localErrors.push("Không tải được danh sách bài học");
      }

      if (grammarResult.status === "fulfilled") {
        const rawGrammarData = grammarResult.value?.data?.grammar || [];
        const grammarData: GrammarItem[] = rawGrammarData.map((item: any) => ({
          ...item,
          id: String(item.id || item._id),
        }));

        setGrammarItems(grammarData);
        setTotals((prev) => ({
          ...prev,
          grammar:
            grammarResult.value?.data?.pagination?.total ?? grammarData.length,
        }));
      } else {
        localErrors.push("Không tải được danh sách ngữ pháp");
      }

      if (kanjiResult.status === "fulfilled") {
        const payload: any = kanjiResult.value;
        const rawKanjiData = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.data?.items)
            ? payload.data.items
            : [];

        const kanjiData: KanjiItem[] = rawKanjiData.map((item: any) => ({
          ...item,
          _id: String(item._id || item.id || item.character),
          stroke_count: Number(item.stroke_count || 0),
          jlpt_level: item.jlpt_level || item.level || "N5",
        }));

        setKanjiItems(kanjiData);
        setTotals((prev) => ({
          ...prev,
          kanji:
            payload?.pagination?.total ??
            payload?.data?.pagination?.total ??
            kanjiData.length,
        }));
      } else {
        localErrors.push("Không tải được danh sách hán tự");
      }

      if (localErrors.length > 0) {
        setError(localErrors.join(". "));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetLessonModal = () => {
    setEditingLesson(null);
    lessonForm.resetFields();
    setLessonModalOpen(false);
  };

  const resetGrammarModal = () => {
    setEditingGrammar(null);
    grammarForm.resetFields();
    setGrammarModalOpen(false);
  };

  const resetKanjiModal = () => {
    setEditingKanji(null);
    kanjiForm.resetFields();
    setKanjiModalOpen(false);
  };

  const openCreateLesson = () => {
    setEditingLesson(null);
    lessonForm.setFieldsValue({
      level: "N5",
      status: "not_started",
    });
    setLessonModalOpen(true);
  };

  const openEditLesson = (record: Lesson) => {
    setEditingLesson(record);
    lessonForm.setFieldsValue({
      lessonNumber: record.lessonNumber,
      title: record.title,
      description: record.description,
      level: record.level || "N5",
      status: record.status || "not_started",
    });
    setLessonModalOpen(true);
  };

  const submitLesson = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        lessonNumber: Number(values.lessonNumber),
        lesson_number: Number(values.lessonNumber),
        title: values.title,
        description: values.description,
        level: values.level,
        status: values.status,
      };

      if (editingLesson?.id) {
        await api.put(`/lessons/${encodeURIComponent(editingLesson.id)}`, payload);
        message.success("Cập nhật bài học thành công");
      } else {
        await api.post("/lessons", payload);
        message.success("Tạo bài học mới thành công");
      }

      resetLessonModal();
      await loadData();
    } catch (err: any) {
      message.error(getErrorMessage(err, "Không thể lưu bài học"));
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (record: Lesson) => {
    if (!record.id) {
      message.error("Không xác định được ID bài học");
      return;
    }

    setSaving(true);
    try {
      await api.delete(`/lessons/${encodeURIComponent(record.id)}`);
      message.success("Đã xóa bài học");
      await loadData();
    } catch (err: any) {
      message.error(getErrorMessage(err, "Không thể xóa bài học"));
    } finally {
      setSaving(false);
    }
  };

  const openCreateGrammar = () => {
    setEditingGrammar(null);
    grammarForm.setFieldsValue({
      level: "N5",
      importance: "medium",
      status: "active",
    });
    setGrammarModalOpen(true);
  };

  const openEditGrammar = (record: GrammarItem) => {
    setEditingGrammar(record);
    grammarForm.setFieldsValue({
      pattern: record.pattern,
      meaning_vi: record.meaning_vi,
      usage_vi: record.usage_vi,
      structure: record.structure,
      level: record.level || "N5",
      importance: record.importance || "medium",
      status: record.status || "active",
      comparisons: Array.isArray(record.comparisons)
        ? record.comparisons.join(", ")
        : "",
      examplesRaw: Array.isArray(record.examples)
        ? record.examples
            .map((example) => `${example.japanese} | ${example.vietnamese || ""}`)
            .join("\n")
        : "",
    });
    setGrammarModalOpen(true);
  };

  const submitGrammar = async (values: any) => {
    setSaving(true);
    try {
      const comparisons = String(values.comparisons || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const examples = String(values.examplesRaw || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [japanese, vietnamese] = line.split("|");
          return {
            japanese: (japanese || "").trim(),
            vietnamese: (vietnamese || "").trim(),
          };
        });

      const payload = {
        pattern: values.pattern,
        meaning_vi: values.meaning_vi,
        usage_vi: values.usage_vi,
        structure: values.structure,
        level: values.level,
        importance: values.importance,
        status: values.status,
        comparisons,
        examples,
      };

      if (editingGrammar?.id) {
        await api.put(`/grammar/${encodeURIComponent(editingGrammar.id)}`, payload);
        message.success("Cập nhật ngữ pháp thành công");
      } else {
        await api.post("/grammar", payload);
        message.success("Tạo ngữ pháp mới thành công");
      }

      resetGrammarModal();
      await loadData();
    } catch (err: any) {
      message.error(getErrorMessage(err, "Không thể lưu ngữ pháp"));
    } finally {
      setSaving(false);
    }
  };

  const deleteGrammar = async (record: GrammarItem) => {
    if (!record.id) {
      message.error("Không xác định được ID ngữ pháp");
      return;
    }

    setSaving(true);
    try {
      await api.delete(`/grammar/${encodeURIComponent(record.id)}`);
      message.success("Đã xóa ngữ pháp");
      await loadData();
    } catch (err: any) {
      message.error(getErrorMessage(err, "Không thể xóa ngữ pháp"));
    } finally {
      setSaving(false);
    }
  };

  const openCreateKanji = () => {
    setEditingKanji(null);
    kanjiForm.setFieldsValue({
      jlpt_level: "N5",
      stroke_count: 1,
    });
    setKanjiModalOpen(true);
  };

  const openEditKanji = (record: KanjiItem) => {
    setEditingKanji(record);
    kanjiForm.setFieldsValue({
      character: record.character,
      hanviet: record.hanviet,
      meaning_vi: record.meaning_vi,
      stroke_count: record.stroke_count,
      jlpt_level: record.jlpt_level || "N5",
      radical_symbol: record.radical?.symbol || "",
      radical_hanviet: record.radical?.hanviet || "",
      radical_meaning: record.radical?.meaning || "",
    });
    setKanjiModalOpen(true);
  };

  const submitKanji = async (values: any) => {
    setSaving(true);
    try {
      const payload: any = {
        character: values.character,
        hanviet: values.hanviet,
        meaning_vi: values.meaning_vi,
        stroke_count: Number(values.stroke_count),
        jlpt_level: values.jlpt_level,
      };

      if (values.radical_symbol) {
        payload.radical = {
          symbol: values.radical_symbol,
          hanviet: values.radical_hanviet || "",
          name_vi: values.radical_meaning || "",
          meaning: values.radical_meaning || "",
        };
      }

      const kanjiId = editingKanji?._id || editingKanji?.character;
      if (kanjiId) {
        await api.put(`/kanji/${encodeURIComponent(kanjiId)}`, payload);
        message.success("Cập nhật hán tự thành công");
      } else {
        await api.post("/kanji", payload);
        message.success("Tạo hán tự mới thành công");
      }

      resetKanjiModal();
      await loadData();
    } catch (err: any) {
      message.error(getErrorMessage(err, "Không thể lưu hán tự"));
    } finally {
      setSaving(false);
    }
  };

  const deleteKanji = async (record: KanjiItem) => {
    const kanjiId = record._id || record.character;
    if (!kanjiId) {
      message.error("Không xác định được ID hán tự");
      return;
    }

    setSaving(true);
    try {
      await api.delete(`/kanji/${encodeURIComponent(kanjiId)}`);
      message.success("Đã xóa hán tự");
      await loadData();
    } catch (err: any) {
      message.error(getErrorMessage(err, "Không thể xóa hán tự"));
    } finally {
      setSaving(false);
    }
  };

  const lessonColumns: ColumnsType<Lesson> = useMemo(
    () => [
      {
        title: "Bài",
        dataIndex: "lessonNumber",
        key: "lessonNumber",
        width: 90,
      },
      {
        title: "Tiêu đề",
        dataIndex: "title",
        key: "title",
      },
      {
        title: "Cấp độ",
        dataIndex: "level",
        key: "level",
        width: 110,
        render: (value?: string) => <Tag color="blue">{value || "N/A"}</Tag>,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: (value: string) => (
          <Tag color={statusColor(value)}>{value || "not_started"}</Tag>
        ),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 160,
        render: (_, record) => (
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditLesson(record)}
            />
            <Popconfirm
              title="Xóa bài học này?"
              onConfirm={() => deleteLesson(record)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [],
  );

  const grammarColumns: ColumnsType<GrammarItem> = useMemo(
    () => [
      {
        title: "Mẫu",
        dataIndex: "pattern",
        key: "pattern",
        width: 180,
      },
      {
        title: "Nghĩa",
        dataIndex: "meaning_vi",
        key: "meaning_vi",
      },
      {
        title: "Cấp độ",
        dataIndex: "level",
        key: "level",
        width: 110,
        render: (value: string) => <Tag color="geekblue">{value || "N/A"}</Tag>,
      },
      {
        title: "Độ quan trọng",
        dataIndex: "importance",
        key: "importance",
        width: 140,
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 160,
        render: (_, record) => (
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditGrammar(record)}
            />
            <Popconfirm
              title="Xóa ngữ pháp này?"
              onConfirm={() => deleteGrammar(record)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [],
  );

  const kanjiColumns: ColumnsType<KanjiItem> = useMemo(
    () => [
      {
        title: "Kanji",
        dataIndex: "character",
        key: "character",
        width: 90,
        render: (value: string) => (
          <span className="text-xl font-semibold">{value}</span>
        ),
      },
      {
        title: "Hán Việt",
        dataIndex: "hanviet",
        key: "hanviet",
        width: 180,
      },
      {
        title: "Nghĩa",
        dataIndex: "meaning_vi",
        key: "meaning_vi",
      },
      {
        title: "Số nét",
        dataIndex: "stroke_count",
        key: "stroke_count",
        width: 90,
      },
      {
        title: "JLPT",
        dataIndex: "jlpt_level",
        key: "jlpt_level",
        width: 100,
        render: (value: string) => <Tag color="purple">{value || "N/A"}</Tag>,
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 160,
        render: (_, record) => (
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditKanji(record)}
            />
            <Popconfirm
              title="Xóa hán tự này?"
              onConfirm={() => deleteKanji(record)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [],
  );

  const tabItems = [
    {
      key: "lessons",
      label: (
        <span>
          <BookOutlined /> Bài học
        </span>
      ),
      children: (
        <Table
          rowKey={(record) => String(record.id || record.lessonNumber)}
          loading={loading}
          columns={lessonColumns}
          dataSource={lessons}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
        />
      ),
    },
    {
      key: "grammar",
      label: (
        <span>
          <ExperimentOutlined /> Ngữ pháp
        </span>
      ),
      children: (
        <Table
          rowKey={(record) => record.id}
          loading={loading}
          columns={grammarColumns}
          dataSource={grammarItems}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
        />
      ),
    },
    {
      key: "kanji",
      label: (
        <span>
          <ReadOutlined /> Hán tự
        </span>
      ),
      children: (
        <Table
          rowKey={(record) => record._id || record.character}
          loading={loading}
          columns={kanjiColumns}
          dataSource={kanjiItems}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
        />
      ),
    },
  ];

  const createActionButton = () => {
    if (activeTab === "lessons") {
      return (
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateLesson}>
          Thêm bài học
        </Button>
      );
    }

    if (activeTab === "grammar") {
      return (
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateGrammar}>
          Thêm ngữ pháp
        </Button>
      );
    }

    return (
      <Button type="primary" icon={<PlusOutlined />} onClick={openCreateKanji}>
        Thêm hán tự
      </Button>
    );
  };

  return (
    <div className="min-h-full p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-5 rounded-2xl border border-[#d5dfef] bg-[#d6e4f8] bg-[linear-gradient(to_right,rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:24px_24px] px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <Title level={2} className="!mb-1 !text-[#2a2f3f]">
              <DatabaseOutlined /> Quản trị dữ liệu
            </Title>
            <Text className="text-[#2c3853]">
              Admin có thể tạo, sửa, xóa dữ liệu bài học, ngữ pháp, hán tự.
            </Text>
          </div>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            Tải lại dữ liệu
          </Button>
        </div>
      </div>

      {error ? (
        <Alert
          type="warning"
          showIcon
          message="Một phần dữ liệu tải thất bại"
          description={error}
          className="mb-4"
        />
      ) : null}

      <Row gutter={[12, 12]} className="mb-4">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Tổng bài học" value={totals.lessons} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Tổng ngữ pháp" value={totals.grammar} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Tổng hán tự" value={totals.kanji} />
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Space wrap>
          <Button icon={<BookOutlined />} onClick={() => navigate("/lessons")}>
            Đi tới Bài học
          </Button>
          <Button icon={<ExperimentOutlined />} onClick={() => navigate("/grammar")}>
            Đi tới Ngữ pháp
          </Button>
          <Button icon={<ReadOutlined />} onClick={() => navigate("/kanji")}>
            Đi tới Hán tự
          </Button>
        </Space>
      </Card>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(value) => setActiveTab(value as AdminTab)}
          items={tabItems}
          tabBarExtraContent={createActionButton()}
        />
      </Card>

      <Modal
        title={editingLesson ? "Sửa bài học" : "Tạo bài học mới"}
        open={lessonModalOpen}
        onCancel={resetLessonModal}
        onOk={() => lessonForm.submit()}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={lessonForm} layout="vertical" onFinish={submitLesson}>
          <Form.Item
            name="lessonNumber"
            label="Số bài"
            rules={[{ required: true, message: "Vui lòng nhập số bài" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="level"
            label="Cấp độ"
            rules={[{ required: true, message: "Vui lòng chọn cấp độ" }]}
          >
            <Select options={JLPT_LEVELS.map((level) => ({ label: level, value: level }))} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select
              options={LESSON_STATUS.map((status) => ({
                label: status,
                value: status,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingGrammar ? "Sửa ngữ pháp" : "Tạo ngữ pháp mới"}
        open={grammarModalOpen}
        onCancel={resetGrammarModal}
        onOk={() => grammarForm.submit()}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={grammarForm} layout="vertical" onFinish={submitGrammar}>
          <Form.Item
            name="pattern"
            label="Mẫu ngữ pháp"
            rules={[{ required: true, message: "Vui lòng nhập mẫu ngữ pháp" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="meaning_vi"
            label="Nghĩa tiếng Việt"
            rules={[{ required: true, message: "Vui lòng nhập nghĩa" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="usage_vi" label="Cách dùng">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item name="structure" label="Cấu trúc">
            <Input />
          </Form.Item>
          <Form.Item
            name="level"
            label="Cấp độ"
            rules={[{ required: true, message: "Vui lòng chọn cấp độ" }]}
          >
            <Select options={JLPT_LEVELS.map((level) => ({ label: level, value: level }))} />
          </Form.Item>
          <Form.Item name="importance" label="Độ quan trọng">
            <Select
              options={[
                { label: "low", value: "low" },
                { label: "medium", value: "medium" },
                { label: "high", value: "high" },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select
              options={[
                { label: "active", value: "active" },
                { label: "inactive", value: "inactive" },
              ]}
            />
          </Form.Item>
          <Form.Item name="comparisons" label="So sánh (dùng dấu phẩy)">
            <Input placeholder="~です, ~である" />
          </Form.Item>
          <Form.Item name="examplesRaw" label="Ví dụ (mỗi dòng: nhật | việt)">
            <TextArea rows={4} placeholder="日本語です。 | Đây là tiếng Nhật." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingKanji ? "Sửa hán tự" : "Tạo hán tự mới"}
        open={kanjiModalOpen}
        onCancel={resetKanjiModal}
        onOk={() => kanjiForm.submit()}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={kanjiForm} layout="vertical" onFinish={submitKanji}>
          <Form.Item
            name="character"
            label="Ký tự"
            rules={[{ required: true, message: "Vui lòng nhập ký tự hán tự" }]}
          >
            <Input maxLength={2} />
          </Form.Item>
          <Form.Item
            name="hanviet"
            label="Hán Việt"
            rules={[{ required: true, message: "Vui lòng nhập hán việt" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="meaning_vi"
            label="Nghĩa tiếng Việt"
            rules={[{ required: true, message: "Vui lòng nhập nghĩa" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="stroke_count"
            label="Số nét"
            rules={[{ required: true, message: "Vui lòng nhập số nét" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="jlpt_level"
            label="Cấp độ JLPT"
            rules={[{ required: true, message: "Vui lòng chọn cấp độ" }]}
          >
            <Select options={JLPT_LEVELS.map((level) => ({ label: level, value: level }))} />
          </Form.Item>
          <Form.Item name="radical_symbol" label="Bộ thủ (ký hiệu)">
            <Input />
          </Form.Item>
          <Form.Item name="radical_hanviet" label="Bộ thủ (hán việt)">
            <Input />
          </Form.Item>
          <Form.Item name="radical_meaning" label="Bộ thủ (nghĩa)">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
