import React, { useState, useEffect } from 'react';
import './App.css';
import Quran from './Quran';
import Azkar from './Azkar';
import Misbaha from './Misbaha';
import Sidebar from './Sidebar';
import SiteInfoPage from './SiteInfoPage';
import KnowledgeLibrary from './KnowledgeLibrary';
import backgroundImage from '/img/photo.jpg';

// ─── PWA Install Banner ───────────────────────────────────────────────────────
const PwaInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="pwa-banner w-full flex items-center justify-between px-3 py-2 text-white">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => setShowBanner(false)}
          className="text-gray-400 hover:text-white transition-colors text-base p-1"
          aria-label="إغلاق"
        >✕</button>
        <span className="text-xl flex-shrink-0">📲</span>
        <div className="min-w-0">
          <div className="font-bold text-xs sm:text-sm truncate">ثبّت التطبيق</div>
          <div className="text-[11px] text-gray-300 truncate hidden xs:block">استخدم الموقع كتطبيق أصلي</div>
        </div>
      </div>
      <button
        onClick={handleInstall}
        className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap shadow-sm flex-shrink-0"
      >ثبّت الآن</button>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
const App = () => {
  const [activeSection, setActiveSection] = useState('quran');
  const [activeSurahIndex, setActiveSurahIndex] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeAzkarContent, setActiveAzkarContent] = useState(null);

  const [count, setCount] = useState(() => {
    try {
      const saved = localStorage.getItem('misbaha_count');
      return saved !== null ? parseInt(saved, 10) : 0;
    } catch { return 0; }
  });

  useEffect(() => {
    try { localStorage.setItem('misbaha_count', count); } catch { }
  }, [count]);

  const navigateToSection = (section) => {
    setActiveSection(section);
    setActiveSurahIndex(null);
    setActiveAzkarContent(null);
    setIsSidebarOpen(false);
  };

  const showSurah = (index) => setActiveSurahIndex(index);
  const closeSurah = () => setActiveSurahIndex(null);
  const toggleSidebar = () => setIsSidebarOpen((isOpen) => !isOpen);
  const closeWindow = () => window.open('about:blank', '_self').close();

  const handleAzkarClick = (section) => setActiveAzkarContent(section);
  const handleBackToAzkar = () => setActiveAzkarContent(null);
  const handleClick = () => setCount((c) => c + 1);
  const handleReset = () => setCount(0);

  // ── Hamburger Button ──────────────────────────────────────────────────────
  const HamburgerIcon = () => (
    <button
      className="hamburger-btn"
      onClick={toggleSidebar}
      aria-label="القائمة"
      aria-expanded={isSidebarOpen}
      aria-controls="site-sidebar"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );

  return (
    <div dir="rtl" className="background-image min-h-screen" style={{ backgroundImage: `url(${backgroundImage})` }}>

      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <header className="nav-header">
        <div className="nav-inner">

          <div className="nav-mobile">
            <div className="nav-mobile-brand flex items-center gap-2">
              <HamburgerIcon />
              <a href="#" className="nav-brand">الطريق إلى الجنة</a>
            </div>
            <nav className="nav-mobile-sections flex items-center gap-1" aria-label="التنقل الرئيسي">
              <button className={`nav-btn text-xs ${activeSection === 'quran' ? 'nav-btn-active' : ''}`} onClick={() => navigateToSection('quran')} aria-pressed={activeSection === 'quran'}>القرآن</button>
              <button className={`nav-btn text-xs ${activeSection === 'azkar' ? 'nav-btn-active' : ''}`} onClick={() => navigateToSection('azkar')} aria-pressed={activeSection === 'azkar'}>الأذكار</button>
              <button className={`nav-btn text-xs ${activeSection === 'misbaha' ? 'nav-btn-active' : ''}`} onClick={() => navigateToSection('misbaha')} aria-label="المسبحة الإلكترونية" title="المسبحة الإلكترونية" aria-pressed={activeSection === 'misbaha'}>المسبحة</button>
            </nav>
          </div>

          <div className="nav-desktop">
            <div className="nav-desktop-brand-group">
              <img className="nav-mosque-icon" src="./mosque-svgrepo-com.svg" alt="شعار الموقع" />
              <a href="#" className="nav-brand nav-desktop-brand">الطريق إلى الجنة</a>
            </div>
            <nav className="nav-desktop-links" aria-label="التنقل الرئيسي">
              <button className={`nav-btn ${activeSection === 'quran' ? 'nav-btn-active' : ''}`} onClick={() => navigateToSection('quran')} aria-pressed={activeSection === 'quran'}>
                <span className="hidden lg:inline">القرآن الكريم</span><span className="lg:hidden">القرآن</span>
              </button>
              <button className={`nav-btn ${activeSection === 'azkar' ? 'nav-btn-active' : ''}`} onClick={() => navigateToSection('azkar')} aria-pressed={activeSection === 'azkar'}>الأذكار</button>
              <button className={`nav-btn ${activeSection === 'misbaha' ? 'nav-btn-active' : ''}`} onClick={() => navigateToSection('misbaha')} aria-pressed={activeSection === 'misbaha'}>
                <span className="hidden lg:inline">المسبحة الإلكترونية</span><span className="lg:hidden">المسبحة</span>
              </button>
              <button className={`nav-btn ${activeSection === 'siteInfo' ? 'nav-btn-active' : ''}`} onClick={() => navigateToSection('siteInfo')} aria-pressed={activeSection === 'siteInfo'}>
                <span className="hidden lg:inline">عن الموقع ومطوره</span><span className="lg:hidden">عن الموقع</span>
              </button>
              <button className={`nav-btn ${activeSection === 'hadiths' ? 'nav-btn-active' : ''}`} onClick={() => navigateToSection('hadiths')} aria-pressed={activeSection === 'hadiths'}>
                <span className="hidden lg:inline">الأحاديث النبوية</span><span className="lg:hidden">الأحاديث</span>
              </button>
            </nav>
            <div className="nav-desktop-spacer" aria-hidden="true" />
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          PWA BANNER 
      ══════════════════════════════════════ */}
      <PwaInstallBanner />

      {/* ══════════════════════════════════════
          MAIN
      ══════════════════════════════════════ */}
      <main className="container mx-auto p-4 max-w-screen-2xl">
        {isSidebarOpen && (
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            activeSection={activeSection}
            onNavigate={navigateToSection}
            onOpenSiteInfo={() => navigateToSection('siteInfo')}
            closeWindow={closeWindow}
          />
        )}

        {activeSection === 'quran' && (
          <Quran activeSurahIndex={activeSurahIndex} showSurah={showSurah} closeSurah={closeSurah} />
        )}
        {activeSection === 'azkar' && (
          <Azkar activeAzkarContent={activeAzkarContent} handleAzkarClick={handleAzkarClick} handleBackToAzkar={handleBackToAzkar} />
        )}
        {activeSection === 'misbaha' && (
          <Misbaha count={count} handleClick={handleClick} handleReset={handleReset} />
        )}
        {activeSection === 'siteInfo' && (
          <SiteInfoPage onBack={() => navigateToSection('quran')} />
        )}
        {activeSection === 'hadiths' && (
          <KnowledgeLibrary />
        )}
      </main>
    </div>
  );
};

export default App;
