import { statusLabels } from '../types/domain';
export function StatusBadge({ status }: { status: string }) { return <span className={`status-badge status-${status}`}>{statusLabels[status] || status}</span>; }
