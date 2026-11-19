import React, { useCallback, useEffect, useState } from 'react';

const HADEETH_API = 'https://hadeethenc.com/api/v1';
const responseCache = new Map();

async function getJson(url) {
  if (!responseCache.has(url)) {
    const pending = fetch(url).then(async (response) => {
      if (!response.ok) throw new Error('تعذر تحميل البيانات (' + response.status + ')');
      return response.json();
    }).catch((error) => {
      responseCache.delete(url);
      throw error;
    });
    responseCache.set(url, pending);
  }
  return responseCache.get(url);
}

function LoadingMessage({ children = 'جارٍ تحميل الأحاديث…' }) {
  return <p className="knowledge-status" role="status">{children}</p>;
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="knowledge-error" role="alert">
      <p>{message || 'تعذر تحميل المحتوى الآن. تحقق من اتصال الإنترنت ثم أعد المحاولة.'}</p>
      <button className="knowledge-retry" type="button" onClick={onRetry}>إعادة المحاولة</button>
    </div>
  );
}

function HadithDetail({ hadith, onBack }) {
  const sourceUrl = `https://hadeethenc.com/api/v1/hadeeths/one/?language=ar&id=${encodeURIComponent(hadith.id)}`;
  return (
    <article className="knowledge-detail">
      <button className="knowledge-back" type="button" onClick={onBack}>→ العودة إلى الأحاديث</button>
      <div className="knowledge-detail-heading">
        <span className="knowledge-eyebrow">حديث نبوي</span>
        <h2>{hadith.title}</h2>
      </div>
      <blockquote className="knowledge-hadith-text">{hadith.hadeeth || hadith.title}</blockquote>
      <div className="knowledge-hadith-meta">
        {hadith.attribution && <span>التخريج: {hadith.attribution}</span>}
        {hadith.grade && <span>الدرجة: {hadith.grade}</span>}
      </div>
      {hadith.explanation && (
        <section className="knowledge-story-section">
          <h3>المعنى والشرح</h3>
          <p className="knowledge-story-text">{hadith.explanation}</p>
        </section>
      )}
      {!!hadith.hints?.length && (
        <section className="knowledge-story-section">
          <h3>فوائد الحديث</h3>
          <ul className="knowledge-hints">{hadith.hints.map((hint, index) => <li key={`${index}-${hint}`}>{hint}</li>)}</ul>
        </section>
      )}
      {!!hadith.words_meanings?.length && (
        <section className="knowledge-story-section">
          <h3>معاني الكلمات</h3>
          <dl className="knowledge-words">{hadith.words_meanings.map((entry, index) => (
            <div key={`${index}-${entry.word}`}><dt>{entry.word}</dt><dd>{entry.meaning}</dd></div>
          ))}</dl>
        </section>
      )}
      {hadith.reference && <details className="knowledge-reference"><summary>المراجع التفصيلية</summary><p>{hadith.reference}</p></details>}
      <a className="knowledge-source-link" href={sourceUrl} target="_blank" rel="noreferrer">مصدر الحديث وبياناته ↗</a>
      <p className="knowledge-source-note">المصدر: <a href="https://hadeethenc.com/ar/home" target="_blank" rel="noreferrer">موسوعة الأحاديث النبوية — HadeethEnc</a>.</p>
    </article>
  );
}

