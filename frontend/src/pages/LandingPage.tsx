import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useScrollMotion } from '../features/landing/useScrollMotion';
import { ActivityCarousel } from '../features/landing/ActivityCarousel';
import { SymbolIcon } from '../features/landing/SymbolIcon';
import { useAuth } from '../contexts/AuthContext';
import { navigate, useRoute } from '../lib/navigation';
import { readableError } from '../lib/errors';
const ClubApplicationDialog = lazy(() => import('../features/applications/ClubApplicationDialog'));

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

const statementPhotos = [
  { src: 'assets/statement/social-science-talk.jpg', alt: 'Diễn giả chia sẻ tại tọa đàm về nghiên cứu khoa học xã hội và nhân văn' },
  { src: 'assets/statement/national-project-award.jpg', alt: 'Đại diện chương trình trao biểu trưng tại tọa đàm về các công trình quốc gia' },
  { src: 'assets/statement/research-awards.jpg', alt: 'Các nhà nghiên cứu trẻ nhận khen thưởng trong một sự kiện khoa học' },
  { src: 'assets/statement/vr-demonstration.jpg', alt: 'Học sinh trải nghiệm thiết bị thực tế ảo tại hoạt động khoa học công nghệ' },
  { src: 'assets/statement/regional-event.jpg', alt: 'Đại biểu tham dự chương trình khoa học thanh niên khu vực miền Nam' },
];

const featuredActivities = [
  {
    id: 'knowledge-to-value',
    tag: 'ĐỐI THOẠI TÀI NĂNG TRẺ · 10.11.2026',
    title: 'Từ tri thức đến giá trị',
    text: 'Tọa đàm về thương mại hóa nghiên cứu, công nghệ sâu và khởi nghiệp sáng tạo.',
    mark: '01',
    image: 'assets/activities/toa-dam-tu-tri-thuc-den-gia-tri.jpg',
    imageAlt: 'Áp phích tọa đàm Từ tri thức đến giá trị, lúc 09h00 ngày 10 tháng 11 năm 2026 tại Đại học Bách khoa Hà Nội',
    details: ['09h00, ngày 10.11.2026', 'Phòng Hội thảo C2, Đại học Bách khoa Hà Nội'],
    source: 'https://tuoitre.vn/me-de-giong-doc-ai-review-phim-chia-se-cach-dua-nghien-cuu-khoa-hoc-ra-thi-truong-100261110193415365.htm',
  },
  {
    id: 'young-talent-national-projects',
    tag: 'TỌA ĐÀM KHOA HỌC · 10.11.2026',
    title: 'Tài năng trẻ với những đại công trình quốc gia',
    text: 'Tọa đàm về làm chủ công nghệ và những bài toán lớn dành cho nhà khoa học trẻ.',
    mark: '02',
    image: 'assets/activities/toa-dam-tai-nang-tre-dai-cong-trinh.jpg',
    imageAlt: 'Áp phích tọa đàm Tài năng trẻ với những đại công trình quốc gia, lúc 14h00 ngày 10 tháng 11 năm 2026 tại Trường Đại học Xây dựng Hà Nội',
    details: ['14h00, ngày 10.11.2026', 'Phòng 13H2, Trường Đại học Xây dựng Hà Nội'],
    source: 'https://tienphong.vn/tai-nang-tre-truoc-co-hoi-giai-nhung-bai-toan-lon-cua-dat-nuoc-post1893190.tpo',
  },
  {
    id: 'golden-globe-award-2026',
    tag: 'GIẢI THƯỞNG KHOA HỌC CÔNG NGHỆ · 2026',
    title: 'Giải thưởng Quả Cầu Vàng 2026',
    text: 'Tôn vinh tài năng trẻ có thành tích nổi bật trong nghiên cứu khoa học và phát triển công nghệ.',
    mark: '03',
    image: 'assets/activities/qcv-2026.jpg',
    imageAlt: 'Áp phích Giải thưởng Khoa học Công nghệ Quả Cầu Vàng năm 2026',
    details: ['Hạn đăng ký: 15.08.2026', 'qcv.tainangviet.vn'],
    source: 'https://qcv.tainangviet.vn/',
  },
  {
    id: 'female-science-award-2026',
    tag: 'GIẢI THƯỞNG NỮ SINH KHOA HỌC CÔNG NGHỆ · 2026',
    title: 'Giải thưởng Nữ sinh Khoa học Công nghệ Việt Nam',
    text: 'Ghi nhận và khuyến khích nữ sinh có thành tích tiêu biểu trong học tập, nghiên cứu khoa học và công nghệ.',
    mark: '04',
    image: 'assets/activities/female-science-award-2026.jpg',
    imageAlt: 'Áp phích Giải thưởng Nữ sinh Khoa học Công nghệ Việt Nam 2026',
    details: ['Hạn đăng ký: 15.08.2026', 'gtns.tainangviet.vn'],
    source: 'https://gtns.tainangviet.vn/',
  },
];

