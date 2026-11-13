import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useScrollMotion } from './useScrollMotion';

const navItems = [
  ['Mạng lưới', '#mang-luoi'],
  ['Hoạt động', '#hoat-dong'],
  ['Tham gia', '#tham-gia'],
] as const;

const pillars = [
  {
    number: '01',
    title: 'Kết nối các CLB',
    text: 'Đưa những câu lạc bộ sinh viên nghiên cứu khoa học ở nhiều trường đến gần nhau hơn.',
    icon: '↗',
  },
  {
    number: '02',
    title: 'Cùng phát triển',
    text: 'Tạo không gian để các tổ chức chia sẻ hoạt động, kinh nghiệm và những cơ hội hợp tác.',
    icon: '✳',
  },
  {
    number: '03',
    title: 'Lan tỏa nghiên cứu',
    text: 'Khuyến khích tinh thần tìm tòi, sáng tạo và đóng góp của sinh viên trên phạm vi toàn quốc.',
    icon: '◎',
  },
];

const stages = [
  ['01', 'Tìm hiểu', 'Đọc thông tin, điều kiện và hướng dẫn dành cho tổ chức muốn tham gia.'],
  ['02', 'Chuẩn bị hồ sơ', 'CLB cung cấp thông tin tổ chức và các minh chứng theo đợt tiếp nhận.'],
  ['03', 'Thẩm định', 'Hồ sơ được tiếp nhận, xem xét và có thể được yêu cầu bổ sung thông tin.'],
  ['04', 'Công nhận', 'Quyết định được ghi nhận theo thẩm quyền và thông tin trạng thái được cập nhật.'],
];

const activities = [
  {
    tag: 'KẾT NỐI',
    title: 'Gặp gỡ những người cùng mối quan tâm',
    text: 'Khám phá các câu lạc bộ và hoạt động nghiên cứu của sinh viên ở nhiều trường.',
    mark: 'N',
  },
  {
    tag: 'CHIA SẺ',
    title: 'Mở rộng cơ hội học hỏi và hợp tác',
    text: 'Cùng trao đổi kinh nghiệm, kết nối nguồn lực và đề xuất hoạt động chung.',
    mark: '↗',
  },
  {
    tag: 'THAM GIA',
    title: 'Theo dõi thông tin từ Mạng lưới',
    text: 'Cập nhật thông báo, chương trình và các sự kiện dành cho cộng đồng thành viên.',
    mark: '✳',
  },
];

const faqs = [
  {
    q: 'Ai có thể đăng ký tham gia Mạng lưới?',
    a: 'Các câu lạc bộ, đội hoặc nhóm sinh viên nghiên cứu khoa học có thể tìm hiểu điều kiện và nộp hồ sơ theo đợt tiếp nhận được thông báo.',
  },
  {
    q: 'Gửi hồ sơ có đồng nghĩa với việc đã trở thành thành viên không?',
    a: 'Không. Hồ sơ cần được tiếp nhận, thẩm định và phê duyệt theo quy trình. Tổ chức chỉ trở thành thành viên Mạng lưới sau khi được công nhận.',
  },
  {
    q: 'Tôi có thể cập nhật thông tin đăng ký ở đâu?',
    a: 'Hãy theo dõi hướng dẫn và thông báo chính thức của Mạng lưới để biết kênh tiếp nhận hồ sơ và cách bổ sung thông tin.',
  },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className="arrow">{diagonal ? '↗' : '→'}</span>;
}

