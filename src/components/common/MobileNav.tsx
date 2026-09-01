import React from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  Network, 
  TrendingUp,
  Rocket,
  Target,
  Bot, 
  Users, 
  UserPlus,
  FileText, 
  Sliders,
  Video,
  Music2,
  Gem,
  Boxes
} from 'lucide-react';
import { useApp, ActiveTab } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

  const mobileItems: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'extracted_ai_network', label: 'AI Network', icon: Boxes },
    { id: 'ai_studio', label: 'Simulator', icon: Gem },
    { id: 'income_calculator', label: t('direct_com').split(' ')[0] || 'Income', icon: Calculator },
    { id: 'network_visual', label: 'Network', icon: Network },
    { id: 'career_path', label: 'Career', icon: TrendingUp },
    { id: 'career_plan', label: 'Plan', icon: Rocket },
    { id: 'recruit_agent', label: 'Recruit', icon: UserPlus },
    { id: 'ai_coach', label: 'AI Coach', icon: Bot },
    { id: 'members_mgmt', label: 'Members', icon: Users },
    { id: 'video_library', label: 'Video', icon: Video },
    { id: 'tiktok_links', label: 'TikTok', icon: Music2 },
    { id: 'compensation_admin', label: 'Admin', icon: Sliders },
  ];

  return (
    <div id="mobile_bottom_nav" className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 z-40 px-2 flex items-center justify-around">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
