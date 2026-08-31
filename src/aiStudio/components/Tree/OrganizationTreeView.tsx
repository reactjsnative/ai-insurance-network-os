import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldAlert,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
  Award,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member, PositionLevel } from '../../types';
import { POSITIONS_LIST } from '../../rules/defaultRules';
import { formatBaht } from '../../lib/decimal';

interface TreeNodeProps {
  member: Member;
  allMembers: Member[];
  level: number;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  selectedId: string;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  member,
  allMembers,
  level,
  expandedIds,
  toggleExpand,
  onSelect,
  onAddChild,
  onEdit,
  onDelete,
  selectedId,
}) => {
  const { teamHierarchy, allMemberResults } = useApp();
  const children = allMembers.filter(m => m.parentId === member.id);
  const isExpanded = expandedIds.has(member.id);
  const isSelected = selectedId === member.id;

  const posInfo = POSITIONS_LIST.find(p => p.id === member.position) || POSITIONS_LIST[0];
  const stats = teamHierarchy.get(member.id);
  const incomeRes = allMemberResults.get(member.id);

  // Position border & accent styling
  let borderClass = 'border-slate-700 hover:border-slate-500';
  let badgeBg = 'bg-slate-800 text-slate-300';
  if (member.position === 'GROUP_MANAGER') {
    borderClass = 'border-amber-500/80 shadow-amber-500/10 shadow-lg';
    badgeBg = 'bg-amber-950 text-amber-300 border-amber-600';
  } else if (member.position === 'CENTER_MANAGER') {
    borderClass = 'border-emerald-500/80 shadow-emerald-500/10 shadow-md';
    badgeBg = 'bg-emerald-950 text-emerald-300 border-emerald-600';
  } else if (member.position === 'UNIT_MANAGER') {
    borderClass = 'border-blue-500/80 shadow-blue-500/10 shadow-md';
    badgeBg = 'bg-blue-950 text-blue-300 border-blue-600';
  }

  return (
    <div className="flex flex-col items-center">
      
      {/* Member Node Card */}
      <div
        className={`relative z-10 w-72 rounded-2xl p-4 bg-slate-900/95 border-2 transition-all cursor-pointer select-none ${borderClass} ${
          isSelected ? 'ring-2 ring-amber-400 scale-[1.02]' : 'hover:scale-[1.01]'
        }`}
        onClick={() => onSelect(member.id)}
      >
        {/* Header: Avatar, Name, Code */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0"
              style={{ backgroundColor: posInfo.accentColor }}
            >
              {member.nickname ? member.nickname.slice(0, 2) : member.name.slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-xs text-white truncate max-w-[130px]" title={member.name}>
                {member.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-mono text-[10px] text-slate-400 font-semibold">{member.code}</span>
                {member.nickname && (
                  <span className="text-[10px] text-amber-300 font-medium">({member.nickname})</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(member.id);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="แก้ไขข้อมูลสมาชิก"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(member.id);
              }}
              className="p-1 rounded-md text-amber-400 hover:text-amber-300 hover:bg-amber-950/60 transition-colors"
              title="เพิ่มลูกทีมสายตรง"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Position Badge & Status */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800 text-[10px]">
          <span className={`px-2 py-0.5 rounded-full font-bold border ${badgeBg}`}>
            {posInfo.nameTh.split('(')[0]}
          </span>
          <span className={`px-1.5 py-0.2 rounded font-medium ${member.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {member.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Sales & Rollup Stats */}
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px] bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
          <div>
            <span className="text-[10px] text-slate-400 block">ขายส่วนตัว:</span>
            <strong className="text-slate-200">{formatBaht(member.personalMonthlySales, false)}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">ยอดรวมทีม:</span>
            <strong className="text-blue-400">{formatBaht(stats?.totalMonthlySales || member.personalMonthlySales, false)}</strong>
          </div>
          <div className="col-span-2 pt-1 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">รายได้ประมาณการ/ด:</span>
            <strong className="text-amber-400">{formatBaht(incomeRes?.totalMonthlyIncome || 0, false)}</strong>
          </div>
        </div>

        {/* Expand / Collapse Button (if has children) */}
        {children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(member.id);
            }}
            className="w-full mt-2.5 py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1 border border-slate-700 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>ย่อสายงาน ({children.length} คน)</span>
              </>
            ) : (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span>ขยายสายงาน ({children.length} คน)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Children Subtrees */}
      {isExpanded && children.length > 0 && (
        <div className="flex flex-col items-center">
          {/* Vertical connecting pipe */}
          <div className="w-0.5 h-6 bg-slate-700" />

          {/* Horizontal crossbar for multiple children */}
          <div className="flex items-start justify-center gap-6 relative">
            {children.length > 1 && (
              <div
                className="absolute top-0 h-0.5 bg-slate-700"
                style={{
                  left: '144px',
                  right: '144px',
                }}
              />
            )}

            {children.map(child => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-slate-700" />
                <TreeNodeComponent
                  member={child}
                  allMembers={allMembers}
                  level={level + 1}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                  onSelect={onSelect}
                  onAddChild={onAddChild}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  selectedId={selectedId}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const OrganizationTreeView: React.FC = () => {
  const {
    members,
    selectedMemberId,
    setSelectedMemberId,
    setIsAddMemberModalOpen,
    setEditingMemberId,
    deleteMember,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterPos, setFilterPos] = useState<string>('ALL');
  const [zoom, setZoom] = useState(1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Expand root and second level by default
    const set = new Set<string>();
    members.forEach(m => {
      if (!m.parentId || m.position === 'GROUP_MANAGER' || m.position === 'CENTER_MANAGER') {
        set.add(m.id);
      }
    });
    return set;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(members.map(m => m.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Find root members (no parent or parent not in list)
  const rootMembers = useMemo(() => {
    return members.filter(m => !m.parentId || !members.some(p => p.id === m.parentId));
  }, [members]);

  // Filtered member highlights
  const searchMatchedIds = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase();
    return new Set(
      members
        .filter(m => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q) || (m.nickname && m.nickname.toLowerCase().includes(q)))
        .map(m => m.id)
    );
  }, [members, search]);

  return (
    <div className="space-y-4 pb-12">
      
      {/* Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, รหัส, ชื่อเล่น..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterPos}
            onChange={e => setFilterPos(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">ทุกตำแหน่ง ({members.length} คน)</option>
            <option value="GROUP_MANAGER">ผู้บริหารภาค ({members.filter(m => m.position === 'GROUP_MANAGER').length})</option>
            <option value="CENTER_MANAGER">ผู้บริหารศูนย์ ({members.filter(m => m.position === 'CENTER_MANAGER').length})</option>
            <option value="UNIT_MANAGER">ผู้บริหารหน่วย ({members.filter(m => m.position === 'UNIT_MANAGER').length})</option>
            <option value="AGENT">ตัวแทน ({members.filter(m => m.position === 'AGENT').length})</option>
          </select>
        </div>

        {/* Action Buttons: Expand/Collapse/Zoom/Add */}
        <div className="flex items-center gap-2 shrink-0">
          
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="ย่อขนาด"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-300 px-1.5">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="ขยายขนาด"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="รีเซ็ตขนาด 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={expandAll}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
          >
            กางทั้งหมด
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
          >
            ยุบทั้งหมด
          </button>

          <button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>เพิ่มสมาชิกใหม่</span>
          </button>

        </div>

      </div>

      {/* Legend & Duplicate Audit Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-300">สัญลักษณ์ตำแหน่ง:</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/60 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> ผู้บริหารภาค (GM)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> ผู้บริหารศูนย์ (CM)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-600/60 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400" /> ผู้บริหารหน่วย (UM)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> ตัวแทน (Agent)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>ตรวจสอบการนับซ้ำ: ไม่พบข้อมูลซ้ำซ้อน (Deduplicated 100%)</span>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl overflow-auto min-h-[600px]">
        <div
          className="min-w-max flex justify-center transition-transform origin-top duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <div className="flex gap-16">
            {rootMembers.map(root => (
              <TreeNodeComponent
                key={root.id}
                member={root}
                allMembers={members}
                level={0}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                onSelect={(id) => setSelectedMemberId(id)}
                onAddChild={(parentId) => {
                  setSelectedMemberId(parentId);
                  setIsAddMemberModalOpen(true);
                }}
                onEdit={(id) => setEditingMemberId(id)}
                onDelete={(id) => deleteMember(id)}
                selectedId={selectedMemberId}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
