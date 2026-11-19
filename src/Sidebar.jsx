const sections = [
  { id: 'misbaha', label: 'المسبحة الإلكترونية', icon: '📿' },
  { id: 'hadiths', label: 'أحاديث نبوية', icon: 'ﷺ' },
];

const Sidebar = ({ isSidebarOpen, toggleSidebar, activeSection, onNavigate, onOpenSiteInfo, closeWindow }) => (
  <>
    {isSidebarOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
        onClick={toggleSidebar}
      />
    )}

    <aside
      id="site-sidebar"
      dir="rtl"
      className={`sidebar md:hidden fixed top-0 right-0 h-screen w-80 z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      aria-label="قائمة الموقع"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-white border-opacity-10">
        <h2 className="text-yellow-400 font-bold text-lg tracking-wide">القائمة</h2>
        <button
          className="text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-10 w-9 h-9 rounded-full flex items-center justify-center transition-all text-xl"
          onClick={toggleSidebar}
          aria-label="إغلاق القائمة"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1" aria-label="أقسام الموقع">
        <p className="sidebar-section-title">المزيد من الموقع</p>
        {sections.map((section) => (
          <button
            key={section.id}
            className={`sidebar-item w-full text-right ${activeSection === section.id ? 'sidebar-item-active' : 'text-white'}`}
            onClick={() => onNavigate(section.id)}
            aria-current={activeSection === section.id ? 'page' : undefined}
          >
            <span className="text-lg" aria-hidden="true">{section.icon}</span>
            <span>{section.label}</span>
          </button>
        ))}

        <div className="sidebar-divider" />

        <button
          className={`sidebar-item w-full text-right ${activeSection === 'siteInfo' ? 'sidebar-item-active' : 'text-white'}`}
          onClick={onOpenSiteInfo}
          aria-current={activeSection === 'siteInfo' ? 'page' : undefined}
        >
          <span className="text-lg" aria-hidden="true">🕌</span>
          <span>عن الموقع ومطوره</span>
        </button>
      </nav>

      <div className="px-4 pb-6 pt-3 border-t border-white border-opacity-10">
        
      </div>
    </aside>
  </>
);

export default Sidebar;
