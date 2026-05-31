import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { lessonAPI, kanjiAPI } from '@services/api';
import { KanjiItem } from '@kanji-types';
import KanjiList from '@components/kanji/KanjiList';
import { message, Tag } from 'antd';
import type { SelectProps } from 'antd';
import { KanjiPageIcon } from '@components/icons';
import { SearchFilter } from '@components/common';
import { kanjiData as localKanjiData, getKanjiByLevel } from '../../data/kanjiData';

const normalizeJlptLevel = (value?: string) => {
    if (!value) return '';
    const normalized = value.toUpperCase().trim();
    return ['N5', 'N4', 'N3', 'N2', 'N1'].includes(normalized) ? normalized : '';
};

const PAGE_SIZE = 80;
const ALLOWED_STROKE_FILTERS = ['hantu', 'radical214'];

const parseListParam = (value: string | null) =>
    (value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const mapRadicalToKanjiItem = (radical: any): KanjiItem => ({
    kanji: radical.symbol,
    hanviet: radical.hanviet || radical.name_vi || radical.symbol,
    level: normalizeJlptLevel(radical.jlpt) || '',
    color: '',
    onyomi: [],
    kunyomi: [],
    meaningVi:
        radical.meaningVi ||
        radical.meaning_vi ||
        radical.meaning ||
        radical.name_vi ||
        'Bộ thủ',
    strokeCount: Number(radical.stroke_count || 1),
    radicals: Array.isArray(radical.variants) ? radical.variants : [],
    memoryTip: '',
    relatedVocabulary: [],
});

const mapKanjiListItemToKanjiItem = (item: any): KanjiItem => ({
    id: item.id || item._id,
    kanji: item.kanji || item.character || '',
    hanviet: item.hanviet || '',
    level: normalizeJlptLevel(item.level || item.jlpt || item.jlpt_level || ''),
    color: item.color || '',
    onyomi: Array.isArray(item.onyomi) ? item.onyomi : [],
    kunyomi: Array.isArray(item.kunyomi) ? item.kunyomi : [],
    nanori: Array.isArray(item.nanori) ? item.nanori : [],
    meaning: item.meaning || '',
    meaningVi: item.meaningVi || item.meaning_vi || '',
    strokeCount: Number(item.strokeCount || item.stroke_count || 0),
    radicals: Array.isArray(item.radicals) ? item.radicals : [],
    memoryTip: item.memoryTip || item.memory_tip || '',
    relatedVocabulary: Array.isArray(item.relatedVocabulary) 
        ? item.relatedVocabulary 
        : Array.isArray(item.related_vocabulary) 
            ? item.related_vocabulary 
            : [],
});

const isRadicalItem = (item: KanjiItem) =>
    String(item.kanji || '').startsWith('radical-') ||
    (
        (item.onyomi?.length || 0) === 0 &&
        (item.kunyomi?.length || 0) === 0 &&
        !item.level
    );

const KanjiPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [kanjiList, setKanjiList] = useState<KanjiItem[]>([]);
    const [filteredKanji, setFilteredKanji] = useState<KanjiItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedLevels, setSelectedLevels] = useState<string[]>(
        parseListParam(searchParams.get('level'))
            .map(normalizeJlptLevel)
            .filter(Boolean),
    );
    const [searchTerm, setSearchTerm] = useState(
        searchParams.get('q') || '',
    );
    const [strokeFilters, setStrokeFilters] = useState<string[]>(() => {
        const urlFilters = parseListParam(searchParams.get('stroke')).filter((value) =>
            ALLOWED_STROKE_FILTERS.includes(value),
        );
        // Mặc định chọn 'hantu' nếu không có filter nào từ URL
        return urlFilters.length > 0 ? urlFilters : ['hantu'];
    });
    const isRadicalMode = strokeFilters.includes('radical214');

    const fetchKanji = async (nextPage = 1, append = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            let rawItems: any[] = [];
            let response;

            if (isRadicalMode) {
                response = await kanjiAPI.getRadicals(1, 214);
                rawItems = Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response?.data?.data)
                        ? response.data.data
                        : (response?.data?.items || []);
            } else {
                const requestLevel =
                    selectedLevels.length === 1 ? selectedLevels[0].toLowerCase() : undefined;
                
                try {
                    response = await kanjiAPI.getAllKanji({
                        level: requestLevel,
                        page: nextPage,
                        limit: PAGE_SIZE,
                    });

                    rawItems = Array.isArray(response?.data)
                        ? response.data
                        : Array.isArray(response?.data?.data)
                            ? response.data.data
                            : (response?.data?.items || []);
                } catch (apiError) {
                    console.log('API error, using local kanji data as fallback:', apiError);
                    // Use local data as fallback
                    if (requestLevel) {
                        rawItems = getKanjiByLevel(requestLevel.toUpperCase());
                    } else {
                        rawItems = localKanjiData;
                    }
                }

                // If API returned empty data, use local fallback
                if (rawItems.length === 0) {
                    console.log('API returned empty data, using local kanji data');
                    if (requestLevel) {
                        rawItems = getKanjiByLevel(requestLevel.toUpperCase());
                    } else {
                        rawItems = localKanjiData;
                    }
                }
            }

            const mappedItems = isRadicalMode
                ? rawItems.map(mapRadicalToKanjiItem)
                : rawItems.map(mapKanjiListItemToKanjiItem).filter((kanji: KanjiItem) =>
                    !(kanji.jlpt === 'N5' && kanji.stroke_count === 2) &&
                    !isRadicalItem(kanji),
                );

            let nextList = mappedItems;
            if (append) {
                const merged = [...kanjiList, ...mappedItems];
                const map = new Map<string, KanjiItem>();
                merged.forEach((item) => {
                    const key = item.id || item.kanji;
                    if (key) map.set(key, item);
                });
                nextList = Array.from(map.values());
            }

            setKanjiList(nextList);
            setFilteredKanji(nextList);
            setPage(nextPage);

            if (isRadicalMode) {
                setHasMore(false);
                return;
            }

            const pagination =
                response?.pagination ||
                response?.data?.pagination ||
                response?.meta?.pagination ||
                response?.meta;

            let nextHasMore = rawItems.length >= PAGE_SIZE;
            if (typeof pagination?.hasNextPage === 'boolean') {
                nextHasMore = pagination.hasNextPage;
            } else if (
                typeof pagination?.page === 'number' &&
                typeof pagination?.totalPages === 'number'
            ) {
                nextHasMore = pagination.page < pagination.totalPages;
            }

            // For append mode, if we got fewer items than requested, no more items available
            if (append && rawItems.length < PAGE_SIZE) {
                nextHasMore = false;
            }

            setHasMore(nextHasMore);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu Hán tự:', error);
            message.error('Có lỗi xảy ra khi tải dữ liệu Hán tự');
            setKanjiList([]);
            setFilteredKanji([]);
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchKanji(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLevels, isRadicalMode]);

    // Filter kanji based on search term and multiple filters
    useEffect(() => {
        const keyword = searchTerm.trim().toLowerCase();
        const strokeRanges = strokeFilters.filter((value) => value !== 'radical214' && value !== 'hantu');

        const isStrokeMatch = (count: number) => {
            // Nếu không có filter nào được chọn, hiển thị tất cả
            if (strokeFilters.length === 0) return true;

            // Nếu có filter hantu, hiển thị tất cả kanji (không lọc theo số nét)
            if (strokeFilters.includes('hantu')) {
                return true;
            }

            // Nếu có filter radical214, sẽ xử lý riêng ở isRadicalMode
            return true;
        };

        const isLevelMatch = (level: string | undefined) => {
            if (selectedLevels.length === 0) return true;
            if (!level) return false;
            return selectedLevels.includes(level);
        };

        const filtered = kanjiList.filter((kanji) => {
            if (!isRadicalMode && isRadicalItem(kanji)) {
                return false;
            }
            if (!isRadicalMode && !isLevelMatch(kanji.jlpt)) {
                return false;
            }

            const searchMatch =
                keyword === '' ||
                (kanji.kanji || '').includes(keyword) ||
                (kanji.hanviet || '').toLowerCase().includes(keyword) ||
                (kanji.meaningVi || '').toLowerCase().includes(keyword) ||
                (kanji.onyomi && kanji.onyomi.some((o) => o.includes(keyword))) ||
                (kanji.kunyomi && kanji.kunyomi.some((k) => k.includes(keyword)));

            const strokeMatch = isRadicalMode ? true : isStrokeMatch(kanji.stroke_count || 0);
            return searchMatch && strokeMatch;
        });

        if (!isRadicalMode && selectedLevels.length === 0) {
            const levelOrder = ['N5', 'N4', 'N3', 'N2', 'N1'];
            const sorted = filtered
                .map((item, index) => ({ item, index }))
                .sort((a, b) => {
                    const rankA = levelOrder.indexOf(a.item.jlpt ?? '');
                    const rankB = levelOrder.indexOf(b.item.jlpt ?? '');
                    const safeRankA = rankA === -1 ? levelOrder.length : rankA;
                    const safeRankB = rankB === -1 ? levelOrder.length : rankB;
                    if (safeRankA !== safeRankB) return safeRankA - safeRankB;
                    return a.index - b.index;
                })
                .map(({ item }) => item);
            setFilteredKanji(sorted);
        } else {
            setFilteredKanji(filtered);
        }
    }, [searchTerm, strokeFilters, selectedLevels, isRadicalMode, kanjiList]);

    const handleLevelChange = (levels: string[]) => {
        setSelectedLevels(levels.filter(Boolean).map(normalizeJlptLevel).filter(Boolean));
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    const handleStrokeFilterChange = (value: string | undefined) => {
        if (!value) {
            setStrokeFilters([]);
            return;
        }
        if (value === 'radical214') {
            setStrokeFilters(['radical214']);
            return;
        }
        setStrokeFilters(ALLOWED_STROKE_FILTERS.includes(value) ? [value] : []);
    };

    const getLevelColor = (level: string) => {
        const colors: { [key: string]: string } = {
            N5: 'green',
            N4: 'blue',
            N3: 'orange',
            N2: 'red',
            N1: 'purple'
        };
        return colors[level] || 'default';
    };

    const renderLevelTag: SelectProps<string[]>['tagRender'] = (props) => {
        const { label, value, closable, onClose } = props;
        return (
            <Tag
                color={getLevelColor(String(value))}
                closable={closable}
                onClose={onClose}
                className="m-0.5 !px-1 !py-0 text-xs"
            >
                {label}
            </Tag>
        );
    };

    const handleLoadMore = () => {
        if (!hasMore || loadingMore || isRadicalMode) return;
        fetchKanji(page + 1, true);
    };

    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedLevels.length > 0) params.set('level', selectedLevels.join(','));
        if (strokeFilters.length > 0) params.set('stroke', strokeFilters.join(','));
        if (searchTerm.trim()) params.set('q', searchTerm.trim());
        setSearchParams(params, { replace: true });
    }, [selectedLevels, strokeFilters, searchTerm, setSearchParams]);

    return (
        <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Header Section */}
                <div className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-3">
                        Hán tự tiếng Nhật
                    </h1>
                    <p className="text-text-sub text-lg">
                        Hệ thống Hán tự theo trình độ JLPT • 214 bộ thủ • Cách đọc và ý nghĩa
                    </p>
                </div>

                <SearchFilter
                    searchValue={searchTerm}
                    searchPlaceholder="Tìm kiếm Hán tự, âm Hán Việt hoặc nghĩa..."
                    onSearchChange={handleSearch}
                    className="mb-6"
                    filters={[
                        {
                            key: 'level',
                            value: selectedLevels,
                            placeholder: 'Chọn cấp độ',
                            mode: 'multiple',
                            tagRender: renderLevelTag,
                            onChange: handleLevelChange,
                            options: [
                                { value: 'all', label: <span className="font-medium text-gray-700 dark:text-gray-300">Tất cả</span> },
                                { value: 'N5', label: <Tag color={getLevelColor('N5')} className="m-0">N5</Tag> },
                                { value: 'N4', label: <Tag color={getLevelColor('N4')} className="m-0">N4</Tag> },
                                { value: 'N3', label: <Tag color={getLevelColor('N3')} className="m-0">N3</Tag> },
                                { value: 'N2', label: <Tag color={getLevelColor('N2')} className="m-0">N2</Tag> },
                                { value: 'N1', label: <Tag color={getLevelColor('N1')} className="m-0">N1</Tag> },
                            ],
                        },
                        {
                            key: 'stroke',
                            value: strokeFilters[0],
                            placeholder: 'Lọc theo',
                            onChange: handleStrokeFilterChange,
                            options: [
                                { value: 'hantu', label: 'Hán tự' },
                                { value: 'radical214', label: '214 bộ thủ' },
                            ],
                        },
                    ]}
                />

                <KanjiList
                    kanjiList={filteredKanji}
                    loading={loading}
                    selectedLevels={selectedLevels}
                    isRadicalMode={isRadicalMode}
                    hasMore={hasMore}
                    loadingMore={loadingMore}
                    onLoadMore={handleLoadMore}
                />
            </div>
        </div>
    );
};

export default KanjiPage;