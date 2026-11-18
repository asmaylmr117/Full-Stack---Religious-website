import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Download, Maximize2, Check, Loader2, BookOpen, CheckCircle2, ExternalLink } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
const BeautifulDownloadButton = ({ pdfUrl, surahName, onNotify, isCompact = false }) => {
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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: isCompact ? '6px 14px' : '9px 20px',
        borderRadius: 10,
        fontWeight: 700,
        fontSize: isCompact ? '0.85rem' : '0.92rem',
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
          <Loader2 size={16} className="animate-spin" />
          <span>جارٍ التحميل…</span>
        </>
      ) : status === 'success' ? (
        <>
          <Check size={16} />
          <span>تم التحميل!</span>
        </>
      ) : (
        <>
          <Download size={16} />
          <span>تحميل السورة</span>
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

// ─── PDF Card ─────────────────────────────────────────────────────────────────
const PdfCard = ({ surahData, setShowPdfModal, onNotify }) => {
  const [iframeLoading, setIframeLoading] = useState(true);

  if (!surahData.pdfs?.[0]) return null;

  return (
    <div className="pdf-card mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h3 className="text-white font-bold text-xl flex items-center gap-2">
          <span>📖 المصحف الشريف — سورة {surahData.name}</span>
        </h3>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setShowPdfModal(true)}
            className="bg-white text-yellow-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-bold text-sm whitespace-nowrap flex items-center gap-2 shadow-sm cursor-pointer"
            title="تكبير وملء الشاشة لقراءة أوضح"
          >
            <Maximize2 size={16} />
            <span>عرض ملء الشاشة</span>
          </button>

          <BeautifulDownloadButton
            pdfUrl={surahData.pdfs[0]}
            surahName={surahData.name}
            onNotify={onNotify}
          />
        </div>
      </div>

      <div
        className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl"
        style={{
          border: '1px solid rgba(245, 200, 66, 0.25)',
          background: '#1a1f2c',
        }}
      >
        {/* Loading Skeleton */}
        {iframeLoading && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center"
            style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                border: '2px dashed #f5c842',
                animation: 'spin 8s linear infinite',
              }}
            >
              <BookOpen size={28} className="text-yellow-400" />
            </div>
            <div className="text-yellow-400 font-bold text-lg mb-1">
              جارٍ إعداد صفحات المصحف الشريف…
            </div>
            <div className="text-gray-400 text-sm">
              سورة {surahData.name} • يمكنك التمرير لأسفل داخل المصحف لقراءة جميع الصفحات
            </div>
          </div>
        )}

        <iframe
          src={getPdfEmbedUrl(surahData.pdfs[0])}
          className="w-full"
          title={`مصحف سورة ${surahData.name}`}
          loading="lazy"
          scrolling="yes"
          onLoad={() => setIframeLoading(false)}
          style={{
            minHeight: '620px',
            height: '75vh',
            border: 'none',
            display: 'block',
            opacity: iframeLoading ? 0 : 1,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'auto',
          }}
        />

        {/* Floating Quick Fullscreen Button in corner */}
        <button
          onClick={() => setShowPdfModal(true)}
          className="absolute bottom-4 left-4 z-20 bg-gray-900 bg-opacity-85 hover:bg-opacity-100 text-yellow-400 hover:text-yellow-300 px-3 py-2 rounded-lg border border-yellow-500 border-opacity-40 shadow-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer hover:scale-105"
          title="عرض ملء الشاشة"
        >
          <Maximize2 size={15} />
          <span>ملء الشاشة</span>
        </button>
      </div>
    </div>
  );
};

// ─── PDF Modal ────────────────────────────────────────────────────────────────
const HEADER_H = 54;

