import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';

import { Dashboard } from './components/dashboard/Dashboard';
import { IncomeCalculator } from './components/calculator/IncomeCalculator';
import { OrganizationStructure } from './components/organization/OrganizationStructure';
import { OrganizationNetwork } from './components/network/OrganizationNetwork';
import { CareerPath } from './components/career/CareerPath';
import { CareerPlan } from './components/career/CareerPlan';
import { TikTokAdsTutorial } from './components/career/TikTokAdsTutorial';
import { GoalPlanner } from './components/goals/GoalPlanner';
import { GrowthSimulation } from './components/simulation/GrowthSimulation';
import { AICoach } from './components/ai/AICoach';
import { AiStudioApp } from './aiStudio/AiStudioApp';
import { ExtractedAiNetwork } from './components/extracted/ExtractedAiNetwork';
import { NetworkSuccessView } from './components/extracted/NetworkSuccessView';
import { AgentRecruitmentPortal } from './components/recruitment/AgentRecruitmentPortal';
import { MembersManagement } from './components/members/MembersManagement';
import { CompensationAdmin } from './components/admin/CompensationAdmin';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { SettingsView } from './components/settings/SettingsView';
import { VideoLibrary } from './components/media/VideoLibrary';
import { AIImageGenerator } from './components/media/AIImageGenerator';
import { TikTokLinks } from './components/media/TikTokLinks';
import { MemberSheetView } from './components/members/MemberSheetView';
import { AuthModal } from './components/auth/AuthModal';
import { SocialOAuthPopup } from './components/auth/SocialOAuthPopup';
import { AuthToast } from './components/auth/AuthToast';
import { WelcomeLoginGateway } from './components/auth/WelcomeLoginGateway';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, isPresentationMode, showGatewayScreen, setShowGatewayScreen, authUser } = useApp();

  // Deep-link: open the login gateway directly via /?gateway=1 (useful for previews/narrow screens)
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('gateway') === '1') setShowGatewayScreen(true);
      const tab = params.get('tab');
      if (tab) setActiveTab(tab as any);
    } catch {
      /* ignore */
    }
  }, [setShowGatewayScreen, setActiveTab]);

  // If gateway screen is active, display the pre-login entrance screen
  if (showGatewayScreen) {
    return (
      <div className="flex-1 min-h-screen bg-slate-950 font-sans">
        <WelcomeLoginGateway onEnterSystem={() => setShowGatewayScreen(false)} />
        <AuthModal />
        <SocialOAuthPopup />
        <AuthToast />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {!isPresentationMode && <Header />}

      <div className="flex-1 flex overflow-hidden">
        {!isPresentationMode && <Sidebar />}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'network_success' && <NetworkSuccessView />}
          {activeTab === 'extracted_ai_network' && <ExtractedAiNetwork />}
          {activeTab === 'ai_studio' && <AiStudioApp />}
          {activeTab === 'income_calculator' && <IncomeCalculator />}
          {activeTab === 'organization' && <OrganizationStructure />}
          {activeTab === 'network_visual' && <OrganizationNetwork />}
          {activeTab === 'career_path' && <CareerPath />}
          {activeTab === 'career_plan' && <CareerPlan />}
          {activeTab === 'my_plan' && <CareerPlan memberMode />}
          {activeTab === 'tiktok_ads' && <TikTokAdsTutorial />}
          {activeTab === 'member_sheet' && <MemberSheetView />}
          {activeTab === 'goals' && <GoalPlanner />}
          {activeTab === 'simulation_goals' && <GrowthSimulation />}
          {activeTab === 'ai_coach' && <AICoach />}
          {activeTab === 'recruit_agent' && <AgentRecruitmentPortal />}
          {activeTab === 'members_mgmt' && <MembersManagement />}
          {activeTab === 'compensation_admin' && <CompensationAdmin />}
          {activeTab === 'reports' && <ReportsCenter />}
          {activeTab === 'video_library' && <VideoLibrary />}
          {activeTab === 'video_generator' && <AIImageGenerator />}
          {activeTab === 'tiktok_links' && <TikTokLinks />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {!isPresentationMode && <MobileNav />}

      {/* Global Authentication Modals & Feedback */}
      <AuthModal />
      <SocialOAuthPopup />
      <AuthToast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
