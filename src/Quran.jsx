import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Download, Maximize2, Check, Loader2, BookOpen, CheckCircle2, ExternalLink } from 'lucide-react';

const getPdfEmbedUrl = (pdfUrl) => {
  if (!pdfUrl) return '';
  if (pdfUrl.includes('drive.google.com')) {
    const fileId = pdfUrl.split('/d/')[1]?.split('/')[0];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return pdfUrl;
};

const getPdfDownloadUrl = (pdfUrl) => {
  if (!pdfUrl) return '';
  if (pdfUrl.includes('drive.google.com')) {
    const fileId = pdfUrl.split('/d/')[1]?.split('/')[0];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return pdfUrl;
};

// ─── Modern Toast Notification ────────────────────────────────────────────────
const DownloadToast = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 24,
        zIndex: 10002,
        direction: 'rtl',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(245, 200, 66, 0.5)',
        borderRadius: 16,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(245, 200, 66, 0.25)',
        color: '#fff',
        fontFamily: 'Cairo, sans-serif',
        maxWidth: '90vw',
        animation: 'slideUpToast 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 200, 66, 0.2)',
          border: `1px solid ${toast.type === 'success' ? '#10b981' : '#f5c842'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {toast.type === 'success' ? (
          <CheckCircle2 size={20} color="#10b981" />
        ) : (
          <Loader2 size={20} color="#f5c842" className="animate-spin" />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: toast.type === 'success' ? '#10b981' : '#f5c842' }}>
          {toast.title}
        </span>
        <span style={{ fontSize: '12px', color: '#e2e8f0', opacity: 0.9 }}>
          {toast.message}
        </span>
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '0 4px',
          marginRight: 'auto',
        }}
      >
        ✕
      </button>
    </div>
  );
};

// ─── Custom Animated Download Button ──────────────────────────────────────────
const BeautifulDownloadButton = ({ pdfUrl, surahName, onNotify, isCompact = false, className = '' }) => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'downloading' | 'success'

  const handleDownload = (e) => {
    e.preventDefault();
    if (status === 'downloading') return;

    setStatus('downloading');
    if (onNotify) {
      onNotify({
        type: 'downloading',
        title: 'جارٍ بدء التحميل...',
        message: `يتم تجهيز ملف مصحف سورة ${surahName}`,
      });
    }

    const downloadLink = getPdfDownloadUrl(pdfUrl);

    // Open download link
    const link = document.createElement('a');
    link.href = downloadLink;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Success animation transition
    setTimeout(() => {
      setStatus('success');
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'تم بدء التحميل بنجاح! 📥',
          message: `سيبدأ تنزيل مصحف سورة ${surahName} في مجلد التنزيلات`,
        });
      }

      setTimeout(() => {
        setStatus('idle');
      }, 3500);
    }, 1400);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={status === 'downloading'}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: isCompact ? '6px 12px' : '8px 18px',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: isCompact ? '0.8rem' : '0.9rem',
        fontFamily: 'Cairo, sans-serif',
        cursor: status === 'downloading' ? 'wait' : 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: 'none',
        whiteSpace: 'nowrap',
        background:
          status === 'success'
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : status === 'downloading'
            ? 'linear-gradient(135deg, #d97706, #b45309)'
            : 'linear-gradient(135deg, #f5c842, #e0a800)',
        color: status === 'success' || status === 'downloading' ? '#fff' : '#1e1b18',
        boxShadow:
          status === 'success'
            ? '0 4px 18px rgba(16, 185, 129, 0.45)'
            : status === 'downloading'
            ? '0 4px 18px rgba(217, 119, 6, 0.45)'
            : '0 4px 16px rgba(245, 200, 66, 0.35)',
        transform: status === 'downloading' ? 'scale(0.97)' : 'scale(1)',
      }}
      onMouseEnter={(e) => {
        if (status === 'idle') {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 200, 66, 0.5)';
        }
      }}
      onMouseLeave={(e) => {
        if (status === 'idle') {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 200, 66, 0.35)';
        }
      }}
    >
      {status === 'downloading' ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          <span>جارٍ التحميل…</span>
        </>
      ) : status === 'success' ? (
        <>
          <Check size={15} />
          <span>تم التحميل!</span>
        </>
      ) : (
        <>
          <Download size={15} />
          <span>{isCompact ? 'تحميل' : 'تحميل السورة'}</span>
        </>
      )}
    </button>
  );
};

// ─── Virtual Scroll Grid ──────────────────────────────────────────────────────
const VirtualSurahGrid = ({ surahNames, showSurah }) => {
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
      cells.push(
        <div key={col} style={{ width: colWidth, flexShrink: 0, padding: '6px', boxSizing: 'border-box' }}>
          <div
            className="section-card h-full flex flex-col items-center justify-center gap-1"
            style={{ minHeight: ITEM_HEIGHT - 12, cursor: 'pointer' }}
            onClick={() => showSurah(idx)}
          >
            <span style={{ color: '#f5c842', fontSize: '11px', fontWeight: 700, opacity: 0.7 }}>
              {idx + 1}
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

// ─── PDF Card (Single Persistent Viewer with Instant Fullscreen) ─────────────
const PdfCard = ({ surahData, showPdfModal, setShowPdfModal, onNotify }) => {
  const [iframeLoading, setIframeLoading] = useState(true);

  // إعادة تعيين مؤشر التحميل عند تغيير السورة
  useEffect(() => {
    setIframeLoading(true);
  }, [surahData.pdfs?.[0]]);

  // منع سكرول الصفحة الخلفية فقط على الشاشات الكبيرة في وضع ملء الشاشة
  useEffect(() => {
    if (showPdfModal && window.innerWidth > 768) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [showPdfModal]);

  if (!surahData.pdfs?.[0]) return null;

  const HEADER_H = 50;

  return (
    <div
      className={showPdfModal ? "fixed inset-0 z-[99999] bg-black overflow-hidden flex flex-col" : "pdf-card mb-6"}
      style={showPdfModal ? { position: 'fixed', inset: 0, zIndex: 99999, background: '#000', height: '100dvh', width: '100vw' } : {}}
    >
      {/* ── شريط الرأس في وضع ملء الشاشة ── */}
      {showPdfModal ? (
        <div
          style={{
            height: HEADER_H,
            background: '#0f172a',
            borderBottom: '2px solid #f5c842',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            direction: 'rtl',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              fontFamily: 'Cairo, sans-serif',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '38%',
            }}
            title={`مصحف سورة ${surahData.name}`}
          >
            📖 سورة {surahData.name}
          </span>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            <a
              href={surahData.pdfs[0]}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: 'rgba(245, 200, 66, 0.15)',
                border: '1px solid rgba(245, 200, 66, 0.4)',
                color: '#f5c842',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.78rem',
                fontWeight: 700,
                fontFamily: 'Cairo, sans-serif',
              }}
              title="فتح في عارض الهاتف المباشر"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">تصفح مباشر</span>
            </a>

            <BeautifulDownloadButton
              pdfUrl={surahData.pdfs[0]}
              surahName={surahData.name}
              onNotify={onNotify}
              isCompact={true}
            />

            <button
              onClick={() => setShowPdfModal(false)}
              style={{
                padding: '6px 12px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'Cairo, sans-serif',
                boxShadow: '0 2px 8px rgba(220,38,38,0.4)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#b91c1c')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#dc2626')}
            >
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>✕</span>
              <span className="hidden xs:inline">إغلاق</span>
            </button>
          </div>
        </div>
      ) : (
        /* ── شريط الرأس في وضع البطاقة العادية ── */
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h3 className="text-white font-bold text-base sm:text-xl flex items-center gap-2">
            <span>📖 المصحف الشريف — سورة {surahData.name}</span>
          </h3>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <button
              onClick={() => setShowPdfModal(true)}
              className="flex-1 sm:flex-initial bg-white text-yellow-700 px-3.5 py-2 rounded-lg hover:bg-gray-100 transition-colors font-bold text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              title="تكبير وملء الشاشة لقراءة أوضح"
            >
              <Maximize2 size={15} />
              <span>ملء الشاشة</span>
            </button>

            <BeautifulDownloadButton
              pdfUrl={surahData.pdfs[0]}
              surahName={surahData.name}
              onNotify={onNotify}
              isCompact={true}
              className="flex-1 sm:flex-initial justify-center"
            />
          </div>
        </div>
      )}

      {/* ── إطار العرض (مشترك بين الوضع العادي وملء الشاشة لمنع إعادة التحميل) ── */}
      <div
        className={showPdfModal ? "flex-1 w-full h-full relative overflow-hidden flex flex-col" : "relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl"}
        style={
          showPdfModal
            ? { flex: 1, width: '100%', height: `calc(100% - ${HEADER_H}px)`, position: 'relative', overflow: 'hidden', background: '#0b1120' }
            : { border: '1px solid rgba(245, 200, 66, 0.25)', background: '#1a1f2c' }
        }
      >
        {/* تنبيه خفيف على الهاتف في وضع ملء الشاشة */}
        {showPdfModal && (
          <div
            className="flex sm:hidden"
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              borderBottom: '1px solid rgba(245, 200, 66, 0.2)',
              padding: '4px 10px',
              alignItems: 'center',
              justifyContent: 'center',
              direction: 'rtl',
              fontSize: '11px',
              color: '#cbd5e1',
              fontFamily: 'Cairo, sans-serif',
              flexShrink: 0,
              textAlign: 'center',
            }}
          >
            <span>💡 <strong style={{ color: '#f5c842' }}>على الهاتف:</strong> مرّر بإصبعين للتنقل، أو اضغط زر ↗ بأعلى الشاشة</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {iframeLoading && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center"
            style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}
          >
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3"
              style={{
                border: '2px dashed #f5c842',
                animation: 'spin 8s linear infinite',
              }}
            >
              <BookOpen size={24} className="text-yellow-400" />
            </div>
            <div className="text-yellow-400 font-bold text-base sm:text-lg mb-1">
              جارٍ إعداد صفحات المصحف الشريف…
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">
              سورة {surahData.name} • يتم التحميل بأعلى أولوية
            </div>
          </div>
        )}

        {/* ── IFRAME واحد فقط يعمل بأولوية قصوى ولا يُعاد تحميله ── */}
        <iframe
          src={getPdfEmbedUrl(surahData.pdfs[0])}
          className={showPdfModal ? "w-full h-full" : "pdf-preview-frame w-full"}
          title={`مصحف سورة ${surahData.name}`}
          loading="eager"
          scrolling="yes"
          onLoad={() => setIframeLoading(false)}
          style={{
            border: 'none',
            display: 'block',
            width: '100%',
            height: showPdfModal ? '100%' : undefined,
            flex: showPdfModal ? 1 : undefined,
            opacity: iframeLoading ? 0 : 1,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'auto',
          }}
        />

        {/* زر التكبير في الزاوية في وضع البطاقة العادية */}
        {!showPdfModal && (
          <button
            onClick={() => setShowPdfModal(true)}
            className="absolute bottom-3 left-3 z-20 bg-gray-900 bg-opacity-85 hover:bg-opacity-100 text-yellow-400 hover:text-yellow-300 px-2.5 py-1.5 rounded-lg border border-yellow-500 border-opacity-40 shadow-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer hover:scale-105"
            title="عرض ملء الشاشة"
          >
            <Maximize2 size={13} />
            <span>ملء الشاشة</span>
          </button>
        )}
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

const Quran = ({ activeSurahIndex, showSurah, closeSurah }) => {
  const [surahNames, setSurahNames] = useState([]);
  const [surahData, setSurahData] = useState({ name: '', pdfs: [], audio: [] });
  const [isLoadingSurahNames, setIsLoadingSurahNames] = useState(true);
  const [isLoadingSurahData, setIsLoadingSurahData] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  const audioRefs = useRef([]);

  const showNotification = useCallback(({ type, title, message }) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type, title, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  useEffect(() => {
    setIsLoadingSurahNames(true);
    fetch('https://gana-back-plum.vercel.app/api/surahs')
      .then((r) => r.json())
      .then((data) => setSurahNames(data.map((s) => s.name)))
      .catch(console.error)
      .finally(() => setIsLoadingSurahNames(false));
  }, []);

  useEffect(() => {
    if (activeSurahIndex === null) {
      setSurahData({ name: '', pdfs: [], audio: [] });
      return;
    }
    setIsLoadingSurahData(true);
    fetch(`https://gana-back-plum.vercel.app/api/surahs/${activeSurahIndex + 1}`)
      .then((r) => r.json())
      .then((data) => setSurahData({
        name: data.name || '',
        pdfs: Array.isArray(data.pdfs) ? data.pdfs : [],
        audio: normalizeSurahAudio(data.audio),
      }))
      .catch(console.error)
      .finally(() => setIsLoadingSurahData(false));
  }, [activeSurahIndex]);

  const handlePlay = useCallback((currentIndex) => {
    audioRefs.current.forEach((audio, i) => {
      if (i !== currentIndex && audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }, []);

  return (
    <div dir="rtl">
      {/* ── Keyframes for Toast & animations ── */}
      <style>{`
        @keyframes slideUpToast {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* ── Toast Notification ── */}
      <DownloadToast toast={toast} onClose={() => setToast(null)} />

      {/* ── Loading Overlays ── */}
      {isLoadingSurahNames && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 z-50">
          <div className="text-white text-2xl font-bold mb-6">جارٍ تحميل أسماء السور…</div>
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-yellow-500" />
        </div>
      )}

      {isLoadingSurahData && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 z-50">
          <div className="text-white text-2xl font-bold mb-6">جارٍ تحميل بيانات السورة…</div>
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-green-500" />
        </div>
      )}

      {/* ── قائمة السور ── */}
      {activeSurahIndex === null && !isLoadingSurahNames && (
        <div className="mt-4 p-4 rounded-xl shadow-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <h2 className="text-2xl font-bold text-center text-white mb-6">القرآن الكريم</h2>
          <VirtualSurahGrid surahNames={surahNames} showSurah={showSurah} />
        </div>
      )}

      {/* ── صفحة السورة ── */}
      {activeSurahIndex !== null && !isLoadingSurahData && (
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

          {/* ── PDF Card with Instant Fullscreen (Single Persistent Viewer) ── */}
          <PdfCard
            surahData={surahData}
            showPdfModal={showPdfModal}
            setShowPdfModal={setShowPdfModal}
            onNotify={showNotification}
          />

          {/* ── قارئي التلاوات ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-6">
            {surahData.audio.map((audioItem, index) => (
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
