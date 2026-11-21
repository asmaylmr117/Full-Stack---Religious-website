import React, { useEffect, useId, useRef, useState } from 'react';
import { BookOpen, Check, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { NO_TAFSIR_ID } from './quraniApi';

const arabicNumbers = new Intl.NumberFormat('ar-EG');

const TafsirPicker = ({ editions, selectedTafsirId, onTafsirChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const pickerRef = useRef(null);
  const triggerRef = useRef(null);
  const pickerId = useId();
  const selectedEdition = editions.find((edition) => edition.identifier === selectedTafsirId);
  const selectedName = selectedTafsirId === NO_TAFSIR_ID
    ? 'بدون تفسير'
    : selectedEdition?.name || 'اختر كتاب التفسير';
  const normalizedSearch = search.trim().toLocaleLowerCase('ar');
  const visibleEditions = editions.filter((edition) =>
    `${edition.name || ''} ${edition.englishName || ''}`.toLocaleLowerCase('ar').includes(normalizedSearch));

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!pickerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const chooseTafsir = (tafsirId) => {
    onTafsirChange(tafsirId);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="quran-tafsir-picker" ref={pickerRef}>
      <span className="quran-tafsir-label" id={`${pickerId}-label`}>التفسير</span>
      <button
        ref={triggerRef}
        type="button"
        className="quran-tafsir-trigger"
        aria-labelledby={`${pickerId}-label ${pickerId}-value`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${pickerId}-options`}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="quran-tafsir-selected" id={`${pickerId}-value`}>{selectedName}</span>
        <ChevronDown size={16} className={isOpen ? 'quran-tafsir-chevron is-open' : 'quran-tafsir-chevron'} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="quran-tafsir-menu">
          <input
            className="quran-tafsir-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث عن تفسير"
            aria-label="ابحث في كتب التفسير"
            autoComplete="off"
          />
          <div className="quran-tafsir-options" id={`${pickerId}-options`} role="listbox" aria-label="كتب التفسير">
            <button
              type="button"
              className={`quran-tafsir-option${selectedTafsirId === NO_TAFSIR_ID ? ' is-selected' : ''}`}
              role="option"
              aria-selected={selectedTafsirId === NO_TAFSIR_ID}
              onClick={() => chooseTafsir(NO_TAFSIR_ID)}
            >
              <span>بدون تفسير</span>
              {selectedTafsirId === NO_TAFSIR_ID && <Check size={16} aria-hidden="true" />}
            </button>
            {visibleEditions.map((edition) => {
              const isSelected = edition.identifier === selectedTafsirId;
              return (
                <button
                  type="button"
                  className={`quran-tafsir-option${isSelected ? ' is-selected' : ''}`}
                  key={edition.identifier}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => chooseTafsir(edition.identifier)}
                >
                  <span>{edition.name}</span>
                  {isSelected && <Check size={16} aria-hidden="true" />}
                </button>
              );
            })}
            {visibleEditions.length === 0 && (
              <p className="quran-tafsir-empty">لا توجد نتائج مطابقة.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const QuranTextReader = ({
  surahData,
  tafsirEditions,
  selectedTafsirId,
  onTafsirChange,
  isFullscreen,
  onToggleFullscreen,
  onContinueBelow,
}) => {
  const touchStartRef = useRef(null);
  const selectedTafsir = tafsirEditions.find((edition) => edition.identifier === selectedTafsirId);

  const handleWheel = (event) => {
    if (!isFullscreen || event.deltaY <= 0) return;
    const element = event.currentTarget;
    const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 2;
    if (isAtBottom) {
      event.preventDefault();
      onContinueBelow();
    }
  };

  const handleTouchStart = (event) => {
    const element = event.currentTarget;
    const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 2;
    touchStartRef.current = {
      y: event.touches[0]?.clientY ?? 0,
      isAtBottom,
    };
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!isFullscreen || !start?.isAtBottom) return;

    const endY = event.changedTouches[0]?.clientY ?? start.y;
    if (endY < start.y) onContinueBelow();
  };

  return (
    <section
      className={`quran-text-reader${isFullscreen ? ' quran-reader-fullscreen' : ''}`}
      aria-label={`قراءة ${surahData.name}`}
    >
      <div className="quran-reader-toolbar">
        <div className="quran-reader-heading">
          <BookOpen size={21} aria-hidden="true" />
          <div>
            <h3>المصحف الشريف</h3>
            <p>بالرسم العثماني · مصدر النص: Qurani.ai</p>
          </div>
        </div>

        <div className="quran-reader-actions">
          <TafsirPicker
            editions={tafsirEditions}
            selectedTafsirId={selectedTafsirId}
            onTafsirChange={onTafsirChange}
          />
          <button
            type="button"
            className="quran-reader-fullscreen-button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'إنهاء ملء الشاشة' : 'عرض ملء الشاشة'}
            title={isFullscreen ? 'إنهاء ملء الشاشة' : 'عرض ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <div
        className="quran-reader-scroll"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="quran-reader-surah-intro">
          <h4>سورة {surahData.name}</h4>
          <p>
            {surahData.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
            {' · '}
            {arabicNumbers.format(surahData.numberOfAyahs || surahData.ayahs.length)} آية
          </p>
        </div>

        <div className="quran-ayah-list">
          {surahData.ayahs.map((ayah) => (
            <article className="quran-ayah-card" key={ayah.number}>
              <div className="quran-ayah-meta">
                <span>الآية {arabicNumbers.format(ayah.numberInSurah)}</span>
                {ayah.sajda && <span className="quran-sajda-badge">موضع سجدة</span>}
              </div>
              <p className="quran-ayah-text" lang="ar">
                {ayah.text}
                <span className="quran-ayah-end" aria-label={`رقم الآية ${ayah.numberInSurah}`}>
                  {arabicNumbers.format(ayah.numberInSurah)}
                </span>
              </p>
              {ayah.tafsir && (
                <div className="quran-tafsir-text">
                  <h5>التفسير · {selectedTafsir?.name || 'الطبعة المختارة'}</h5>
                  <p>{ayah.tafsir}</p>
                </div>
              )}
            </article>
          ))}
        </div>

        {isFullscreen && (
          <button type="button" className="quran-continue-page" onClick={onContinueBelow}>
            متابعة إلى التلاوات أسفل السورة ↓
          </button>
        )}
      </div>
    </section>
  );
};

export default QuranTextReader;
