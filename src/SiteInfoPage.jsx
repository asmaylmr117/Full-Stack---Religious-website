const peopleRemembered = [
  { src: 'img/baba.jpg', label: 'والدي الغالي الحاج إسماعيل إبراهيم العناني' },
  { src: 'img/bro.jpg', label: 'أخي محمود إسماعيل العناني' },
  { src: 'img/hema.jpg', label: 'الأستاذ إبراهيم المأذون' },
];

const developerLinks = [
  { href: 'https://wa.me/+201066915691', label: 'واتساب', icon: 'fab fa-whatsapp', color: 'text-green-400 hover:text-green-300' },
  { href: 'https://www.facebook.com/mostafa.enani.71', label: 'فيسبوك', icon: 'fab fa-facebook', color: 'text-blue-400 hover:text-blue-300' },
  { href: 'https://t.me/asmaylmr', label: 'تيليجرام', icon: 'fab fa-telegram', color: 'text-cyan-400 hover:text-cyan-300' },
  { href: 'tel:+201066915691', label: 'اتصال هاتفي', icon: 'fas fa-phone', color: 'text-red-400 hover:text-red-300' },
];

const SiteInfoPage = ({ onBack }) => (
  <section className="site-info-page" dir="rtl">
    <div className="site-info-heading">
      <button className="site-info-back" onClick={onBack}>
        <span aria-hidden="true">→</span>
        العودة إلى القرآن
      </button>
      <p className="site-info-eyebrow">الطريق إلى الجنة</p>
      <h1>عن الموقع ومطوره</h1>
      <p className="site-info-intro">تعرف على رسالة الموقع وفريق العمل وراءه.</p>
    </div>

    <div className="site-info-grid">
      <article className="site-info-card">
        <div className="site-info-card-title">
          <span aria-hidden="true">🕌</span>
          <h2>عن الموقع</h2>
        </div>
        <p className="site-info-description">
          هذا موقع ديني يقدم القرآن الكريم كاملاً بأصوات نخبة من أفضل مشايخ التلاوة والتجويد، إلى جانب أذكار الصباح والمساء والأدعية. كما يتضمن مسبحة إلكترونية، ويُقدَّم كصدقة جارية على روح:
        </p>
        <div className="site-info-people">
          {peopleRemembered.map((person) => (
            <div className="site-info-person" key={person.label}>
              <img src={person.src} alt={person.label} loading="lazy" />
              <p>{person.label}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="site-info-card site-info-developer">
        <div className="site-info-card-title">
          <span aria-hidden="true">👨‍💻</span>
          <h2>مطور الموقع</h2>
        </div>
        <img
          className="site-info-developer-photo"
          src="img/mosta.jpg"
          alt="مطور الموقع، Mostafa Ismail Alanani"
          loading="lazy"
        />
        <h3>Eng : Mostafa Ismail Alanani</h3>
        <p className="site-info-description">للتواصل والاستفسارات، يمكنك استخدام إحدى الوسائل التالية:</p>
        <div className="site-info-contact-links">
          {developerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-label={link.label}
              title={link.label}
              target="_blank"
              rel="noopener noreferrer"
              className={link.color}
            >
              <i className={link.icon} aria-hidden="true"></i>
            </a>
          ))}
        </div>
      </article>
    </div>
  </section>
);

export default SiteInfoPage;
