import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { OrganizationTreeView } from './components/Tree/OrganizationTreeView';
import { IncomeCalculatorView } from './components/Calculator/IncomeCalculatorView';
import { GoalSimulatorView } from './components/Goal/GoalSimulatorView';
import { AdminSettingsView } from './components/Admin/AdminSettingsView';
import { UnitTestsView } from './components/Tests/UnitTestsView';
import { AddMemberModal } from './components/Modals/AddMemberModal';
import { EditMemberModal } from './components/Modals/EditMemberModal';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-full bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600/30 selection:text-amber-200">
      {/* 1. Mandatory Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 2. Top Navigation Bar */}
      <Navbar />

      {/* 3. Main Views Content */}
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        {activeTab === 'DASHBOARD' && <DashboardView />}
        {activeTab === 'TREE' && <OrganizationTreeView />}
        {activeTab === 'CALCULATOR' && <IncomeCalculatorView />}
        {activeTab === 'GOAL' && <GoalSimulatorView />}
        {activeTab === 'ADMIN' && <AdminSettingsView />}
        {activeTab === 'UNIT_TESTS' && <UnitTestsView />}
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-700">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-medium text-slate-700">
            AI Insurance Network Income Simulator &copy; {new Date().getFullYear()} — All Rights Reserved.
          </p>
          <p className="text-[11px] text-slate-700">
            สร้างขึ้นเพื่อการจำลองโครงสร้างองค์กร วางแผนตำแหน่ง และประเมินผลประโยชน์ตัวแทนประกันชีวิตตามประกาศกติกา 15 มกราคม 2564
          </p>
        </div>
      </footer>

      {/* 5. Modals */}
      <AddMemberModal />
      <EditMemberModal />
    </div>
  );
};

export const AiStudioApp: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default AiStudioApp;
