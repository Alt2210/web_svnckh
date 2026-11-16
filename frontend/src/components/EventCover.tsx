import type { NetworkEvent } from '../types/domain';

const covers: Record<string, { file: string; alt: string; position?: string }> = {
  Workshop: { file: 'social-science-talk.jpg', alt: 'Diễn giả chia sẻ tại một tọa đàm khoa học' },
  Webinar: { file: 'vr-demonstration.jpg', alt: 'Người tham gia trải nghiệm thiết bị công nghệ thực tế ảo' },
  'Tọa đàm': { file: 'research-awards.jpg', alt: 'Các nhà nghiên cứu trẻ tại một chương trình trao giải' },
  'Hoạt động cộng đồng': { file: 'regional-event.jpg', alt: 'Đại biểu tham dự một chương trình khoa học thanh niên' },
  'Hội thảo': { file: 'national-project-award.jpg', alt: 'Đại diện chương trình tại một tọa đàm khoa học' },
  'Cuộc thi': { file: 'research-awards.jpg', alt: 'Các nhà nghiên cứu nhận khen thưởng tại sự kiện khoa học', position: 'center 35%' },
};

export function EventCover({ event, detail = false }: { event: Pick<NetworkEvent, 'category'>; detail?: boolean }) {
  const cover = covers[event.category] || covers['Hoạt động cộng đồng'];
  return <figure className={`event-cover${detail ? ' event-cover-detail' : ''}`}>
    <img src={`${import.meta.env.BASE_URL}assets/statement/${cover.file}`} alt={`Ảnh minh họa: ${cover.alt}`} loading={detail ? 'eager' : 'lazy'} decoding="async" style={{ objectPosition: cover.position }} />
    <figcaption><span>Ảnh minh họa</span><strong>{event.category}</strong></figcaption>
  </figure>;
}
