import React, { useState, useEffect } from 'react';
import { lessonAPI } from '../../services/api';
import { KanjiItem } from '../../types/kanji';
import KanjiList from '../../components/kanji/KanjiList';
import KanjiFilter from '../../components/kanji/KanjiFilter';
import KanjiModal from '../../components/kanji/KanjiModal';
import { message, Typography } from 'antd';
import { ReadOutlined } from '@ant-design/icons';

const { Title } = Typography;

const KanjiPage: React.FC = () => {
    const [kanjiList, setKanjiList] = useState<KanjiItem[]>([]);
    const [filteredKanji, setFilteredKanji] = useState<KanjiItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState<string>('N5');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedKanji, setSelectedKanji] = useState<KanjiItem | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Fetch kanji list based on selected level
    useEffect(() => {
        const fetchKanji = async () => {
            try {
                setLoading(true);
                const response = await lessonAPI.getAllKanji({
                    level: selectedLevel === 'all' ? undefined : selectedLevel.toLowerCase()
                });

                if (response.success && response.data) {
                    setKanjiList(response.data);
                    setFilteredKanji(response.data);
                } else {
                    setKanjiList([]);
                    setFilteredKanji([]);
                    message.warning('Không tìm thấy Hán tự nào cho cấp độ này');
                }
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu Hán tự:', error);
                message.error('Có lỗi xảy ra khi tải dữ liệu Hán tự');
                setKanjiList([]);
                setFilteredKanji([]);
            } finally {
                setLoading(false);
            }
        };

        fetchKanji();
    }, [selectedLevel]);

    // Filter kanji based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredKanji(kanjiList);
        } else {
            const filtered = kanjiList.filter(kanji =>
                kanji.character.includes(searchTerm) ||
                kanji.hanviet.toLowerCase().includes(searchTerm.toLowerCase()) ||
                kanji.meaning_vi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (kanji.onyomi && kanji.onyomi.some(o => o.kana.includes(searchTerm))) ||
                (kanji.kunyomi && kanji.kunyomi.some(k => k.kana.includes(searchTerm)))
            );
            setFilteredKanji(filtered);
        }
    }, [searchTerm, kanjiList]);

    const handleKanjiClick = async (kanji: KanjiItem) => {
        try {
            // Fetch detailed kanji data from API
            const response = await lessonAPI.getKanji(kanji.character);
            if (response.success && response.data) {
                setSelectedKanji(response.data);
                setIsModalVisible(true);
            } else {
                // Fallback to basic kanji data if API call fails
                setSelectedKanji(kanji);
                setIsModalVisible(true);
            }
        } catch (error) {
            console.error('Lỗi khi tải chi tiết Hán tự:', error);
            // Fallback to basic kanji data if API call fails
            setSelectedKanji(kanji);
            setIsModalVisible(true);
        }
    };

    const handleLevelChange = (level: string) => {
        setSelectedLevel(level);
        setSearchTerm('');
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setSelectedKanji(null);
    };

    return (
        <div className="p-6 bg-secondary-50 dark:bg-secondary-950 min-h-full">
            <div className="mb-8">
                <Title level={2} className="!mb-2 text-secondary-900 dark:text-secondary-100">
                    <ReadOutlined className="mr-2 text-secondary-700 dark:text-secondary-400" />
                    Học Hán Tự
                </Title>
                <p className="text-gray-600 dark:text-secondary-400">
                    Tìm hiểu và ghi nhớ các chữ Hán thông dụng trong tiếng Nhật
                </p>
            </div>

            <KanjiFilter
                selectedLevel={selectedLevel}
                searchTerm={searchTerm}
                onLevelChange={handleLevelChange}
                onSearch={handleSearch}
            />

            <KanjiList
                kanjiList={filteredKanji}
                loading={loading}
                onKanjiClick={handleKanjiClick}
            />

            {selectedKanji && (
                <KanjiModal
                    kanji={selectedKanji}
                    visible={isModalVisible}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default KanjiPage;
