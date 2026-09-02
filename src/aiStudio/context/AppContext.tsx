import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Member, CompensationRuleSet, MemberIncomeResult, AuditLog, PositionLevel } from '../types';
import { INITIAL_MEMBERS } from '../data/mockMembers';
import { DEFAULT_COMPENSATION_RULES } from '../rules/defaultRules';
import { calculateMemberIncome, buildTeamHierarchy, TreeSubtreeStats } from '../rules/engine';
import { subscribeMembers, persistMember, removeMember } from '../firestoreBridge';

interface AppContextType {
  members: Member[];
  rules: CompensationRuleSet;
  selectedMemberId: string;
  setSelectedMemberId: (id: string) => void;
  selectedMember: Member | undefined;
  selectedMemberResult: MemberIncomeResult | undefined;
  allMemberResults: Map<string, MemberIncomeResult>;
  teamHierarchy: Map<string, TreeSubtreeStats>;
  auditLogs: AuditLog[];
  
  // Member actions
  addMember: (newMember: Omit<Member, 'id'>) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  resetMembersToDefault: () => void;
  
  // Rules actions
  updateRules: (newRules: CompensationRuleSet, changeNote: string) => void;
  approveRules: (approverName: string) => void;
  resetRulesToDefault: () => void;
  importRulesFromJson: (jsonStr: string) => boolean;
  
  // UI state
  activeTab: 'DASHBOARD' | 'TREE' | 'CALCULATOR' | 'GOAL' | 'ADMIN' | 'UNIT_TESTS';
  setActiveTab: (tab: 'DASHBOARD' | 'TREE' | 'CALCULATOR' | 'GOAL' | 'ADMIN' | 'UNIT_TESTS') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  userRole: 'ADMIN' | 'GROUP_MANAGER' | 'CENTER_MANAGER' | 'UNIT_MANAGER' | 'AGENT';
  setUserRole: (role: 'ADMIN' | 'GROUP_MANAGER' | 'CENTER_MANAGER' | 'UNIT_MANAGER' | 'AGENT') => void;
  
