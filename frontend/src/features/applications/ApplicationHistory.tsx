import { useState } from 'react';
import { Notice } from '../../components/PortalLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { useAsyncData } from '../../hooks/useAsyncData';
import { loadApplicationHistory } from '../../services/clubs.service';
import { dateLabel, statusLabels, type Application } from '../../types/domain';

export function ApplicationHistory({ application }: { application: Application }) {
  const [expanded, setExpanded] = useState(false);
  const result = useAsyncData(() => loadApplicationHistory(application.id), `${application.id}:${application.status}:${application.version}`);
  return <section className="p-card"><div className="section-toolbar"><div><h2>Hồ sơ {application.code}</h2><p>Nộp lúc {dateLabel(application.submitted_at)} · Phiên bản {application.version}</p></div><StatusBadge status={application.status} /></div>{result.error && <Notice tone="error">{result.error}</Notice>}<ol className="history-list">{result.data?.events.map((event) => <li key={event.id}><span>{statusLabels[event.status] || event.status}</span><p>{event.note}</p>{event.deadline && <strong>Hạn bổ sung: {dateLabel(event.deadline)}</strong>}<small>{dateLabel(event.created_at)}</small></li>)}</ol><button className="text-button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? 'Ẩn phiên bản đã nộp' : 'Xem các phiên bản đã nộp'}</button>{expanded && <div className="version-list">{result.data?.versions.map((version) => <details key={version.id}><summary>Phiên bản {version.version} · {dateLabel(version.created_at)}</summary><dl><dt>Tên CLB</dt><dd>{version.snapshot.club.name}</dd><dt>Đơn vị chủ quản</dt><dd>{version.snapshot.club.university}</dd><dt>Lĩnh vực</dt><dd>{version.snapshot.club.field}</dd><dt>Giới thiệu</dt><dd>{version.snapshot.club.description}</dd><dt>Tệp tại thời điểm nộp</dt><dd>{version.snapshot.documents.map((d) => d.file_name).join(', ')}</dd></dl></details>)}</div>}</section>;
}