function HadithBrowser() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('5');
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [categoriesRetry, setCategoriesRetry] = useState(0);
  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchRetry, setSearchRetry] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    let active = true;
    setCategoriesLoading(true);
    setCategoriesError('');
    getJson(`${HADEETH_API}/categories/roots/?language=ar`)
      .then((result) => { if (active) setCategories(Array.isArray(result) ? result : []); })
      .catch((loadError) => { if (active) setCategoriesError(loadError.message); })
      .finally(() => { if (active) setCategoriesLoading(false); });
    return () => { active = false; };
  }, [categoriesRetry]);

  const loadHadithList = useCallback(() => {
    setListLoading(true);
    setListError('');
    const url = `${HADEETH_API}/hadeeths/list/?language=ar&category_id=${encodeURIComponent(categoryId)}&page=${page}&per_page=12`;
    getJson(url)
      .then((result) => {
        setList(Array.isArray(result.data) ? result.data : []);
        setLastPage(Number(result.meta?.last_page) || 1);
      })
      .catch((loadError) => setListError(loadError.message))
      .finally(() => setListLoading(false));
  }, [categoryId, page]);

  useEffect(() => { loadHadithList(); }, [loadHadithList]);

  useEffect(() => {
    const phrase = query.trim();
    if (!phrase) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError('');
      return undefined;
    }
    if (phrase.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError('');
      return undefined;
    }

    let active = true;
    setSearchLoading(true);
    setSearchError('');
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ phrase, language: 'ar' });
      getJson(`${HADEETH_API}/hadeeths/search/?${params.toString()}`)
        .then((result) => { if (active) setSearchResults(Array.isArray(result) ? result : []); })
        .catch((loadError) => { if (active) setSearchError(loadError.message); })
        .finally(() => { if (active) setSearchLoading(false); });
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, searchRetry]);

  const openHadith = async (id) => {
    setSelectedId(id);
    setDetail(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      const result = await getJson(`${HADEETH_API}/hadeeths/one/?language=ar&id=${encodeURIComponent(id)}`);
      setDetail(result);
    } catch (loadError) {
      setDetailError(loadError.message);
    } finally {
      setDetailLoading(false);
    }
  };

  if (selectedId) {
    if (detailLoading) return <LoadingMessage />;
    if (detailError) return <ErrorMessage message={detailError} onRetry={() => openHadith(selectedId)} />;
    if (detail) return <HadithDetail hadith={detail} onBack={() => { setSelectedId(null); setDetail(null); }} />;
  }

  const hasQuery = Boolean(query.trim());
  const searchActive = query.trim().length >= 2;
  const visibleItems = searchActive ? searchResults : list;
  const loading = searchActive ? searchLoading : hasQuery ? false : listLoading;
  const error = searchActive ? searchError : hasQuery ? '' : listError;

  return (
    <div className="knowledge-page">
      <div className="knowledge-hero">
        <span className="knowledge-hero-icon" aria-hidden="true">ﷺ</span>
        <span className="knowledge-eyebrow">المتون العربية مع التخريج والشرح</span>
        <h1>الأحاديث النبوية</h1>
        <p>ابحث باسم الحديث أو تصفح الأحاديث حسب أبوابها.</p>
      </div>
      <div className="knowledge-content">
        <label className="knowledge-search-label" htmlFor="hadith-search">البحث باسم الحديث</label>
        <input
          id="hadith-search"
          className="knowledge-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="اكتب اسم الحديث، مثل: إنما الأعمال بالنيات"
          autoComplete="off"
        />

        {!hasQuery && (
          <>
            <label className="knowledge-search-label" htmlFor="hadith-category">أو اختر بابًا للتصفح</label>
            <select
              id="hadith-category"
              className="knowledge-search knowledge-select"
              value={categoryId}
              onChange={(event) => { setCategoryId(event.target.value); setPage(1); }}
              disabled={categoriesLoading || !categories.length}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.title} ({category.hadeeths_count})</option>
              ))}
            </select>
          </>
        )}

        {hasQuery && query.trim().length < 2 && <p className="knowledge-status">اكتب حرفين على الأقل للبحث.</p>}
        {categoriesError && !hasQuery && (
          <ErrorMessage message={categoriesError} onRetry={() => setCategoriesRetry((value) => value + 1)} />
        )}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={searchActive ? () => setSearchRetry((value) => value + 1) : loadHadithList}
          />
        )}
        {categoriesLoading && !hasQuery && <LoadingMessage>جارٍ تحميل أبواب الحديث…</LoadingMessage>}
        {loading && !error && <LoadingMessage>{searchActive ? 'جارٍ البحث في الأحاديث…' : 'جارٍ تحميل الأحاديث…'}</LoadingMessage>}

        {!loading && !error && (searchActive || !hasQuery) && (
          <>
            {searchActive && <p className="knowledge-results-count">نتائج البحث: {searchResults.length}</p>}
            <div className="knowledge-hadith-list" aria-live="polite">
              {visibleItems.slice(0, searchActive ? 50 : 12).map((hadith) => (
                <button className="knowledge-hadith-card" type="button" key={hadith.id} onClick={() => openHadith(hadith.id)}>
                  <span className="knowledge-hadith-card-icon" aria-hidden="true">ﷺ</span>
                  <span className="knowledge-hadith-card-copy">
                    <strong>{hadith.title}</strong>
                    {hadith.hadith_text && <span>{hadith.hadith_text}</span>}
                  </span>
                  <span className="knowledge-open-icon" aria-hidden="true">←</span>
                </button>
              ))}
            </div>
            {!visibleItems.length && <p className="knowledge-status">لا توجد أحاديث مطابقة لهذا البحث.</p>}
            {!searchActive && lastPage > 1 && (
              <div className="knowledge-pagination">
                <button type="button" disabled={page <= 1 || listLoading} onClick={() => setPage((current) => current - 1)}>السابق</button>
                <span>صفحة {page} من {lastPage}</span>
                <button type="button" disabled={page >= lastPage || listLoading} onClick={() => setPage((current) => current + 1)}>التالي</button>
              </div>
            )}
          </>
        )}

        <p className="knowledge-source-note">
          النصوص والشرح والدرجات من{' '}
          <a href="https://hadeethenc.com/ar/home" target="_blank" rel="noreferrer">موسوعة الأحاديث النبوية — HadeethEnc</a>.
        </p>
      </div>
    </div>
  );
}

export default function KnowledgeLibrary() {
  return <HadithBrowser />;
}