function NetworkArtwork() {
  return (
    <div className="network-art" aria-label="Minh họa các câu lạc bộ được kết nối trong một mạng lưới" role="img">
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <div className="art-orbit orbit-three" />
      <div className="art-scan" aria-hidden="true" />
      <div className="art-cross cross-one" aria-hidden="true">+</div>
      <div className="art-cross cross-two" aria-hidden="true">+</div>
      <svg className="art-lines" viewBox="0 0 560 560" fill="none" aria-hidden="true">
        <path d="M278 278 120 146M278 278 428 130M278 278 463 310M278 278 385 455M278 278 124 408M278 278 218 78M278 278 282 490" />
        <path d="M120 146 218 78M428 130 463 310M124 408 282 490" className="line-soft" />
      </svg>
      <span className="art-dot dot-main"><img src={`${import.meta.env.BASE_URL}assets/logo.svg`} alt="" /></span>
      <span className="art-dot dot-a"><i>CLB</i></span>
      <span className="art-dot dot-b"><i>SV</i></span>
      <span className="art-dot dot-c"><i>01</i></span>
      <span className="art-dot dot-d"><i>02</i></span>
      <span className="art-dot dot-e"><i>03</i></span>
      <span className="art-dot dot-f"><i>+</i></span>
      <span className="art-caption caption-top">KẾT NỐI TRI THỨC</span>
      <span className="art-caption caption-bottom">TỪNG CLB · CHUNG MỘT MẠNG LƯỚI</span>
      <span className="art-axis" aria-hidden="true">01 / LIÊN KẾT<br />02 / CỘNG HƯỞNG<br />03 / LAN TỎA</span>
      <div className="art-note"><span className="live-dot" /> Mạng lưới mở rộng từ những kết nối đầu tiên</div>
    </div>
  );
}

