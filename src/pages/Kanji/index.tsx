import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { lessonAPI } from '../../services/api';
import { KanjiItem } from '../../types/kanji';
import KanjiList from '../../components/kanji/KanjiList';
import KanjiFilter from '../../components/kanji/KanjiFilter';
import { message } from 'antd';
import { KanjiPageIcon } from '../../components/icons';

const normalizeJlptLevel = (value?: string) => {
    if (!value) return '';
    const normalized = value.toUpperCase().trim();
    return ['N5', 'N4', 'N3', 'N2', 'N1'].includes(normalized) ? normalized : '';
};

const PAGE_SIZE = 80;
const ALLOWED_STROKE_FILTERS = ['low', 'mid', 'high', 'radical214'];

const parseListParam = (value: string | null) =>
    (value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const mapRadicalToKanjiItem = (radical: any): KanjiItem => ({
    _id: `radical-${radical.symbol}`,
    character: radical.symbol,
    hanviet: radical.hanviet || radical.name_vi || radical.symbol,
    meaning_vi: radical.meaning || radical.name_vi || 'Bộ thủ',
    onyomi: [],
    kunyomi: [],
    stroke_count: Number(radical.stroke_count || 1),
    jlpt_level: 'N5',
    frequency: 'n/a',
    radical: {
        symbol: radical.symbol,
        hanviet: radical.hanviet || radical.name_vi || '',
        name_vi: radical.name_vi || '',
        meaning: radical.meaning || '',
    },
    structure: 'radical',
    image_explanation: '',
    kanji_analysis: [],
    vocabulary_examples: [],
    category: 'radical',
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    __v: 0,
});

const mapKanjiListItemToKanjiItem = (item: any): KanjiItem => ({
    _id: item._id || item.character,
    character: item.character || '',
    hanviet: item.hanviet || '',
    meaning_vi: item.meaning_vi || '',
    onyomi: Array.isArray(item.onyomi) ? item.onyomi : [],
    kunyomi: Array.isArray(item.kunyomi) ? item.kunyomi : [],
    stroke_count: Number(item.stroke_count || 0),
    jlpt_level: normalizeJlptLevel(
        item.jlpt_level || item.level || item.jlpt || item.jlptLevel,
    ),
    frequency: item.frequency || 'n/a',
    radical: item.radical || {
        symbol: '',
        hanviet: '',
        name_vi: '',
        meaning: '',
    },
    structure: item.structure || '',
    image_explanation: item.image_explanation || '',
    kanji_analysis: Array.isArray(item.kanji_analysis) ? item.kanji_analysis : [],
    vocabulary_examples: Array.isArray(item.vocabulary_examples) ? item.vocabulary_examples : [],
    category: item.category || '',
    level: normalizeJlptLevel(item.level),
    color: item.color || undefined,
    memory_tip: item.memory_tip || '',
    createdAt: item.createdAt || new Date(0).toISOString(),
    updatedAt: item.updatedAt || new Date(0).toISOString(),
    __v: typeof item.__v === 'number' ? item.__v : 0,
});

const isRadicalItem = (item: KanjiItem) =>
    item.category === 'radical' ||
    item.structure === 'radical' ||
    String(item._id || '').startsWith('radical-') ||
    (
        (item.onyomi?.length || 0) === 0 &&
        (item.kunyomi?.length || 0) === 0 &&
        !item.jlpt_level
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
    const [strokeFilters, setStrokeFilters] = useState<string[]>(
        parseListParam(searchParams.get('stroke')).filter((value) =>
            ALLOWED_STROKE_FILTERS.includes(value),
        ),
    );
    const isRadicalMode = strokeFilters.includes('radical214');

    const fetchKanji = async (nextPage = 1, append = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            let response;
            if (isRadicalMode) {
                response = await lessonAPI.getRadicals(1, 214);
            } else {
                const requestLevel =
                    selectedLevels.length === 1 ? selectedLevels[0].toLowerCase() : undefined;
                response = await lessonAPI.getAllKanji({
                    level: requestLevel,
                    page: nextPage,
                    limit: PAGE_SIZE,
                });
            }

            const rawItems = Array.isArray(response?.data)
                ? response.data
                : (response?.data?.items || []);

            const mappedItems = isRadicalMode
                ? rawItems.map(mapRadicalToKanjiItem)
                : rawItems.map(mapKanjiListItemToKanjiItem).filter((kanji: KanjiItem) =>
                    !(kanji.jlpt_level === 'N5' && kanji.stroke_count === 2) &&
                    !isRadicalItem(kanji),
                );

            let nextList = mappedItems;
            if (append) {
                const merged = [...kanjiList, ...mappedItems];
                const map = new Map<string, KanjiItem>();
                merged.forEach((item) => {
                    const key = item._id || item.character;
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

            if (append && mappedItems.length > 0 && nextList.length === kanjiList.length) {
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
        const strokeRanges = strokeFilters.filter((value) => value !== 'radical214');

        const isStrokeMatch = (count: number) => {
            if (strokeRanges.length === 0) return true;

            return strokeRanges.some((range) => {
                switch (range) {
                    case 'low':
                        return count <= 5;
                    case 'mid':
                        return count >= 6 && count <= 10;
                    case 'high':
                        return count >= 11;
                    default:
                        return false;
                }
            });
        };

        const isLevelMatch = (level: string) => {
            if (selectedLevels.length === 0) return true;
            return selectedLevels.includes(level);
        };

        const filtered = kanjiList.filter((kanji) => {
            if (!isRadicalMode && isRadicalItem(kanji)) {
                return false;
            }
            if (!isRadicalMode && !isLevelMatch(kanji.jlpt_level)) {
                return false;
            }

            const searchMatch =
                keyword === '' ||
                kanji.character.includes(keyword) ||
                (kanji.hanviet || '').toLowerCase().includes(keyword) ||
                (kanji.meaning_vi || '').toLowerCase().includes(keyword) ||
                (kanji.onyomi && kanji.onyomi.some((o) => o.kana.includes(keyword))) ||
                (kanji.kunyomi && kanji.kunyomi.some((k) => k.kana.includes(keyword)));

            const strokeMatch = isRadicalMode ? true : isStrokeMatch(kanji.stroke_count);
            return searchMatch && strokeMatch;
        });

        setFilteredKanji(filtered);
    }, [searchTerm, strokeFilters, selectedLevels, isRadicalMode, kanjiList]);

    const handleLevelChange = (levels: string[]) => {
        setSelectedLevels(levels.map(normalizeJlptLevel).filter(Boolean));
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    const handleStrokeFilterChange = (values: string[]) => {
        if (values.includes('radical214')) {
            setStrokeFilters(['radical214']);
            return;
        }
        setStrokeFilters(values.filter((value) => ALLOWED_STROKE_FILTERS.includes(value)));
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
        <div className="min-h-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
            <div className="mb-4 sm:mb-5 rounded-2xl border border-[#d5dfef] bg-[#d6e4f8] bg-[linear-gradient(to_right,rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:24px_24px] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <span className="inline-flex items-center justify-center text-secondary-700 dark:text-secondary-400 shrink-0">
                                <KanjiPageIcon size={40} strokeWidth={3.8} />
                            </span>
                            <div className="min-w-0">
                                <h1 className="text-2xl sm:text-4xl font-semibold leading-tight text-[#2a2f3f] truncate">
                                    Học Hán tự
                                </h1>
                                <p className="mt-1 text-sm sm:text-lg text-[#2c3853]">
                                    Học theo lộ trình JLPT • Bộ thủ • Cách đọc
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-col items-end rounded-xl border border-white/60 bg-white/55 px-3 py-2 text-[#2c3853]">
                        <span className="text-xs uppercase tracking-wide">Đang hiển thị</span>
                        <span className="text-lg font-semibold">{filteredKanji.length} chữ</span>
                        <span className="text-xs">
                            Cấp độ: {selectedLevels.length === 0 ? 'Tất cả' : selectedLevels.join(', ')}
                        </span>
                    </div>
                </div>
            </div>

            <KanjiFilter
                selectedLevels={selectedLevels}
                searchTerm={searchTerm}
                strokeFilters={strokeFilters}
                onLevelChange={handleLevelChange}
                onSearch={handleSearch}
                onStrokeFilterChange={handleStrokeFilterChange}
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
    );
};

export default KanjiPage;
