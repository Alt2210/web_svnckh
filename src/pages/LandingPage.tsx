import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { DetailDialog } from '../components/common/DetailDialog';
import { HeroSection } from '../components/landing/HeroSection';
import { MetricsSection } from '../components/landing/MetricsSection';
import { AboutSection } from '../components/landing/AboutSection';
import { ProcessSection } from '../components/landing/ProcessSection';
import { RecruitmentSection } from '../components/landing/RecruitmentSection';
import { BenefitsSection } from '../components/landing/BenefitsSection';
import { ClubDirectory } from '../components/landing/ClubDirectory';
import { EventsSection } from '../components/landing/EventsSection';
import { NewsSection } from '../components/landing/NewsSection';
import { CallToAction } from '../components/landing/CallToAction';
import { useClubSearch } from '../hooks/useClubSearch';
import { useLandingActions } from '../hooks/useLandingActions';

export function LandingPage() {
  const search = useClubSearch();
  const actions = useLandingActions(search.reset);
  return (
    <div onClick={actions.handleAction}>
      <a className="skip-link" href="#noi-dung">Đến nội dung chính</a>
      <Header />
      <main id="noi-dung" className="w-full pt-20 bg-surface">
        <aside className="demo-notice">BẢN GIAO DIỆN MẪU · Số liệu, CLB, lịch tuyển và sự kiện dưới đây là dữ liệu minh họa.</aside>
        <HeroSection draft={search.draft} setDraft={search.setDraft} onSearch={search.search} />
        <MetricsSection />
        <AboutSection />
        <ProcessSection />
        <RecruitmentSection />
        <BenefitsSection />
        <ClubDirectory clubs={search.clubs} total={search.total} onReset={search.reset} />
        <EventsSection />
        <NewsSection />
        <CallToAction />
      </main>
      <Footer />
      <DetailDialog content={actions.dialog} onClose={actions.closeDialog} triggerRef={actions.triggerRef} />
    </div>
  );
}