const PdfModal = ({ surahData, showPdfModal, setShowPdfModal, onNotify }) => {
  const [iframeLoading, setIframeLoading] = useState(true);

  // منع سكرول الصفحة الخلفية فقط على الشاشات الكبيرة (حتى لا يتجمد اللمس على هواتف iOS و Android)
  useEffect(() => {
    if (showPdfModal && window.innerWidth > 768) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [showPdfModal]);

  if (!showPdfModal || !surahData.pdfs?.[0]) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000' }}>
      {/* Header */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_H,
          zIndex: 10000,
          background: '#0f172a',
          borderBottom: '2px solid #f5c842',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          direction: 'rtl',
        }}
      >
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', fontFamily: 'Cairo, sans-serif' }}>
          📖 مصحف سورة {surahData.name}
        </span>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a
            href={surahData.pdfs[0]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'rgba(245, 200, 66, 0.15)',
              border: '1px solid rgba(245, 200, 66, 0.4)',
              color: '#f5c842',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.82rem',
              fontWeight: 700,
              fontFamily: 'Cairo, sans-serif',
            }}
            title="فتح في عارض الهاتف المباشر"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">عرض مباشر</span>
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
              padding: '6px 14px',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: 'Cairo, sans-serif',
              boxShadow: '0 2px 10px rgba(220,38,38,0.5)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#b91c1c')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#dc2626')}
          >
            <span>إغلاق</span>
            <span style={{ fontSize: '1.1rem' }}>✕</span>
          </button>
        </div>
      </div>

      {/* Locked Container (Prevents outer page from slipping down) */}
      <div
        style={{
          position: 'fixed',
          top: HEADER_H,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          background: '#0b1120',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Mobile Info & Direct Viewer Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 200, 66, 0.15), rgba(15, 23, 42, 0.98))',
            borderBottom: '1px solid rgba(245, 200, 66, 0.25)',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            direction: 'rtl',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#cbd5e1', fontSize: '12px', fontFamily: 'Cairo, sans-serif' }}>
            📱 <strong style={{ color: '#f5c842' }}>على الهاتف:</strong> مرّر بإصبعين للتنقل، أو افتح العارض المباشر لتصفح الـ 21 صفحة بسلاسة
          </span>
          <a
            href={surahData.pdfs[0]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #f5c842, #e0a800)',
              color: '#1a1000',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'Cairo, sans-serif',
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(245,200,66,0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            <ExternalLink size={13} />
            <span>تصفح كامل السورة ↗</span>
          </a>
        </div>

        {/* Loading overlay in Modal */}
        {iframeLoading && (
          <div
            style={{
              position: 'absolute',
              top: 48,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#0b1120',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              color: '#f5c842',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                border: '3px solid rgba(245, 200, 66, 0.2)',
                borderTopColor: '#f5c842',
                animation: 'spin 1s linear infinite',
                marginBottom: 16,
              }}
            />
            <div style={{ fontFamily: 'Cairo, sans-serif', fontSize: '1.1rem', fontWeight: 700 }}>
              جارٍ فتح المصحف الشريف…
            </div>
          </div>
        )}

        <iframe
          src={getPdfEmbedUrl(surahData.pdfs[0])}
          title="عارض المصحف"
          scrolling="yes"
          onLoad={() => setIframeLoading(false)}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
};

// ─── Reader images ────────────────────────────────────────────────────────────
const firstTenSectionImages = [
  'img/mostafa.jpg', 'img/abdoo.jpg', 'img/Sedeq.jpg', 'img/hosery.jpg', 'img/bana.jpg',
  'img/agmy1.jpg', 'img/sodes.jpg', 'img/moeqlyi.jpeg', 'img/unnamed.png', 'img/mshary.jpg',
];

// ─── Main Component ───────────────────────────────────────────────────────────
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
      .then((data) => setSurahData({ name: data.name, pdfs: data.pdfs, audio: data.audio }))
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
        <div className="mt-4 p-4 rounded-xl shadow-lg relative" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <button
            className="absolute top-4 left-4 text-white bg-red-500 hover:bg-red-600 w-9 h-9 rounded-full text-xl z-10 transition-colors flex items-center justify-center"
            onClick={closeSurah}
          >
            ✕
          </button>

          <h2 className="text-3xl font-bold text-center text-white mb-6">{surahData.name}</h2>

          {/* ── PDF Card with Enhanced Download Button ── */}
          <PdfCard
            surahData={surahData}
            setShowPdfModal={setShowPdfModal}
            onNotify={showNotification}
          />

          {/* ── قارئي التلاوات ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
            {firstTenSectionImages.map((image, index) => (
              <div
                key={index}
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
                  src={image}
                  alt={`قارئ ${index + 1}`}
                  className="w-full object-cover aspect-video"
                  loading="lazy"
                />
                {surahData.audio?.[index] && (
                  <div className="p-2">
                    <audio
                      controls
                      className="w-full"
                      ref={(el) => (audioRefs.current[index] = el)}
                      onPlay={() => handlePlay(index)}
                    >
                      <source src={surahData.audio[index]} type="audio/mpeg" />
                    </audio>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── زر فتح المصحف العائم ── */}
          {surahData.pdfs?.[0] && (
            <div className="fixed bottom-20 left-4 z-40">
              <button
                onClick={() => setShowPdfModal(true)}
                className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-gray-900 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
                title="فتح المصحف ملء الشاشة"
              >
                <BookOpen size={24} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Fullscreen PDF Modal ── */}
      <PdfModal
        surahData={surahData}
        showPdfModal={showPdfModal}
        setShowPdfModal={setShowPdfModal}
        onNotify={showNotification}
      />
    </div>
  );
};

export default Quran;
