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
  Boxes,
  Award
} from 'lucide-react';
import { useApp, ActiveTab } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

  const mobileItems: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'หน้าแรก', icon: LayoutDashboard },
    { id: 'network_success', label: 'สำเร็จ', icon: Award },
    { id: 'network_success_team_goal', label: 'เป้าหมาย', icon: Target },
    { id: 'extracted_ai_network', label: 'ทีมตัวแทน', icon: Boxes },
    { id: 'ai_studio', label: 'จำลอง', icon: Gem },
    { id: 'network_visual', label: 'เครือข่าย', icon: Network },
    { id: 'career_path', label: 'อาชีพ', icon: TrendingUp },
    { id: 'career_plan', label: 'แผน', icon: Rocket },
    { id: 'recruit_agent', label: 'รับสมัคร', icon: UserPlus },
    { id: 'ai_coach', label: 'AI โค้ช', icon: Bot },
    { id: 'members_mgmt', label: 'สมาชิก', icon: Users },
    { id: 'video_library', label: 'วิดีโอ', icon: Video },
    { id: 'compensation_admin', label: 'ตั้งค่า', icon: Sliders },
  ];

  return (
    <div id="mobile_bottom_nav" className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-sky-50/95 backdrop-blur-md border-t border-sky-100 z-40 px-2 flex items-center justify-around">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              isActive ? 'text-blue-600' : 'text-slate-700 hover:text-slate-800'
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
