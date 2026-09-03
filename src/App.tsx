import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import InsuranceMegaMenu from './components/navigation/InsuranceMegaMenu';
import { MobileNav } from './components/common/MobileNav';

import { Dashboard } from './components/dashboard/Dashboard';
import { IncomeCalculator } from './components/calculator/IncomeCalculator';
import { OrganizationStructure } from './components/organization/OrganizationStructure';
import { OrganizationNetwork } from './components/network/OrganizationNetwork';
import { CareerPath } from './components/career/CareerPath';
import { CareerPlan } from './components/career/CareerPlan';
import { GoalPlanner } from './components/goals/GoalPlanner';
import { GrowthSimulation } from './components/simulation/GrowthSimulation';
import { AICoach } from './components/ai/AICoach';
import { AiStudioApp } from './aiStudio/AiStudioApp';
import { ExtractedAiNetwork } from './components/extracted/ExtractedAiNetwork';
import { NetworkSuccessView } from './components/extracted/NetworkSuccessView';
import { TeamGoalView } from './components/network/teamGoal/TeamGoalView';
import { SocialView } from './components/social/SocialView';
import { FacebookLinks } from './components/media/FacebookLinks';
import { YouTubeLinks } from './components/media/YouTubeLinks';
import { XLinks } from './components/media/XLinks';
import { AgentRecruitmentPortal } from './components/recruitment/AgentRecruitmentPortal';
import { MembersManagement } from './components/members/MembersManagement';
import { CompensationAdmin } from './components/admin/CompensationAdmin';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { SettingsView } from './components/settings/SettingsView';
import { VideoLibrary } from './components/media/VideoLibrary';
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
      <div className="flex-1 min-h-screen bg-white font-sans">
        <WelcomeLoginGateway onEnterSystem={() => setShowGatewayScreen(false)} />
        <AuthModal />
        <SocialOAuthPopup />
        <AuthToast />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white text-slate-900 font-sans">
      {!isPresentationMode && <InsuranceMegaMenu />}
      {!isPresentationMode && <Header />}

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-white via-blue-50/50 to-white"><div className="mx-auto max-w-7xl w-full p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'network_success' && <NetworkSuccessView />}
          {activeTab === 'network_success_team_goal' && <TeamGoalView />}
          {activeTab === 'extracted_ai_network' && <ExtractedAiNetwork tab="dashboard" />}
          {(activeTab.startsWith('extracted_') && activeTab !== 'extracted_ai_network') && (
            <ExtractedAiNetwork tab={activeTab.replace('extracted_', '')} />
          )}
          {(activeTab === 'social_youtube') && <YouTubeLinks />}
          {activeTab === 'social_facebook' && <FacebookLinks />}
          {activeTab === 'social_x' && <XLinks />}
          {activeTab === 'social_tiktok' && <TikTokLinks />}
          {activeTab === 'ai_studio' && <AiStudioApp />}
          {activeTab === 'income_calculator' && <IncomeCalculator />}
          {activeTab === 'organization' && <OrganizationStructure />}
          {activeTab === 'network_visual' && <OrganizationNetwork />}
          {activeTab === 'career_path' && <CareerPath />}
          {activeTab === 'career_plan' && <CareerPlan />}
          {activeTab === 'my_plan' && <CareerPlan memberMode />}
          {activeTab === 'member_sheet' && <MemberSheetView />}
          {activeTab === 'goals' && <GoalPlanner />}
          {activeTab === 'simulation_goals' && <GrowthSimulation />}
          {activeTab === 'ai_coach' && <AICoach />}
          {activeTab === 'recruit_agent' && <AgentRecruitmentPortal />}
          {activeTab === 'members_mgmt' && <MembersManagement />}
          {activeTab === 'compensation_admin' && <CompensationAdmin />}
          {activeTab === 'reports' && <ReportsCenter />}
          {activeTab === 'video_library' && <VideoLibrary />}
          {activeTab === 'tiktok_links' && <TikTokLinks />}
          {activeTab === 'settings' && <SettingsView />}
        </div></main>
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