const activities = featuredActivities;

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
  return <span aria-hidden="true" className="arrow"><SymbolIcon glyph={diagonal ? '↗' : '→'} /></span>;
}

function NetworkArtwork() {
  return (
    <div className="network-art" aria-label="Minh họa các câu lạc bộ được kết nối trong một mạng lưới" role="img">
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <div className="art-orbit orbit-three" />
      <div className="art-scan" aria-hidden="true" />
      <svg className="art-lines" viewBox="0 0 560 560" fill="none" aria-hidden="true">
        <path d="M278 278 120 146M278 278 428 130M278 278 463 310M278 278 385 455M278 278 124 408M278 278 218 78M278 278 282 490" />
        <path d="M120 146 218 78M428 130 463 310M124 408 282 490" className="line-soft" />
      </svg>
      <span className="art-dot dot-main"><img src={`${import.meta.env.BASE_URL}assets/logo.svg`} alt="" /></span>
      <span className="art-dot dot-a"><i>CLB</i></span>
      <span className="art-dot dot-b"><i>SV</i></span>
      <span className="art-dot dot-c"><i>LIÊN<br />KẾT</i></span>
      <span className="art-dot dot-d"><i>CỘNG<br />HƯỞNG</i></span>
      <span className="art-dot dot-e"><i>LAN<br />TỎA</i></span>
      <span className="art-dot dot-f"><i><SymbolIcon glyph="+" /></i></span>
    </div>
  );
}

