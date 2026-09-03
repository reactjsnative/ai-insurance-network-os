import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Layers, 
  Users, 
  Award, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Filter, 
  TrendingUp, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  Calendar,
  Sparkles,
  ExternalLink,
  UserCheck,
  CheckCircle2,
  FolderTree,
  PieChart as PieIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member, PositionId } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const OrganizationStructure: React.FC = () => {
  const { members, positions, setSelectedMemberId, setActiveTab, t, language } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('all');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'mem_regional_1': true,
    'mem_center_1': true,
    'mem_unit_1': true
  });

  // Group members into Regions, Centers, Units, and Agents
  const regionalManagers = useMemo(() => members.filter(m => m.positionId === 'regional_manager'), [members]);
  const centerManagers = useMemo(() => members.filter(m => m.positionId === 'center_manager'), [members]);
  const unitManagers = useMemo(() => members.filter(m => m.positionId === 'unit_manager'), [members]);
  const agents = useMemo(() => members.filter(m => m.positionId === 'agent'), [members]);

  // Aggregate stats
  const totalFYC = useMemo(() => members.reduce((sum, m) => sum + (m.personalFYC || 0), 0), [members]);
  const totalCOM = useMemo(() => members.reduce((sum, m) => sum + (m.personalCOM || 0), 0), [members]);
  const totalActive = useMemo(() => members.filter(m => m.status === 'active').length, [members]);

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getPositionBadge = (posId: PositionId) => {
    switch (posId) {
      case 'regional_manager':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">ผู้บริหารภาค (RM)</span>;
      case 'center_manager':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">ผู้บริหารศูนย์ (CM)</span>;
      case 'unit_manager':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">ผู้บริหารหน่วย (UM)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">ตัวแทน (Agent)</span>;
    }
  };

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.location.province.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRegion = selectedRegionId === 'all' || m.regionId === selectedRegionId;
      const matchCenter = selectedCenterId === 'all' || m.centerId === selectedCenterId;
      const matchUnit = selectedUnitId === 'all' || m.unitId === selectedUnitId;
      return matchSearch && matchRegion && matchCenter && matchUnit;
    });
  }, [members, searchTerm, selectedRegionId, selectedCenterId, selectedUnitId]);

  return (
    <div id="organization_structure_view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-200 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
              {language === 'th' ? 'โครงสร้างสายงานองค์กรแบบ Drill-Down' : 'Multi-Level Organization Drill-Down'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Building2 className="w-8 h-8 text-amber-400" />
              {language === 'th' ? 'โครงสร้างองค์กร (Organization)' : 'Organization Hierarchy'}
            </h1>
            <p className="text-slate-700 text-sm max-w-2xl">
              {language === 'th' 
                ? 'ระบบแจกแจงโครงสร้างระดับ ภาค (Region) → ศูนย์ (Center) → หน่วย (Unit) → ตัวแทน (Agent) พร้อมสรุปผลงาน FYC/COM แบบเรียลไทม์'
                : 'Complete structural hierarchy drill-down by Region, Center, Unit, and Agents with rolling FYC/COM rollups.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('network_visual')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Layers className="w-4 h-4" />
              {language === 'th' ? 'เปิดกราฟ Interactive Network' : 'Open Visual Network'}
            </button>
          </div>
        </div>

        {/* 4 Rollup KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200/80">
          <div className="bg-white/60 p-3.5 rounded-xl border border-slate-200/60">
            <p className="text-xs text-slate-600">{language === 'th' ? 'สมาชิกทั้งหมด' : 'Total Network'}</p>
            <p className="text-xl font-bold text-white mt-1">{members.length} <span className="text-xs text-slate-600 font-normal">{language === 'th' ? 'คน' : 'members'}</span></p>
            <p className="text-[11px] text-emerald-400 mt-1">Active: {totalActive} ({((totalActive/members.length)*100).toFixed(0)}%)</p>
          </div>
          <div className="bg-white/60 p-3.5 rounded-xl border border-slate-200/60">
            <p className="text-xs text-amber-400">{language === 'th' ? 'โครงสร้างผู้นำ' : 'Leadership Structure'}</p>
            <p className="text-xl font-bold text-amber-400 mt-1">{regionalManagers.length} <span className="text-xs text-slate-600 font-normal">ภาค</span> / {centerManagers.length} <span className="text-xs text-slate-600 font-normal">ศูนย์</span></p>
            <p className="text-[11px] text-slate-600 mt-1">{unitManagers.length} หน่วย / {agents.length} ตัวแทน</p>
          </div>
          <div className="bg-white/60 p-3.5 rounded-xl border border-slate-200/60">
            <p className="text-xs text-cyan-400">{language === 'th' ? 'FYC ทั้งองค์กร' : 'Total FYC Rollup'}</p>
            <p className="text-xl font-bold text-cyan-400 mt-1">{formatCurrency(totalFYC)}</p>
            <p className="text-[11px] text-slate-600 mt-1">First Year Commission</p>
          </div>
          <div className="bg-white/60 p-3.5 rounded-xl border border-slate-200/60">
            <p className="text-xs text-emerald-400">{language === 'th' ? 'COM ทั้งองค์กร' : 'Total COM Rollup'}</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(totalCOM)}</p>
            <p className="text-[11px] text-slate-600 mt-1">Direct Commission</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={language === 'th' ? 'ค้นหาชื่อ, รหัสตัวแทน, หรือจังหวัด...' : 'Search name, code, province...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">{language === 'th' ? 'ทุกภาค (All Regions)' : 'All Regions'}</option>
            <option value="region_1">ภาคกรุงเทพและปริมณฑล</option>
            <option value="region_2">ภาคตะวันออกเฉียงเหนือ</option>
          </select>

          <select
            value={selectedCenterId}
            onChange={(e) => setSelectedCenterId(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">{language === 'th' ? 'ทุกศูนย์ (All Centers)' : 'All Centers'}</option>
            <option value="center_1">ศูนย์ 1 (Center A)</option>
            <option value="center_2">ศูนย์ 2 (Center B)</option>
            <option value="center_3">ศูนย์ 3 (Center C)</option>
            <option value="center_4">ศูนย์ 4 (Center D)</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedRegionId('all');
              setSelectedCenterId('all');
              setSelectedUnitId('all');
            }}
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 transition-all"
          >
            {language === 'th' ? 'ล้างตัวกรอง' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Organizational Tree Breakdown Cards */}
      <div className="space-y-4">
        {regionalManagers.map((rm) => {
          const isRmExpanded = !!expandedNodes[rm.id];
          const rmCenters = centerManagers.filter(cm => cm.parentMemberId === rm.id || cm.sponsorId === rm.id || cm.regionId === rm.regionId);
          const rmTotalMembers = members.filter(m => m.regionId === rm.regionId).length;
          const rmTotalFYC = members.filter(m => m.regionId === rm.regionId).reduce((s, m) => s + m.personalFYC, 0);

          return (
            <div key={rm.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg transition-all">
              {/* Region Header */}
              <div 
                onClick={() => toggleExpand(rm.id)}
                className="p-5 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-b border-slate-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-100/40"
              >
                <div className="flex items-center gap-3">
                  <button className="p-1 rounded bg-slate-100 text-slate-700">
                    {isRmExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <img
                    src={rm.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={rm.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-amber-500 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{rm.name}</h3>
                      {getPositionBadge(rm.positionId)}
                      <span className="text-xs text-slate-600 font-mono">[{rm.memberCode}]</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-slate-600" />
                      {rm.location.province} • สังกัด {rm.regionId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end md:self-auto text-right">
                  <div>
                    <p className="text-xs text-slate-600">{language === 'th' ? 'รวมสมาชิกในภาค' : 'Total Region Team'}</p>
                    <p className="text-sm font-bold text-white">{rmTotalMembers} {language === 'th' ? 'คน' : 'members'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{language === 'th' ? 'FYC ทั้งภาค' : 'Region FYC'}</p>
                    <p className="text-sm font-bold text-amber-400">{formatCurrency(rmTotalFYC)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMemberId(rm.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {language === 'th' ? 'ดูโปรไฟล์' : 'Profile'}
                  </button>
                </div>
              </div>

              {/* Centers Under Region */}
              {isRmExpanded && (
                <div className="p-4 sm:p-6 space-y-4 bg-white/40">
                  {rmCenters.map((cm) => {
                    const isCmExpanded = !!expandedNodes[cm.id];
                    const cmUnits = unitManagers.filter(um => um.parentMemberId === cm.id || um.sponsorId === cm.id || um.centerId === cm.centerId);
                    const cmTotalMembers = members.filter(m => m.centerId === cm.centerId).length;
                    const cmTotalFYC = members.filter(m => m.centerId === cm.centerId).reduce((s, m) => s + m.personalFYC, 0);

                    return (
                      <div key={cm.id} className="bg-white/80 border border-slate-200 rounded-xl overflow-hidden">
                        {/* Center Row */}
                        <div 
                          onClick={() => toggleExpand(cm.id)}
                          className="p-4 bg-white border-b border-slate-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-100/40"
                        >
                          <div className="flex items-center gap-3">
                            <button className="p-1 rounded bg-slate-100 text-slate-600">
                              {isCmExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                            <img
                              src={cm.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                              alt={cm.name}
                              className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-sm">{cm.name}</h4>
                                {getPositionBadge(cm.positionId)}
                                <span className="text-xs text-slate-600 font-mono">[{cm.memberCode}]</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                รหัสศูนย์: {cm.centerId} • {cm.location.province}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-right">
                            <div>
                              <p className="text-[11px] text-slate-600">{language === 'th' ? 'สมาชิกในศูนย์' : 'Center Team'}</p>
                              <p className="text-xs font-bold text-slate-800">{cmTotalMembers} คน</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-slate-600">{language === 'th' ? 'FYC ศูนย์' : 'Center FYC'}</p>
                              <p className="text-xs font-bold text-indigo-300">{formatCurrency(cmTotalFYC)}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMemberId(cm.id);
                              }}
                              className="px-2.5 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-medium border border-indigo-500/40"
                            >
                              {language === 'th' ? 'โปรไฟล์' : 'Profile'}
                            </button>
                          </div>
                        </div>

                        {/* Units Under Center */}
                        {isCmExpanded && (
                          <div className="p-3 sm:p-4 space-y-3 bg-white/60">
                            {cmUnits.map((um) => {
                              const isUmExpanded = !!expandedNodes[um.id];
                              const umAgents = agents.filter(ag => ag.parentMemberId === um.id || ag.sponsorId === um.id || ag.unitId === um.unitId);
                              const umTotalFYC = members.filter(m => m.unitId === um.unitId).reduce((s, m) => s + m.personalFYC, 0);

                              return (
                                <div key={um.id} className="bg-white border border-slate-200 rounded-lg p-3">
                                  <div 
                                    onClick={() => toggleExpand(um.id)}
                                    className="flex items-center justify-between cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <button className="p-0.5 rounded bg-slate-100 text-slate-600">
                                        {isUmExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                      </button>
                                      <img
                                        src={um.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
                                        alt={um.name}
                                        className="w-7 h-7 rounded-full object-cover border border-cyan-400"
                                      />
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <p className="text-xs font-bold text-slate-800">{um.name}</p>
                                          {getPositionBadge(um.positionId)}
                                        </div>
                                        <p className="text-[10px] text-slate-600">
                                          รหัสหน่วย: {um.unitId} • {umAgents.length} ตัวแทนในสังกัด
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-right">
                                      <div>
                                        <p className="text-[10px] text-slate-600">FYC หน่วย</p>
                                        <p className="text-xs font-bold text-cyan-400">{formatCurrency(umTotalFYC)}</p>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedMemberId(um.id);
                                        }}
                                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700"
                                      >
                                        ดู
                                      </button>
                                    </div>
                                  </div>

                                  {/* Direct Agents in Unit */}
                                  {isUmExpanded && (
                                    <div className="mt-3 pt-3 border-t border-slate-200/80 pl-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                      {umAgents.map((ag) => (
                                        <div 
                                          key={ag.id}
                                          onClick={() => setSelectedMemberId(ag.id)}
                                          className="p-2 rounded-lg bg-white/80 border border-slate-200/80 flex items-center justify-between cursor-pointer hover:border-slate-200 hover:bg-white transition-all"
                                        >
                                          <div className="flex items-center gap-2">
                                            <img
                                              src={ag.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                                              alt={ag.name}
                                              className="w-6 h-6 rounded-full object-cover"
                                            />
                                            <div>
                                              <p className="text-xs font-medium text-slate-800 leading-tight">{ag.name}</p>
                                              <p className="text-[10px] text-slate-600">{ag.memberCode}</p>
                                            </div>
                                          </div>
                                          <span className="text-[11px] font-bold text-emerald-400">{formatCurrency(ag.personalFYC)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