export default function App() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  useScrollMotion(pageRef);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="temp-experience" ref={pageRef}>
      <a className="skip-link" href="#mang-luoi">Đến nội dung chính</a>
      <div className="reading-progress" aria-hidden="true"><span /></div>
      <header className="site-header">
        <a className="brand" href="#top" onClick={closeMenu} aria-label="SVNCKH-NET, về đầu trang">
          <img src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="" />
          <span className="brand-name"><b>SVNCKH</b><small>NETWORK</small></span>
        </a>
        <button className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}>
          <span /><span />
        </button>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Điều hướng chính">
          {navItems.map(([label, href]) => <a key={href} href={href} onClick={closeMenu}>{label}</a>)}
          <a className="nav-cta" href="#tham-gia" onClick={closeMenu}>Tìm hiểu cách tham gia <Arrow diagonal /></a>
        </nav>
      </header>

      <main id="top">
        <div className="hero-track" data-scene data-pinned>
        <section className="hero">
          <div className="hero-grain" />
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-rule" /> MẠNG LƯỚI SINH VIÊN NGHIÊN CỨU KHOA HỌC</p>
            <h1><span className="hero-line"><span>Kết nối để</span></span><span className="hero-line"><em>nghiên cứu</em></span><span className="hero-line"><span>đi xa hơn.</span></span></h1>
            <p className="hero-desc">Một không gian chung để các câu lạc bộ sinh viên nghiên cứu khoa học gặp gỡ, chia sẻ và cùng tạo nên những giá trị mới.</p>
            <div className="hero-actions">
              <a className="button button-yellow" href="#mang-luoi">Khám phá Mạng lưới <Arrow diagonal /></a>
              <a className="text-link" href="#tham-gia">Dành cho CLB <Arrow /></a>
            </div>
            <div className="hero-footnote"><span className="footnote-mark">✳</span><span>Kết nối câu lạc bộ<br />Lan tỏa tinh thần nghiên cứu</span></div>
          </div>
          <NetworkArtwork />
          <div className="hero-scene-copy"><span className="scene-label">TỪ MỘT KẾT NỐI</span><h2>Đến vô vàn<br /><em>khả năng.</em></h2><p>Mỗi câu lạc bộ là một điểm sáng.<br />Cùng nhau, ta tạo nên một mạng lưới.</p></div>
          <div className="hero-index"><a href="#mang-luoi" className="scroll-cue"><span className="scroll-cue-line" />CUỘN ĐỂ KHÁM PHÁ ↓</a><span>SVNCKH / KẾT NỐI KHÔNG GIỚI HẠN</span></div>
        </section>
        </div>

        <div className="kinetic-band" data-scene aria-hidden="true"><div className="kinetic-track">KẾT NỐI <i>✳</i> NGHIÊN CỨU <i>✳</i> CỘNG HƯỞNG <i>✳</i> KẾT NỐI <i>✳</i> NGHIÊN CỨU <i>✳</i> CỘNG HƯỞNG <i>✳</i></div></div>

        <section className="intro section-pad" id="mang-luoi">
          <div className="section-kicker" data-reveal><span>01</span><i /> VỀ MẠNG LƯỚI<span className="kicker-end">NHỮNG KẾT NỐI CÓ Ý NGHĨA ↗</span></div>
          <div className="intro-grid">
            <h2 data-reveal>Nghiên cứu tốt hơn<br />khi <em>không đi một mình.</em></h2>
            <div className="intro-body" data-reveal>
              <p className="intro-lead">Mạng lưới CLB Sinh viên Nghiên cứu Khoa học Toàn quốc kết nối các tổ chức sinh viên cùng quan tâm đến nghiên cứu, sáng tạo và học hỏi.</p>
              <p>Thông qua một không gian thông tin chung, các CLB có thể giới thiệu hoạt động, tìm kiếm kết nối và tham gia các chương trình của Mạng lưới. Mỗi kết nối mới góp phần làm cộng đồng nghiên cứu trẻ thêm vững vàng.</p>
              <a className="underlined-link" href="#hoat-dong">Khám phá các hoạt động <Arrow diagonal /></a>
            </div>
          </div>
          <div className="pillar-grid">
            {pillars.map((item, index) => <article className="pillar" data-reveal style={{ '--reveal-delay': `${index * 100}ms` } as CSSProperties} key={item.number}>
              <div className="pillar-top"><span>{item.number}</span><span className="pillar-icon">{item.icon}</span></div>
              <h3>{item.title}</h3><p>{item.text}</p>
            </article>)}
          </div>
        </section>

        <div className="statement-track" data-scene data-pinned>
        <section className="statement">
          <div className="statement-inner">
            <p className="eyebrow"><span className="eyebrow-rule" /> CỘNG ĐỒNG · TRI THỨC · TƯƠNG LAI</p>
            <p className="statement-line">{['Từ những ý tưởng', 'riêng lẻ đến một', 'cộng đồng cùng tiến.'].map((line, index) => <span className={`statement-fragment fragment-${index}`} key={line} style={{ '--line-index': index } as CSSProperties}>{line}</span>)}</p>
            <div className="statement-aside"><span className="statement-star">✳</span><p>Nơi hành trình nghiên cứu của mỗi CLB có thêm những người đồng hành.</p></div>
          </div>
          <div className="statement-ring ring-one" /><div className="statement-ring ring-two" />
          <span className="statement-label">SVNCKH-NET / 2026</span>
          <span className="statement-large-star" aria-hidden="true">✳</span>
        </section>
        </div>

        <div className="activities-track" data-scene data-pinned>
        <section className="activities section-pad" id="hoat-dong">
          <div className="section-kicker"><span>02</span><i /> CÙNG NHAU HOẠT ĐỘNG<span className="kicker-end">CUỘN ĐỂ KẾT NỐI →</span></div>
          <div className="activities-heading"><h2>Một mạng lưới.<br /><em>Nhiều khả năng.</em></h2><p>Kết nối là điểm bắt đầu. Từ đó, các CLB cùng chia sẻ thông tin, khám phá cơ hội và tham gia những hoạt động chung.</p></div>
          <div className="activity-grid">
            {activities.map((item, index) => <article className={`activity-card activity-${index + 1}`} key={item.tag}>
              <div className="activity-art"><span className="activity-art-index">0{index + 1} / 03</span><span className="activity-art-mark">{item.mark}</span><span className="activity-art-label">{item.tag}</span></div>
              <div className="activity-card-copy"><span className="card-tag">{item.tag}</span><h3>{item.title}</h3><p>{item.text}</p><a href="#tham-gia" aria-label={`Tìm hiểu về ${item.tag.toLowerCase()}`}><Arrow diagonal /></a></div>
            </article>)}
          </div>
          <div className="activity-progress" aria-hidden="true"><span>KHÁM PHÁ CÁC KHẢ NĂNG</span><i><b /></i><span>01 — 03</span></div>
        </section>
        </div>

        <section className="join-section" id="tham-gia" data-scene>
          <div className="join-top">
            <div className="section-kicker light-kicker"><span>03</span><i /> DÀNH CHO CÂU LẠC BỘ</div>
            <h2 data-reveal>Tham gia Mạng lưới<br /><em>bắt đầu từ đâu?</em></h2>
            <p className="join-intro">Quy trình được tổ chức theo từng đợt để thông tin rõ ràng, hồ sơ được xem xét và trạng thái được theo dõi.</p>
          </div>
          <div className="steps">
            {stages.map(([number, title, text], index) => <article className="step" data-reveal style={{ '--reveal-delay': `${index * 110}ms` } as CSSProperties} key={number}>
              <div className="step-top"><span>{number}</span>{index < stages.length - 1 && <i />}</div>
              <h3>{title}</h3><p>{text}</p>
            </article>)}
          </div>
          <div className="join-bottom"><p>Trước khi nộp, hãy xem kỹ thông báo về điều kiện, thành phần hồ sơ và thời gian tiếp nhận.</p><a className="button button-yellow" href="#faq">Xem thông tin cần biết <Arrow diagonal /></a></div>
        </section>

        <section className="faq section-pad" id="faq">
          <div className="section-kicker"><span>04</span><i /> THÔNG TIN CẦN BIẾT</div>
          <div className="faq-layout"><h2 data-reveal>Một vài<br /><em>điều thường hỏi.</em></h2><div className="faq-list" data-reveal>
            {faqs.map((item, index) => <article className={`faq-item ${openFaq === index ? 'open' : ''}`} key={item.q}>
              <button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`} id={`faq-question-${index}`}><span>{item.q}</span><b aria-hidden="true">{openFaq === index ? '−' : '+'}</b></button>
              <div className="faq-answer" id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} aria-hidden={openFaq !== index}><div><p>{item.a}</p></div></div>
            </article>)}
          </div></div>
        </section>

        <section className="closing" data-scene>
          <div className="closing-orbit" />
          <p className="eyebrow"><span className="eyebrow-rule" /> MỖI KẾT NỐI ĐỀU MỞ RA MỘT HƯỚNG ĐI</p>
          <h2 data-reveal>Cùng đưa nghiên cứu<br /><em>trẻ tiến xa hơn.</em></h2>
          <a className="button button-dark" href="#tham-gia">Tìm hiểu về Mạng lưới <Arrow diagonal /></a>
          <span className="closing-star">✳</span>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-main">
          <a className="brand brand-footer" href="#top"><img src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="" /><span className="brand-name"><b>SVNCKH</b><small>NETWORK</small></span></a>
          <p className="footer-manifesto">Kết nối cộng đồng<br />nghiên cứu trẻ Việt Nam.</p>
          <div className="footer-nav"><span>KHÁM PHÁ</span><a href="#mang-luoi">Về Mạng lưới</a><a href="#hoat-dong">Hoạt động</a><a href="#tham-gia">Cách tham gia</a></div>
          <div className="footer-contact"><span>KẾT NỐI VỚI CHÚNG TÔI</span><a href="#tham-gia">Tìm hiểu về cách tham gia <Arrow diagonal /></a><small>Theo dõi thông báo chính thức của Mạng lưới.</small></div>
        </div>
        <div className="footer-bottom"><span>© SVNCKH-NET</span><span>Mạng lưới CLB Sinh viên Nghiên cứu Khoa học Toàn quốc</span><a href="#top">Lên đầu trang ↑</a></div>
      </footer>
    </div>
  );
}
