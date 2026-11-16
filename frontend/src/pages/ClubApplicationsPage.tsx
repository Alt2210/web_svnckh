import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { listMyClubs } from '../services/clubs.service';
import { PortalLayout, Notice } from '../components/PortalLayout';
import { StatusBadge } from '../components/StatusBadge';
import { ClubApplicationForm } from '../features/applications/ClubApplicationForm';

export default function ClubApplicationsPage() {
  const auth = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const query = useAsyncData(() => listMyClubs(auth.session!.user.id), auth.session!.user.id);
  const back = () => { setSelected(null); query.reload(); };
  return <PortalLayout title="Hồ sơ câu lạc bộ" subtitle="Nộp hồ sơ, bổ sung minh chứng và theo dõi kết quả tại đây."><section className="p-card application-page-body">{selected !== null ? <ClubApplicationForm key={selected} initialId={selected || undefined} onBack={back} /> : <>
      <p>Khai báo thông tin, đính kèm minh chứng và gửi hồ sơ. Kết quả và yêu cầu bổ sung sẽ được lưu trong từng hồ sơ.</p>
      <div className="page-actions"><button className="p-btn" onClick={() => setSelected('')}><Plus size={17} />Nộp hồ sơ mới</button><button className="text-button" onClick={query.reload} disabled={query.loading}>Cập nhật</button></div>
      {query.error && <Notice tone="error">{query.error}</Notice>}{query.loading ? <p role="status">Đang tải hồ sơ…</p> : query.data?.length ? <div className="application-picker">{query.data.map((club) => <button key={club.id} onClick={() => setSelected(club.id)}><span><strong>{club.name}</strong><small>{club.university}</small></span><StatusBadge status={club.membership} /><span aria-hidden="true">→</span></button>)}</div> : !query.error && <div className="empty-state"><h3>Bắt đầu với câu lạc bộ của bạn</h3><p>Hồ sơ đã lưu và đã gửi sẽ xuất hiện ở đây.</p></div>}
    </>}</section></PortalLayout>;
}
