import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import QuranTextReader from './QuranTextReader';
import {
  NO_TAFSIR_ID,
  fetchArabicTafsirEditions,
  fetchSurahCatalog,
  fetchSurahWithTafsir,
} from './quraniApi';

// ─── Virtual Scroll Grid ──────────────────────────────────────────────────────
const VirtualSurahGrid = ({ surahNames, surahIndexes, showSurah }) => {
  const ITEM_HEIGHT = 90;
  const MIN_COL_WIDTH = 160;
  const OVERSCAN = 3;

  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(500);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
      setContainerHeight(entry.contentRect.height);
    });
    ro.observe(el);
    setContainerWidth(el.offsetWidth);
    setContainerHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setScrollTop(0);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [surahNames]);

  const columnCount = Math.max(2, Math.floor(containerWidth / MIN_COL_WIDTH));
  const colWidth = Math.floor(containerWidth / columnCount);
  const rowCount = Math.ceil(surahNames.length / columnCount);
  const totalHeight = rowCount * ITEM_HEIGHT;

  const firstRow = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const lastRow = Math.min(rowCount - 1, Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN);

  const visibleRows = [];

  for (let row = firstRow; row <= lastRow; row++) {
    const cells = [];
    for (let col = 0; col < columnCount; col++) {
      const idx = row * columnCount + col;
      if (idx >= surahNames.length) {
        cells.push(<div key={col} style={{ width: colWidth, flexShrink: 0 }} />);
        continue;
      }
      const surahIndex = surahIndexes?.[idx] ?? idx;
      cells.push(
        <div key={col} style={{ width: colWidth, flexShrink: 0, padding: '6px', boxSizing: 'border-box' }}>
          <div
            className="section-card h-full flex flex-col items-center justify-center gap-1"
            style={{ minHeight: ITEM_HEIGHT - 12, cursor: 'pointer' }}
            onClick={() => showSurah(surahIndex)}
          >
            <span style={{ color: '#f5c842', fontSize: '11px', fontWeight: 700, opacity: 0.7 }}>
              {surahIndex + 1}
            </span>
            <span style={{ fontWeight: 700, fontSize: '14px', lineHeight: 1.4, textAlign: 'center' }}>
              {surahNames[idx]}
            </span>
          </div>
        </div>
      );
    }
    visibleRows.push(
      <div
        key={row}
        style={{
          position: 'absolute',
          top: row * ITEM_HEIGHT,
          width: '100%',
          height: ITEM_HEIGHT,
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {cells}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height: '70vh', overflowY: 'auto', position: 'relative' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleRows}
      </div>
    </div>
  );
};

const surahAudioReciters = [
  { match: /golmami/i, name: ' مصطفى اسماعيل', image: 'img/mostafa.jpg' },
  { match: /server7\.mp3quran\.net\/basit/i, name: 'عبد الباسط عبد الصمد', image: 'img/abdoo.jpg' },
  { match: /server10\.mp3quran\.net\/minsh/i, name: 'محمد صديق المنشاوي', image: 'img/Sedeq.jpg' },
  { match: /server13\.mp3quran\.net\/husr/i, name: 'محمود خليل الحصري', image: 'img/hosery.jpg' },
  { match: /server8\.mp3quran\.net\/bna/i, name: 'محمود علي البنا', image: 'img/bana.jpg' },
  { match: /server10\.mp3quran\.net\/ajm/i, name: 'أحمد العجمي', image: 'img/agmy1.jpg' },
  { match: /server11\.mp3quran\.net\/sds/i, name: 'عبد الرحمن السديس', image: 'img/sodes.jpg' },
  { match: /server12\.mp3quran\.net\/maher/i, name: 'ماهر المعيقلي', image: 'img/moeqlyi.jpeg' },
  { match: /Quran-Huzza-Al_Baloushi/i, name: 'هزاع البلوشي', image: 'img/bloshy . jpg' },
  { match: /server8\.mp3quran\.net\/afs/i, name: 'مشاري العفاسي', image: 'img/mshary.jpg' },
  { match: /yasser-dosari/i, name: 'ياسر الدوسري', image: 'img/dosry.jpg' },
  { match: /muhammad-tablawi/i, name: 'محمد محمود الطبلاوي', image: 'img/tablawy.jpg' },
  { match: /saad-ghamdi/i, name: 'سعد الغامدي', image: 'img/saad.jpg' },
  { match: /ahmad-naina/i, name: 'أحمد نعينع', image: 'img/neana.jpg' },
  { match: /fares-abbad/i, name: 'فارس عباد', image: 'img/fares.jpg' },
];

const normalizeSurahAudio = (records) => {
  if (!Array.isArray(records)) return [];

  return records
    .map((record, index) => ({
      url: typeof record === 'string' ? record : record?.audio_url,
      index,
    }))
    .filter(({ url }) => typeof url === 'string' && url.trim())
    .map(({ url, index }) => {
      const reciterIndex = surahAudioReciters.findIndex(({ match }) => match.test(url));
      const reciter = surahAudioReciters[reciterIndex];

      return {
        url,
        index,
        order: reciterIndex === -1 ? surahAudioReciters.length + index : reciterIndex,
        name: reciter?.name || 'قارئ إضافي',
        image: reciter?.image || 'img/unnamed.png',
      };
    })
    .sort((a, b) => a.order - b.order || a.index - b.index);
};

const normalizeSurahName = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0640\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
  .replace(/[أإآٱ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .trim()
  .toLocaleLowerCase('ar');

const Quran = ({ activeSurahIndex, showSurah, closeSurah }) => {
  const [surahs, setSurahs] = useState([]);
  const [surahNames, setSurahNames] = useState([]);
  const [surahSearch, setSurahSearch] = useState('');
  const [surahData, setSurahData] = useState(null);
  const [audioItems, setAudioItems] = useState([]);
  const [tafsirEditions, setTafsirEditions] = useState([]);
  const [selectedTafsirId, setSelectedTafsirId] = useState(NO_TAFSIR_ID);
  const [surahListError, setSurahListError] = useState('');
  const [quranError, setQuranError] = useState('');
  const [isLoadingSurahNames, setIsLoadingSurahNames] = useState(true);
  const [isLoadingSurahData, setIsLoadingSurahData] = useState(false);
  const [showQuranFullscreen, setShowQuranFullscreen] = useState(false);
  const [catalogRetry, setCatalogRetry] = useState(0);
  const [quranRetry, setQuranRetry] = useState(0);
  const audioRefs = useRef([]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingSurahNames(true);
    setSurahListError('');
    fetchSurahCatalog(controller.signal)
      .then((data) => {
        setSurahs(data);
        setSurahNames(data.map((surah) => surah.displayName));
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setSurahListError('تعذر تحميل قائمة السور. تحقق من الاتصال ثم أعد المحاولة.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingSurahNames(false);
      });

    return () => controller.abort();
  }, [catalogRetry]);

  useEffect(() => {
    const controller = new AbortController();
    fetchArabicTafsirEditions(controller.signal)
      .then((editions) => {
        if (!editions.length) return;
        setTafsirEditions(editions);
        setSelectedTafsirId((current) => (current === NO_TAFSIR_ID || editions.some((edition) => edition.identifier === current)
          ? current
          : editions[0].identifier));
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setTafsirEditions([]);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (showQuranFullscreen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [showQuranFullscreen]);

  useEffect(() => {
    if (activeSurahIndex === null) {
      setSurahData(null);
      setAudioItems([]);
      setQuranError('');
      setIsLoadingSurahData(false);
      setShowQuranFullscreen(false);
      return;
    }

    const surah = surahs[activeSurahIndex];
    if (!surah) return;

    const controller = new AbortController();
    setSurahData(null);
    setQuranError('');
    setIsLoadingSurahData(true);
    fetchSurahWithTafsir(surah.number, selectedTafsirId, controller.signal)
      .then((data) => setSurahData({
        ...data,
        name: surah.displayName,
      }))
      .catch((error) => {
        if (error.name !== 'AbortError') setQuranError('تعذر تحميل السورة والتفسير. أعد المحاولة بعد قليل.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingSurahData(false);
      });

    return () => controller.abort();
  }, [activeSurahIndex, selectedTafsirId, surahs, quranRetry]);

  useEffect(() => {
    if (activeSurahIndex === null) return undefined;

    const controller = new AbortController();
    fetch(`https://gana-back-plum.vercel.app/api/surahs/${activeSurahIndex + 1}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Audio service unavailable');
        return response.json();
      })
      .then((data) => setAudioItems(normalizeSurahAudio(data.audio)))
      .catch((error) => {
        if (error.name !== 'AbortError') setAudioItems([]);
      });

    return () => controller.abort();
  }, [activeSurahIndex]);

  const handlePlay = useCallback((currentIndex) => {
    audioRefs.current.forEach((audio, i) => {
      if (i !== currentIndex && audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }, []);

  const normalizedSurahSearch = normalizeSurahName(surahSearch);
  const matchingSurahIndexes = surahNames
    .map((name, index) => ({ name, index }))
    .filter(({ name }) => normalizeSurahName(name).includes(normalizedSurahSearch))
    .map(({ index }) => index);
  const matchingSurahNames = matchingSurahIndexes.map((index) => surahNames[index]);

  return (
    <div dir="rtl">
      {/* ── Loading Overlays ── */}
      {isLoadingSurahNames && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 z-50">
          <div className="text-white text-2xl font-bold mb-6">جارٍ تحميل أسماء السور…</div>
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-yellow-500" />
        </div>
      )}

      {surahListError && !isLoadingSurahNames && (
        <div className="quran-api-error" role="alert">
          <p>{surahListError}</p>
          <button type="button" onClick={() => setCatalogRetry((attempt) => attempt + 1)}>إعادة المحاولة</button>
        </div>
      )}

      {isLoadingSurahData && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 z-50">
          <div className="text-white text-2xl font-bold mb-6">
            {selectedTafsirId === NO_TAFSIR_ID ? 'جارٍ تحميل السورة…' : 'جارٍ تحميل السورة والتفسير…'}
          </div>
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-green-500" />
        </div>
      )}

      {/* ── قائمة السور ── */}
      {activeSurahIndex === null && !isLoadingSurahNames && (
        <div className="mt-4 p-4 rounded-xl shadow-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <h2 className="text-2xl font-bold text-center text-white mb-6">القرآن الكريم</h2>
          <div className="quran-surah-search">
            <label htmlFor="quran-surah-search-input">ابحث باسم السورة</label>
            <div className="quran-surah-search-control">
              <Search size={19} aria-hidden="true" />
              <input
                id="quran-surah-search-input"
                type="search"
                value={surahSearch}
                onChange={(event) => setSurahSearch(event.target.value)}
                placeholder="مثال: البقرة أو الرحمن"
                autoComplete="off"
              />
              {surahSearch && (
                <button type="button" onClick={() => setSurahSearch('')} aria-label="مسح البحث">
                  <X size={18} />
                </button>
              )}
            </div>
            {surahSearch.trim() && matchingSurahIndexes.length > 0 && (
              <p className="quran-surah-search-count" role="status">
                عدد السور المطابقة: {matchingSurahIndexes.length}
              </p>
            )}
          </div>
          {matchingSurahNames.length ? (
            <VirtualSurahGrid
              surahNames={matchingSurahNames}
              surahIndexes={matchingSurahIndexes}
              showSurah={showSurah}
            />
          ) : surahSearch.trim() ? (
            <p className="quran-surah-no-results">لم نعثر على سورة بهذا الاسم. جرّب كتابة جزء من الاسم.</p>
          ) : null}
        </div>
      )}

      {activeSurahIndex !== null && !isLoadingSurahData && quranError && (
        <div className="quran-api-error" role="alert">
          <p>{quranError}</p>
          <button type="button" onClick={() => setQuranRetry((attempt) => attempt + 1)}>إعادة المحاولة</button>
        </div>
      )}

      {/* ── صفحة السورة ── */}
      {activeSurahIndex !== null && !isLoadingSurahData && surahData && (
        <div className="mt-2 sm:mt-4 p-3 sm:p-5 rounded-xl shadow-lg relative" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              className="text-white bg-red-500 hover:bg-red-600 w-8 h-8 sm:w-9 sm:h-9 rounded-full text-base sm:text-lg transition-colors flex items-center justify-center shadow-md flex-shrink-0"
              onClick={closeSurah}
              title="رجوع لقائمة السور"
            >
              ✕
            </button>
            <h2 className="text-xl sm:text-3xl font-bold text-white text-center flex-1 mx-2">
              سورة {surahData.name}
            </h2>
            <div className="w-8 sm:w-9 flex-shrink-0" />
          </div>

          <QuranTextReader
            surahData={surahData}
            tafsirEditions={tafsirEditions}
            selectedTafsirId={selectedTafsirId}
            onTafsirChange={setSelectedTafsirId}
            isFullscreen={showQuranFullscreen}
            onToggleFullscreen={() => setShowQuranFullscreen((isFullscreen) => !isFullscreen)}
          />

          {/* ── قارئي التلاوات ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-6">
            {audioItems.map((audioItem, index) => (
              <div
                key={`${audioItem.url}-${audioItem.index}`}
                className="audio-gold-frame"
                style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg,#1a2332,#111827)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                }}
              >
                <img
                  src={audioItem.image}
                  alt={audioItem.name}
                  className="w-full object-cover aspect-video"
                  loading="lazy"
                />
                <div className="p-2">
                  <p className="text-center text-sm font-semibold text-white mb-2">{audioItem.name}</p>
                  <audio
                    controls
                    className="w-full"
                    ref={(el) => (audioRefs.current[index] = el)}
                    onPlay={() => handlePlay(index)}
                  >
                    <source src={audioItem.url} type="audio/mpeg" />
                  </audio>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Quran;
