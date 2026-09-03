import React, { useState, useMemo } from 'react';
import { 
  Network, 
  Layers, 
  MapPin, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Play, 
  RotateCcw, 
  Filter, 
  User, 
  Flame, 
  Building2, 
  Activity, 
  Search,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';

export const OrganizationNetwork: React.FC = () => {
  const { 
    members, 
    activeUser, 
    selectedMember, 
    setSelectedMember, 
    selectedNetworkView, 
    setSelectedNetworkView, 
    heatmapMode, 
    setHeatmapMode,
    calculateMemberIncome,
    getDownlineStats
  } = useApp();

  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [timeLapsePlaying, setTimeLapsePlaying] = useState(false);
  const [timeLapseMonth, setTimeLapseMonth] = useState(12);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (filterRole !== 'all' && m.positionId !== filterRole) return false;
      if (filterStatus !== 'all' && m.status !== filterStatus) return false;
      return true;
    });
  }, [members, filterRole, filterStatus]);

  // Root leader and children mapping
  const rootMember = members.find(m => m.id === activeUser.id) || members[0];

  // Group members into hierarchy tiers
  const regionLeaders = members.filter(m => m.positionId === 'region_manager');
  const centerLeaders = members.filter(m => m.positionId === 'center_manager');
  const unitLeaders = members.filter(m => m.positionId === 'unit_manager');
  const agents = members.filter(m => m.positionId === 'agent');

  const getPositionColor = (posId: string) => {
    switch (posId) {
      case 'region_manager': return '#f43f5e';
      case 'center_manager': return '#fbbf24';
      case 'unit_manager': return '#34d399';
      default: return '#38bdf8';
    }
  };

  const handlePlayTimeLapse = () => {
    setTimeLapsePlaying(true);
    let current = 1;
    setTimeLapseMonth(1);
    const interval = setInterval(() => {
      current += 1;
      if (current > 12) {
        clearInterval(interval);
        setTimeLapsePlaying(false);
      } else {
        setTimeLapseMonth(current);
      }
    }, 600);
  };

  return (
    <div id="organization_network_view" className="space-y-4 max-w-7xl mx-auto pb-16 text-left relative">
      {/* 1. Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-sky-50/90 border border-sky-100/60 shadow-xl">
        {/* Left: 4 Visual Views Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-sky-50 border border-sky-100/60">
          <button
            onClick={() => setSelectedNetworkView('tree')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedNetworkView === 'tree' ? 'bg-blue-600 text-slate-950 shadow-sm shadow-amber-500/20' : 'text-slate-700 hover:text-slate-800'
            }`}
          >
            Tree View (ผังองค์กร)
          </button>
          <button
            onClick={() => setSelectedNetworkView('radial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedNetworkView === 'radial' ? 'bg-blue-600 text-slate-950 shadow-sm shadow-amber-500/20' : 'text-slate-700 hover:text-slate-800'
            }`}
          >
            Radial Network (วงโคจร)
          </button>
          <button
            onClick={() => setSelectedNetworkView('galaxy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedNetworkView === 'galaxy' ? 'bg-blue-600 text-slate-950 shadow-sm shadow-amber-500/20' : 'text-slate-700 hover:text-slate-800'
            }`}
          >
            Galaxy Cluster (ดวงดาว)
          </button>
          <button
            onClick={() => setSelectedNetworkView('geo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedNetworkView === 'geo' ? 'bg-blue-600 text-slate-950 shadow-sm shadow-amber-500/20' : 'text-slate-700 hover:text-slate-800'
            }`}
          >
            Geo Map (ภูมิศาสตร์ไทย)
          </button>
        </div>

        {/* Right: Filter & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Heatmap Toggle */}
          <button
            onClick={() => setHeatmapMode(!heatmapMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              heatmapMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-sky-100 text-slate-700 border-sky-100/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap (FYC Density)</span>
          </button>

          {/* Time Lapse Play */}
          <button
            onClick={handlePlayTimeLapse}
            disabled={timeLapsePlaying}
            className="px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            {timeLapsePlaying ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{timeLapsePlaying ? `Month ${timeLapseMonth}/12` : 'Growth Time-Lapse'}</span>
          </button>

          {/* Zoom In / Out */}
          <div className="inline-flex rounded-xl bg-sky-100 border border-sky-100/60 overflow-hidden">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.1))}
              className="p-1.5 hover:bg-slate-200 text-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 py-1 text-[11px] font-mono text-slate-700 flex items-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.1))}
              className="p-1.5 hover:bg-slate-200 text-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Interactive Network Canvas */}
      <div className="relative min-h-[580px] rounded-3xl bg-sky-50 border border-sky-100/60 overflow-hidden shadow-2xl p-6 flex flex-col justify-center items-center">
        {/* Background Grid Accent */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{
            backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* View Mode 1: Tree View */}
        {selectedNetworkView === 'tree' && (
          <div 
            className="w-full h-full overflow-auto py-8 transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          >
            {/* Level 1: Region Manager (Root) */}
            <div className="flex justify-center mb-10">
              <MemberNodeCard 
                member={rootMember} 
                isSelected={selectedMember?.id === rootMember.id}
                onSelect={() => setSelectedMember(rootMember)}
                heatmap={heatmapMode}
              />
            </div>

            {/* Connecting Vertical Line */}
            <div className="w-0.5 h-8 bg-slate-700 mx-auto -mt-10 mb-2" />

            {/* Level 2: Center Managers (CM) */}
            <div className="flex flex-wrap justify-center gap-8 mb-10 px-4">
              {centerLeaders.map((cm) => (
                <div key={cm.id} className="flex flex-col items-center">
                  <div className="w-0.5 h-6 bg-slate-700 mb-2" />
                  <MemberNodeCard 
                    member={cm} 
                    isSelected={selectedMember?.id === cm.id}
                    onSelect={() => setSelectedMember(cm)}
                    heatmap={heatmapMode}
                  />

                  {/* Level 3: Units under this center */}
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {unitLeaders.filter(u => u.centerId === cm.id || u.parentMemberId === cm.id).slice(0, 3).map((um) => (
                      <MemberMiniCard 
                        key={um.id} 
                        member={um} 
                        isSelected={selectedMember?.id === um.id}
                        onSelect={() => setSelectedMember(um)}
                        heatmap={heatmapMode}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Mode 2: Radial Network Orbit */}
        {selectedNetworkView === 'radial' && (
          <div 
            className="relative w-full h-[520px] flex items-center justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Center Orbit Circle */}
            <div className="absolute w-[280px] h-[280px] rounded-full border border-blue-600/20 pointer-events-none" />
            <div className="absolute w-[460px] h-[460px] rounded-full border border-sky-500/15 pointer-events-none" />

            {/* Center RM */}
            <div className="z-20">
              <MemberNodeCard 
                member={rootMember} 
                isSelected={selectedMember?.id === rootMember.id}
                onSelect={() => setSelectedMember(rootMember)}
                heatmap={heatmapMode}
              />
            </div>

            {/* Orbit 1: Centers */}
            {centerLeaders.map((cm, idx) => {
              const angle = (idx / centerLeaders.length) * 2 * Math.PI;
              const radius = 140;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              return (
                <div
                  key={cm.id}
                  className="absolute z-10"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  <MemberMiniCard 
                    member={cm} 
                    isSelected={selectedMember?.id === cm.id}
                    onSelect={() => setSelectedMember(cm)}
                    heatmap={heatmapMode}
                  />
                </div>
              );
            })}

            {/* Orbit 2: Units */}
            {unitLeaders.slice(0, 10).map((um, idx) => {
              const angle = (idx / 10) * 2 * Math.PI;
              const radius = 230;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              return (
                <div
                  key={um.id}
                  className="absolute z-10"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  <MemberMiniCard 
                    member={um} 
                    isSelected={selectedMember?.id === um.id}
                    onSelect={() => setSelectedMember(um)}
                    heatmap={heatmapMode}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* View Mode 3: Galaxy View */}
        {selectedNetworkView === 'galaxy' && (
          <div 
            className="w-full h-[520px] relative overflow-hidden flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className="absolute inset-0 bg-radial from-amber-500/10 via-sky-100 to-sky-50 pointer-events-none" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 z-10">
              {centerLeaders.map((cm, cIdx) => (
                <div key={cm.id} className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100/60 text-center space-y-3">
                  <div className="font-bold text-blue-600 text-xs">{cm.location.region} Solar System</div>
                  <MemberNodeCard 
                    member={cm} 
                    isSelected={selectedMember?.id === cm.id}
                    onSelect={() => setSelectedMember(cm)}
                    heatmap={heatmapMode}
                  />
                  <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                    {unitLeaders.filter(u => u.centerId === cm.id || u.parentMemberId === cm.id).map(u => (
                      <img 
                        key={u.id}
                        src={u.avatarUrl} 
                        alt={u.name}
                        onClick={() => setSelectedMember(u)}
                        className="w-6 h-6 rounded-full object-cover border border-emerald-400 cursor-pointer hover:scale-125 transition-transform" 
                        title={`${u.name} (${u.memberCode})`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Mode 4: Geo Thailand Regional Map */}
        {selectedNetworkView === 'geo' && (
          <div className="w-full h-[520px] p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 z-10 overflow-y-auto">
            {['Bangkok & Metro', 'Northern', 'Northeastern', 'Southern'].map((regionName) => {
              const regionMembers = members.filter(m => m.location.region === regionName);
              const regionFYC = regionMembers.reduce((sum, m) => sum + m.personalFYC, 0);
              return (
                <div key={regionName} className="p-4 rounded-2xl bg-sky-50/80 border border-sky-100/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-sky-100/60">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{regionName}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">{regionMembers.length} คน</span>
                    </div>

                    <div className="my-3 text-xs">
                      <div className="text-slate-700 text-[10px]">FYC ภูมิภาค</div>
                      <div className="text-base font-extrabold text-blue-600 font-mono">฿{regionFYC.toLocaleString()}</div>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {regionMembers.map(m => (
                        <div 
                          key={m.id}
                          onClick={() => setSelectedMember(m)}
                          className="p-2 rounded-xl bg-sky-50/60 hover:bg-sky-100 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <img src={m.avatarUrl} alt={m.name} className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-slate-800 text-[11px] truncate max-w-[100px]">{m.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-700">{m.location.province}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Member Profile Drawer Panel (when selected) */}
      {selectedMember && (
        <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-sky-50 border-l border-sky-100/60 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100/60">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Member Profile</span>
              <button 
                onClick={() => setSelectedMember(null)}
                className="w-7 h-7 rounded-lg bg-sky-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Avatar & Key Info */}
            <div className="flex items-center gap-3">
              <img 
                src={selectedMember.avatarUrl} 
                alt={selectedMember.name} 
                className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-400 shadow-sm"
              />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{selectedMember.name}</h3>
                <div className="text-xs text-blue-600 font-semibold">{selectedMember.memberCode}</div>
                <div className="text-[10px] text-slate-700 mt-0.5">{selectedMember.location.province} • {selectedMember.location.region}</div>
              </div>
            </div>

            {/* Position & Status */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100/60">
                <span className="text-[10px] text-slate-700 block">ตำแหน่ง</span>
                <span className="font-bold text-slate-800">
                  {selectedMember.positionId === 'region_manager' ? 'ผู้บริหารภาค (RM)' :
                   selectedMember.positionId === 'center_manager' ? 'ผู้บริหารศูนย์ (CM)' :
                   selectedMember.positionId === 'unit_manager' ? 'ผู้บริหารหน่วย (UM)' : 'ตัวแทน (Agent)'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100/60">
                <span className="text-[10px] text-slate-700 block">สถานะปฏิบัติงาน</span>
                <span className={`font-bold ${selectedMember.status === 'active' ? 'text-emerald-400' : 'text-slate-700'}`}>
                  {selectedMember.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Financial Performance */}
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-700">FYC ส่วนตัว:</span>
                <span className="font-bold text-sky-400">฿{selectedMember.personalFYC.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">COM ส่วนตัว:</span>
                <span className="font-bold text-blue-600">฿{selectedMember.personalCOM.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">เบี้ยปีแรก (FYP):</span>
                <span className="font-bold text-slate-800">฿{selectedMember.firstYearPremium.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">เบี้ยปีต่อ (Renewal):</span>
                <span className="font-bold text-slate-800">฿{selectedMember.renewalPremium.toLocaleString()}</span>
              </div>
            </div>

            {/* Estimated Total Income */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-sky-50 border border-blue-600/30">
              <div className="text-[10px] text-blue-600 uppercase font-bold">ประมาณการรายได้เดือนนี้</div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                ฿{calculateMemberIncome(selectedMember, 'ACTUAL').totalIncome.toLocaleString()}
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedMember(null)}
            className="w-full py-2.5 rounded-xl bg-sky-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors mt-4"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      )}
    </div>
  );
};

// Node Card Sub-component
const MemberNodeCard: React.FC<{ member: Member; isSelected: boolean; onSelect: () => void; heatmap: boolean }> = ({
  member,
  isSelected,
  onSelect,
  heatmap,
}) => {
  const getBadge = (posId: string) => {
    switch (posId) {
      case 'region_manager': return { text: 'RM', bg: 'bg-rose-500 text-slate-950' };
      case 'center_manager': return { text: 'CM', bg: 'bg-blue-600 text-slate-950' };
      case 'unit_manager': return { text: 'UM', bg: 'bg-emerald-500 text-slate-950' };
      default: return { text: 'AG', bg: 'bg-sky-500 text-slate-950' };
    }
  };

  const badge = getBadge(member.positionId);
  const heatIntensity = heatmap ? (member.personalFYC > 30000 ? 'border-rose-500 shadow-rose-500/30 shadow-sm' : 'border-blue-600/40') : 'border-sky-100/60';

  return (
    <div
      onClick={onSelect}
      className={`relative p-3 rounded-2xl bg-sky-50/90 border ${isSelected ? 'border-blue-400 ring-2 ring-amber-400/40' : heatIntensity} hover:border-blue-400/80 cursor-pointer transition-all duration-200 w-52 shadow-xl text-left group`}
    >
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-xl object-cover" />
          <span className={`absolute -bottom-1 -right-1 px-1 rounded text-[8px] font-black ${badge.bg}`}>
            {badge.text}
          </span>
        </div>
        <div className="overflow-hidden">
          <div className="font-bold text-xs text-slate-800 truncate group-hover:text-blue-600">{member.name}</div>
          <div className="text-[10px] text-slate-700">{member.memberCode}</div>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-sky-100/60 flex items-center justify-between text-[10px]">
        <span className="text-slate-700">FYC:</span>
        <span className="font-bold text-sky-400 font-mono">฿{member.personalFYC.toLocaleString()}</span>
      </div>
    </div>
  );
};

// Mini Card for dense or radial views
const MemberMiniCard: React.FC<{ member: Member; isSelected: boolean; onSelect: () => void; heatmap: boolean }> = ({
  member,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-1.5 rounded-xl bg-sky-50/90 border ${isSelected ? 'border-blue-400' : 'border-sky-100/60'} hover:border-blue-400 cursor-pointer flex items-center gap-1.5 shadow-sm`}
      title={`${member.name} (${member.memberCode})`}
    >
      <img src={member.avatarUrl} alt={member.name} className="w-7 h-7 rounded-lg object-cover" />
      <div className="text-left hidden sm:block">
        <div className="text-[10px] font-bold text-slate-800 truncate max-w-[70px]">{member.nickname || member.name.split(' ')[0]}</div>
        <div className="text-[8px] text-blue-600 font-mono">฿{(member.personalFYC / 1000).toFixed(0)}k</div>
      </div>
    </div>
  );
};