  // Modals
  isAddMemberModalOpen: boolean;
  setIsAddMemberModalOpen: (open: boolean) => void;
  editingMemberId: string | null;
  setEditingMemberId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_MEMBERS_KEY = 'ai_ins_sim_members_v1';
const LOCAL_STORAGE_RULES_KEY = 'ai_ins_sim_rules_v1';
const LOCAL_STORAGE_LOGS_KEY = 'ai_ins_sim_logs_v1';
const LOCAL_STORAGE_THEME_KEY = 'ai_ins_sim_theme_v1';

/**
 * Deep-merge a saved CompensationRuleSet onto the current defaults.
 * Ensures every nested tier array / field exists, so a stale or partial
 * localStorage payload can never crash a `.map()` in the UI (previously
 * caused a full-screen black render on the Admin Settings view).
 */
function mergeRules<T>(base: T, saved: unknown): T {
  if (Array.isArray(base)) {
    const src = Array.isArray(saved) ? saved : [];
    return (src.length ? src : base) as unknown as T;
  }
  if (base && typeof base === 'object') {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    if (saved && typeof saved === 'object') {
      for (const key of Object.keys(saved as Record<string, unknown>)) {
        const baseVal = (base as Record<string, unknown>)[key];
        const savedVal = (saved as Record<string, unknown>)[key];
        if (baseVal !== undefined && typeof baseVal === 'object') {
          out[key] = mergeRules(baseVal, savedVal);
        } else if (savedVal !== undefined && savedVal !== null) {
          out[key] = savedVal;
        }
      }
    }
    return out as unknown as T;
  }
  return (saved === undefined || saved === null ? base : saved) as unknown as T;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Members State
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved members', e);
      }
    }
    return INITIAL_MEMBERS;
  });

  // Rules State (merge with default to survive stale/partial localStorage data)
  const [rules, setRules] = useState<CompensationRuleSet>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_RULES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.unitManager && parsed.centerManager && parsed.groupManager) {
          // Deep-merge saved onto defaults so missing fields never crash the Admin editor.
          return mergeRules(DEFAULT_COMPENSATION_RULES, parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved rules', e);
      }
    }
    return DEFAULT_COMPENSATION_RULES;
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved logs', e);
      }
    }
    return [
      {
        id: 'LOG-INIT',
        timestamp: new Date().toISOString(),
        userEmail: 'system@simulator.internal',
        action: 'INITIALIZE_RULES',
        details: 'เริ่มต้นระบบด้วยกติกาอัปเดต 15 มกราคม 2564',
        newVersion: DEFAULT_COMPENSATION_RULES.version,
      },
    ];
  });

  // Selected Member
  const [selectedMemberId, setSelectedMemberId] = useState<string>('MEM-001');

  // UI state
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TREE' | 'CALCULATOR' | 'GOAL' | 'ADMIN' | 'UNIT_TESTS'>('DASHBOARD');
  const [userRole, setUserRole] = useState<'ADMIN' | 'GROUP_MANAGER' | 'CENTER_MANAGER' | 'UNIT_MANAGER' | 'AGENT'>('ADMIN');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modals
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_RULES_KEY, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Firestore realtime bridge: keep simulator members in sync with the shared member DB
  useEffect(() => {
    const unsub = subscribeMembers((remote, connected) => {
      if (connected && remote.length > 0) {
        setMembers(remote);
        setSelectedMemberId((prev) => (remote.some((m) => m.id === prev) ? prev : remote[0].id));
      }
    });
    return unsub;
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Calculations Memoization
  const teamHierarchy = useMemo(() => {
    return buildTeamHierarchy(members);
  }, [members]);

  const allMemberResults = useMemo(() => {
    const map = new Map<string, MemberIncomeResult>();
    members.forEach(m => {
      map.set(m.id, calculateMemberIncome(m, members, rules));
    });
    return map;
  }, [members, rules]);

  const selectedMember = useMemo(() => {
    return members.find(m => m.id === selectedMemberId) || members[0];
  }, [members, selectedMemberId]);

  const selectedMemberResult = useMemo(() => {
    if (!selectedMember) return undefined;
    return allMemberResults.get(selectedMember.id);
  }, [selectedMember, allMemberResults]);

  // Log action helper
  const recordLog = (action: string, details: string, prevVer?: string, newVer?: string) => {
    const logItem: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: `${userRole.toLowerCase()}@simulator.user`,
      action,
      details,
      previousVersion: prevVer,
      newVersion: newVer,
    };
    setAuditLogs(prev => [logItem, ...prev.slice(0, 99)]);
  };

  // Member CRUD
  const addMember = (newMemData: Omit<Member, 'id'>) => {
    const newId = `MEM-${String(Date.now()).slice(-4)}`;
    const created: Member = {
      ...newMemData,
      id: newId,
    };
    setMembers(prev => [...prev, created]);
    persistMember(created);
    recordLog('ADD_MEMBER', `เพิ่มสมาชิกใหม่: ${created.name} (${created.code}) ตำแหน่ง ${created.position}`);
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
    const target = members.find(m => m.id === id);
    if (target) persistMember({ ...target, ...updates });
    recordLog('UPDATE_MEMBER', `แก้ไขข้อมูลสมาชิก: ${target?.name || id}`);
  };

  const deleteMember = (id: string) => {
    const target = members.find(m => m.id === id);
    removeMember(id);
    // Re-assign subordinates to deleted member's parent
    setMembers(prev =>
      prev
        .filter(m => m.id !== id)
        .map(m => (m.parentId === id ? { ...m, parentId: target?.parentId || null } : m))
    );
    if (selectedMemberId === id) {
      setSelectedMemberId(members.find(m => m.id !== id)?.id || '');
    }
    recordLog('DELETE_MEMBER', `ลบสมาชิก: ${target?.name || id} และส่งต่อลูกทีมไปยังผู้จัดการสายงาน`);
  };

  const resetMembersToDefault = () => {
    setMembers(INITIAL_MEMBERS);
    setSelectedMemberId('MEM-001');
    recordLog('RESET_MEMBERS', 'รีเซ็ตข้อมูลสมาชิกและโครงสร้างสายงานกลับสู่ค่าเริ่มต้น 21 คน');
  };

  // Rules Actions
  const updateRules = (newRules: CompensationRuleSet, changeNote: string) => {
    const prevVersion = rules.version;
    const newVersion = `REV-${Date.now().toString().slice(-6)}`;
    const updated: CompensationRuleSet = {
      ...newRules,
      version: newVersion,
      updatedAt: new Date().toISOString().slice(0, 10),
      status: 'CUSTOM_APPROVED',
    };
    setRules(updated);
    recordLog('UPDATE_RULES', `แก้ไขกติกาค่าตอบแทน: ${changeNote}`, prevVersion, newVersion);
  };

  const approveRules = (approverName: string) => {
    setRules(prev => ({
      ...prev,
      status: 'CUSTOM_APPROVED',
      approvedBy: approverName,
      updatedAt: new Date().toISOString().slice(0, 10),
    }));
    recordLog('APPROVE_RULES', `อนุมัติกติกาสำหรับใช้งานจำลอง โดย ${approverName}`, rules.version, rules.version);
  };

  const resetRulesToDefault = () => {
    setRules(DEFAULT_COMPENSATION_RULES);
    recordLog('RESET_RULES', 'รีเซ็ตกติกากลับเป็นเอกสารมาตรฐาน 15 มกราคม 2564', rules.version, DEFAULT_COMPENSATION_RULES.version);
  };

  const importRulesFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.unitManager && parsed.centerManager && parsed.groupManager) {
        setRules(parsed);
        recordLog('IMPORT_RULES', 'นำเข้าการตั้งค่ากติกาจากไฟล์ JSON สำเร็จ');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import rules error', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        members,
        rules,
        selectedMemberId,
        setSelectedMemberId,
        selectedMember,
        selectedMemberResult,
        allMemberResults,
        teamHierarchy,
        auditLogs,
        addMember,
        updateMember,
        deleteMember,
        resetMembersToDefault,
        updateRules,
        approveRules,
        resetRulesToDefault,
        importRulesFromJson,
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        userRole,
        setUserRole,
        isAddMemberModalOpen,
        setIsAddMemberModalOpen,
        editingMemberId,
        setEditingMemberId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