export default function LandingPage() {
  const auth = useAuth();
  const { session } = auth;
  const route = useRoute();
  const applicationOpen = new URLSearchParams(route.split('?')[1] || '').get('ho-so') === 'clb';
  const [accountError, setAccountError] = useState('');
  const openApplication = () => { setMenuOpen(false); navigate('/?ho-so=clb'); };
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
        <button type="button" className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-controls="temp-navigation" aria-expanded={menuOpen} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}>
          <span /><span />
        </button>
        <nav id="temp-navigation" className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Điều hướng chính">
          {navItems.map(([label, href]) => <a key={href} href={href} onClick={closeMenu}>{label}</a>)}
          {session ? <button className="landing-session-button" onClick={() => { void auth.signOut().catch((error) => setAccountError(readableError(error))); }}>Đăng xuất</button> : <a className="landing-login" href="#/dang-nhap" onClick={closeMenu}>Đăng nhập</a>}
          {auth.roles.includes('admin') && <a href="#/admin/ho-so" onClick={closeMenu}>Duyệt hồ sơ</a>}
          <button className="nav-cta landing-session-button" onClick={openApplication}>{session ? 'Hồ sơ CLB' : 'Nộp hồ sơ CLB'} <Arrow diagonal /></button>
        </nav>
      </header>

      <main id="top">
        <div className="hero-track" data-scene data-pinned>
        <section className="hero">
          <div className="hero-grain" />
          <div className="hero-copy" data-hero-panel="0">
            <p className="eyebrow"><span className="eyebrow-rule" /> MẠNG LƯỚI SINH VIÊN NGHIÊN CỨU KHOA HỌC</p>
            <h1><span className="hero-line"><span>Kết nối để</span></span><span className="hero-line"><em>nghiên cứu</em></span><span className="hero-line"><span>đi xa hơn.</span></span></h1>
            <p className="hero-desc">Một không gian chung để các câu lạc bộ sinh viên nghiên cứu khoa học gặp gỡ, chia sẻ và cùng tạo nên những giá trị mới.</p>
            <div className="hero-actions">
              <a className="button button-yellow" href="#mang-luoi">Khám phá Mạng lưới <Arrow diagonal /></a>
              <a className="text-link" href="#tham-gia">Dành cho CLB <Arrow /></a>
            </div>
          </div>
          <NetworkArtwork />
          <div className="hero-scene-copy" data-hero-panel="1"><span className="scene-label">02 / CỘNG ĐỒNG CÙNG TIẾN</span><h2>Đến vô vàn<br /><em>khả năng.</em></h2><p>Mỗi câu lạc bộ là một điểm sáng. Khi kết nối, những trải nghiệm riêng trở thành nguồn cảm hứng chung.</p><ul className="hero-facts"><li><b>Kết nối liên trường</b><span>Gặp gỡ những CLB có chung mối quan tâm.</span></li><li><b>Chia sẻ để phát triển</b><span>Cùng trao đổi kinh nghiệm và cách làm nghiên cứu.</span></li></ul></div>
          <div className="hero-scene-copy hero-scene-third" data-hero-panel="2"><span className="scene-label">03 / BẮT ĐẦU HÀNH TRÌNH</span><h2>Một hồ sơ.<br /><em>Một khởi đầu.</em></h2><p>Tìm hiểu Mạng lưới, chuẩn bị thông tin câu lạc bộ và theo dõi đợt tiếp nhận phù hợp.</p><ul className="hero-checklist"><li>Hồ sơ tổ chức và người đại diện</li><li>Minh chứng hoạt động nghiên cứu</li><li>Thẩm định và công nhận theo quy trình</li></ul><a className="button button-yellow" href="#tham-gia">Khám phá cách tham gia <Arrow diagonal /></a></div>
        </section>
        </div>

        <div className="kinetic-band" data-scene aria-hidden="true"><div className="kinetic-track">KẾT NỐI <i><SymbolIcon glyph="✳" /></i> NGHIÊN CỨU <i><SymbolIcon glyph="✳" /></i> CỘNG HƯỞNG <i><SymbolIcon glyph="✳" /></i> KẾT NỐI <i><SymbolIcon glyph="✳" /></i> NGHIÊN CỨU <i><SymbolIcon glyph="✳" /></i> CỘNG HƯỞNG <i><SymbolIcon glyph="✳" /></i></div></div>

        <section className="intro section-pad" id="mang-luoi">
          <div className="section-kicker" data-reveal><span>01</span><i /> VỀ MẠNG LƯỚI</div>
          <div className="intro-grid">
            <h2 className="intro-heading" data-reveal><span className="heading-line">Nghiên cứu tốt hơn</span><em className="heading-line"><span className="word-group">khi không</span>{' '}<span className="word-group">đi một mình.</span></em></h2>
            <div className="intro-body" data-reveal>
              <p className="intro-lead">Mạng lưới CLB Sinh viên Nghiên cứu Khoa học Toàn quốc kết nối các tổ chức sinh viên cùng quan tâm đến nghiên cứu, sáng tạo và học hỏi.</p>
              <p>Thông qua một không gian thông tin chung, các CLB có thể giới thiệu hoạt động, tìm kiếm kết nối và tham gia các chương trình của Mạng lưới. Mỗi kết nối mới góp phần làm cộng đồng nghiên cứu trẻ thêm vững vàng.</p>
              <a className="underlined-link" href="#hoat-dong">Khám phá các hoạt động <Arrow diagonal /></a>
            </div>
          </div>
          <div className="pillar-grid">
            {pillars.map((item, index) => <article className="pillar" data-reveal style={{ '--reveal-delay': `${index * 100}ms` } as CSSProperties} key={item.number}>
              <div className="pillar-top"><span>{item.number}</span><span className="pillar-icon"><SymbolIcon glyph={item.icon} /></span></div>
              <h3>{item.title}</h3><p>{item.text}</p>
            </article>)}
          </div>
        </section>

        <div className="statement-track" data-scene data-pinned>
        <section className="statement">
          <div className="statement-inner">
            <p className="eyebrow"><span className="eyebrow-rule" /> CỘNG ĐỒNG · TRI THỨC · TƯƠNG LAI</p>
            <p className="statement-line">{['Từ những ý tưởng', 'riêng lẻ đến một', 'cộng đồng cùng tiến.'].map((line, index) => <span className={`statement-fragment fragment-${index}`} key={line} style={{ '--line-index': index } as CSSProperties}>{line}</span>)}</p>
            <div className="statement-aside"><span className="statement-star"><SymbolIcon glyph="✳" /></span><p>Nơi hành trình nghiên cứu của mỗi CLB có thêm những người đồng hành.</p></div>
            <div className="statement-context"><span>KHÔNG CHỈ LÀ GẶP GỠ</span><p>Là chia sẻ cách làm, lắng nghe góc nhìn khác và cùng nuôi dưỡng tinh thần nghiên cứu dài hạn.</p></div>
          </div>
          <div className="statement-photos" aria-hidden="true">
            {statementPhotos.map((photo, index) => <figure className={`statement-photo statement-photo-${index + 1}`} key={photo.src}>
              <img src={`${import.meta.env.BASE_URL}${photo.src}`} alt="" loading="lazy" />
            </figure>)}
          </div>
          <div className="statement-ring ring-one" /><div className="statement-ring ring-two" />
          <span className="statement-large-star" aria-hidden="true"><SymbolIcon glyph="✳" /></span>
        </section>
        </div>

        <div className="activities-track">
        <section className="activities section-pad" id="hoat-dong">
          <div className="section-kicker"><span>02</span><i /> CÙNG NHAU HOẠT ĐỘNG</div>
          <div className="activities-heading"><h2>Một mạng lưới.<br /><em>Nhiều khả năng.</em></h2><p>Kết nối là điểm bắt đầu. Từ đó, các CLB cùng chia sẻ thông tin, khám phá cơ hội và tham gia những hoạt động chung.</p></div>
          <ActivityCarousel items={activities} />
        </section>
        </div>

        <section className="connection-story section-pad" data-scene>
          <div className="section-kicker" data-reveal><span><SymbolIcon glyph="↗" /></span><i /> TỪ KẾT NỐI ĐẾN ĐỒNG HÀNH</div>
          <div className="connection-story-layout">
            <div className="connection-story-heading"><span className="story-overline">MỖI CLB MỘT THẾ MẠNH</span><h2>Nhiều góc nhìn.<br /><em>Chung một<br />tinh thần.</em></h2><p>Không cần có cùng điểm xuất phát để có thể đồng hành trên hành trình nghiên cứu.</p></div>
            <div className="story-moments">
              <article className="story-moment" data-reveal><span>01 / GẶP GỠ</span><h3>Bắt đầu từ một mối quan tâm chung.</h3><p>Giới thiệu lĩnh vực, hướng nghiên cứu và hoạt động của CLB để tìm những người có thể trao đổi cùng mình.</p><div className="story-tags"><span>Liên trường</span><span>Đa lĩnh vực</span></div></article>
              <article className="story-moment" data-reveal><span>02 / TRAO ĐỔI</span><h3>Mang trải nghiệm của mình đến gần người khác.</h3><p>Từ cách tổ chức nhóm, xây dựng hoạt động đến bài học trong quá trình nghiên cứu: những điều nhỏ có thể giúp một CLB khác tiến thêm một bước.</p><div className="story-tags"><span>Kinh nghiệm thực tế</span><span>Học hỏi lẫn nhau</span></div></article>
              <article className="story-moment" data-reveal><span>03 / CÙNG TIẾN</span><h3>Nuôi dưỡng những kết nối lâu dài.</h3><p>Theo dõi hoạt động chung, duy trì trao đổi và cùng đề xuất những chương trình phù hợp với cộng đồng nghiên cứu trẻ.</p><div className="story-tags"><span>Hoạt động chung</span><span>Cộng đồng nghiên cứu</span></div></article>
            </div>
          </div>
        </section>

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
          <div className="join-preparation" data-reveal><div><span className="scene-label">CHUẨN BỊ TRƯỚC KHI BẮT ĐẦU</span><h3>Một hồ sơ rõ ràng.<br />Một hành trình thuận lợi hơn.</h3></div><ul><li><b>Thông tin tổ chức</b><span>Tên CLB, đơn vị chủ quản, lĩnh vực và người đại diện.</span></li><li><b>Dấu ấn hoạt động</b><span>Giới thiệu cơ cấu, hoạt động và minh chứng liên quan.</span></li><li><b>Theo dõi hướng dẫn</b><span>Thành phần hồ sơ và thời hạn được thông báo theo từng đợt.</span></li></ul></div>
          <div className="join-bottom"><p>Trước khi nộp, hãy xem kỹ thông báo về điều kiện, thành phần hồ sơ và thời gian tiếp nhận.</p><div className="join-actions"><button type="button" className="button button-yellow" onClick={openApplication}>Nộp hồ sơ câu lạc bộ <Arrow diagonal /></button><a className="button button-outline" href="#faq">Thông tin cần biết <Arrow diagonal /></a></div></div>
        </section>

        <section className="faq section-pad" id="faq">
          <div className="section-kicker"><span>04</span><i /> THÔNG TIN CẦN BIẾT</div>
          <div className="faq-layout"><h2 data-reveal>Một vài<br /><em>điều thường hỏi.</em></h2><div className="faq-list" data-reveal>
            {faqs.map((item, index) => <article className={`faq-item ${openFaq === index ? 'open' : ''}`} key={item.q}>
              <button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`} id={`faq-question-${index}`}><span>{item.q}</span><b aria-hidden="true"><SymbolIcon glyph={openFaq === index ? '−' : '+'} /></b></button>
              <div className="faq-answer" id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} aria-hidden={openFaq !== index}><div><p>{item.a}</p></div></div>
            </article>)}
          </div></div>
        </section>

        <section className="closing" data-scene>
          <div className="closing-orbit" />
          <p className="eyebrow"><span className="eyebrow-rule" /> MỖI KẾT NỐI ĐỀU MỞ RA MỘT HƯỚNG ĐI</p>
          <h2 data-reveal>Cùng đưa nghiên cứu<br /><em>trẻ tiến xa hơn.</em></h2>
          <a className="button button-dark" href="#tham-gia">Tìm hiểu về Mạng lưới <Arrow diagonal /></a>
          <span className="closing-star"><SymbolIcon glyph="✳" /></span>
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
      {accountError && <div className="auth-callback-notice" role="alert"><p>{accountError}</p><button onClick={() => setAccountError('')} aria-label="Đóng thông báo">×</button></div>}
      {applicationOpen && <Suspense fallback={null}><ClubApplicationDialog onClose={() => navigate('/', true)} /></Suspense>}
    </div>
  );
}
