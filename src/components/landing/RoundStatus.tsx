import { useEffect, useState } from 'react';
import { sampleRound } from '../../data/recruitment';

export function RoundStatus() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const ended = now >= sampleRound.closesAt;
  const upcoming = now < sampleRound.opensAt;
  const remaining = Math.max(0, (upcoming ? sampleRound.opensAt : sampleRound.closesAt) - now);
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor(remaining / 3600000) % 24;
  const minutes = Math.floor(remaining / 60000) % 60;
  return (
    <div id="round-countdown" className="border border-cyan-core/30 bg-deep-navy-anchor/70">
      <div className="round-emblem" aria-hidden="true">◷</div>
      <p data-round-label>{ended ? 'ĐỢT TUYỂN MẪU ĐÃ KẾT THÚC' : upcoming ? 'THỜI GIAN ĐẾN NGÀY MỞ CỔNG' : 'THỜI GIAN NHẬN HỒ SƠ CÒN LẠI'}</p>
      <p data-round-value>{ended ? sampleRound.closeDateLabel : `${days} ngày · ${hours} giờ · ${minutes} phút`}</p>
      <p data-round-note>{ended ? 'Thông tin đợt tiếp theo sẽ được công bố sau khi xác nhận.' : 'Lịch minh họa theo thiết kế mẫu, chưa phải thông báo tuyển chính thức.'}</p>
      <div className="round-footnote">Lịch và số liệu trong thiết kế gốc là nội dung minh họa.</div>
    </div>
  );
}
