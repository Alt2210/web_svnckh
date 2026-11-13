
export function NewsSection() {
  return (
<section className={"news-section"} id={"tin-tuc"}>
<div className={"max-w-7xl mx-auto px-gutter-mobile lg:px-gutter"}>
<div className={"section-eyebrow"}>{" BẢN TIN MẠNG LƯỚI "}</div>
<h2 className={"font-headline-xl text-headline-xl-mobile md:text-headline-xl text-deep-navy-anchor"}>{" Thông tin & hướng dẫn "}</h2>
<p className={"news-intro"}>{" Những điều cần biết trước khi câu lạc bộ của bạn tham gia Mạng lưới. "}</p>
<div className={"news-grid"}>
<article>
<span>{" 01 / GIA NHẬP "}</span>
<h3>{" Chuẩn bị hồ sơ câu lạc bộ "}</h3>
<p>{" Tìm hiểu các bước khai báo, nộp minh chứng và theo dõi kết quả thẩm định. "}</p>
<a href={"#quy-trinh"}>{" Xem quy trình ↗ "}</a>
</article>
<article>
<span>{" 02 / THÀNH VIÊN "}</span>
<h3>{" Tư cách thành viên chính thức "}</h3>
<p>{" Hồ sơ CLB và tư cách thành viên là hai thông tin độc lập. Công nhận cần quyết định phê duyệt. "}</p>
<a href={"#quyen-loi"}>{" Tìm hiểu quyền lợi ↗ "}</a>
</article>
<article>
<span>{" 03 / KẾT NỐI "}</span>
<h3>{" Cùng phát triển nghiên cứu trẻ "}</h3>
<p>{" Khám phá hoạt động học thuật, hội thảo và cơ hội giao lưu giữa các câu lạc bộ. "}</p>
<a href={"#hoat-dong-su-kien"}>{" Khám phá hoạt động ↗ "}</a>
</article>
</div>
</div>
</section>
  );
}
