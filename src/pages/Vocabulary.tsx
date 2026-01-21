import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { lessonAPI } from "../services/api";
import type { VocabularyItem } from "../types/lesson";

// Updated interface to match backend kanji structure
interface KanjiItem {
  _id: string;
  character: string;
  hanviet: string;
  meaning_vi: string;
  onyomi: Array<{
    kana: string;
    romaji: string;
  }>;
  kunyomi: Array<{
    kana: string;
    romaji: string;
  }>;
  stroke_count: number;
  jlpt_level: string;
  frequency: string;
  radical: {
    symbol: string;
    hanviet: string;
    name_vi: string;
    meaning: string;
  };
  structure: string;
  image_explanation: string;
  category: string;
}

const Kanji: React.FC = () => {
  const navigate = useNavigate();
  const [kanjiList, setKanjiList] = useState<KanjiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>("N5");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchKanji = async () => {
      try {
        setLoading(true);

        // Use kanji API instead of lessons API
        const response = await lessonAPI.getAllKanji({
          level: selectedLevel === "all" ? undefined : selectedLevel.toLowerCase()
        });

        if (response.success && response.data) {
          setKanjiList(response.data);
        } else {
          setKanjiList([]);
        }
      } catch (error) {
        console.error("Failed to load kanji:", error);
        setKanjiList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKanji();
  }, [selectedLevel]);

  const filteredKanji = kanjiList.filter(kanji =>
    kanji.character.includes(searchTerm) ||
    kanji.hanviet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kanji.meaning_vi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hán tự</h1>
          <p className="text-gray-600">Học Hán tự theo giáo trình Minna no Nihongo</p>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="N5">N5</option>
            <option value="N4">N4</option>
            <option value="N3">N3</option>
            <option value="N2">N2</option>
            <option value="N1">N1</option>
          </select>
          <button
            onClick={() => navigate('/lessons')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📚 Bài học
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Tìm kiếm Hán tự, Hán Việt hoặc nghĩa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredKanji.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">漢</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Không có Hán tự</h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Không tìm thấy Hán tự nào phù hợp."
              : selectedLevel === "all"
                ? "Không có Hán tự nào trong hệ thống."
                : `Không có Hán tự nào cho cấp độ ${selectedLevel}.`
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Danh sách Hán tự ({filteredKanji.length} ký tự)
            </h3>
            <p className="text-sm text-gray-600">
              {selectedLevel === "all"
                ? "Tất cả các cấp độ"
                : `Cấp độ ${selectedLevel}`
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredKanji.map((kanji, index) => (
              <div key={`${kanji.character}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800 mb-2">
                    {kanji.character}
                  </div>
                  <div className="text-lg text-purple-600 font-medium mb-2">
                    {kanji.hanviet}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {kanji.meaning_vi}
                  </div>

                  <div className="text-xs text-gray-500 mb-2">
                    <div className="font-medium mb-1">Bộ thủ:</div>
                    <div className="flex justify-center">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {kanji.radical.symbol} ({kanji.radical.hanviet})
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-blue-600">
                    Cách đọc: {kanji.onyomi.map(o => o.kana).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Kanji;
