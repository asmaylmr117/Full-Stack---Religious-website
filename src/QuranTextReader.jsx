import React from 'react';
import { BookOpen, Maximize2, Minimize2 } from 'lucide-react';
import { NO_TAFSIR_ID } from './quraniApi';

const arabicNumbers = new Intl.NumberFormat('ar-EG');

const QuranTextReader = ({
  surahData,
  tafsirEditions,
  selectedTafsirId,
  onTafsirChange,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const selectedTafsir = tafsirEditions.find((edition) => edition.identifier === selectedTafsirId);

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
          <label className="quran-tafsir-picker">
            <span>التفسير</span>
            <select
              value={selectedTafsirId}
              onChange={(event) => onTafsirChange(event.target.value)}
              aria-label="اختر كتاب التفسير"
            >
              <option value={NO_TAFSIR_ID}>بدون تفسير</option>
              {tafsirEditions.map((edition) => (
                <option key={edition.identifier} value={edition.identifier}>
                  {edition.name}
                </option>
              ))}
            </select>
          </label>
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

      <div className="quran-reader-scroll">
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
      </div>
    </section>
  );
};

export default QuranTextReader;
