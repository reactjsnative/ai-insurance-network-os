import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Member, 
  Position, 
  CompensationPlanVersion, 
  CompensationRule, 
  AuditLog, 
  IncomeCalculationResult,
  CalculationType,
  UserRole,
  AuthProvider,
  AuthUser,
  LoginCredentials,
  RegisterCredentials
} from '../types';
import { DEFAULT_POSITIONS, INITIAL_PLAN_VERSION } from '../engine/compensationRules';
import { INITIAL_MEMBERS, INITIAL_AUDIT_LOGS, ROOT_LEADER } from '../data/initialData';
import { calculateTotalIncome, calculateDownlineMetrics } from '../engine/calculationEngine';
import { validateMemberRelationships } from '../engine/validation';
import { translations, Language } from '../i18n/translations';
import { AgentApplication, ApplicationStatus } from '../types/recruitment';
import { INITIAL_APPLICATIONS } from '../data/recruitmentData';
import { 
  db, 
  auth, 
  googleAuthProvider, 
  handleFirestoreError, 
  OperationType,
  testFirestoreConnection
} from '../lib/firebase';
import { safeGet, safeSet, safeRemove } from '../lib/safeStorage';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';

export type ActiveTab = 
  | 'dashboard'
  | 'network_success'
  | 'network_success_team_goal'
  | 'extracted_ai_network'
  | 'extracted_dashboard'
  | 'extracted_network_tree'
  | 'extracted_members'
  | 'extracted_registration'
  | 'extracted_auto_builder'
  | 'extracted_auto_sponsor'
  | 'extracted_calculator'
  | 'extracted_promotion'
  | 'extracted_simulator'
  | 'extracted_rules_editor'
  | 'extracted_audit_logs'
  | 'social_tiktok'
  | 'social_youtube'
  | 'social_facebook'
  | 'social_github'
  | 'ai_studio'
  | 'income_calculator'
  | 'organization'
  | 'network_visual'
  | 'career_path'
  | 'career_plan'
  | 'my_plan'
  | 'tiktok_ads'
  | 'member_sheet'
  | 'goals'
  | 'simulation_goals'
  | 'ai_coach'
  | 'recruit_agent'
  | 'members_mgmt'
  | 'compensation_admin'
  | 'reports'
  | 'settings'
  | 'video_library'
  | 'video_generator'
  | 'tiktok_links';

interface AppContextType {
  language: Language;
  t: (key: keyof typeof translations['th']) => string;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isFirebaseConnected: boolean;
  members: Member[];
  positions: Position[];
  planVersions: CompensationPlanVersion[];
  activePlan: CompensationPlanVersion;
  auditLogs: AuditLog[];
  activeUser: Member;
  currentUserRole: UserRole;
  selectedMember: Member | null;
  activeTab: ActiveTab;
  isPresentationMode: boolean;
  searchQuery: string;
  selectedNetworkView: 'tree' | 'radial' | 'galaxy' | 'geo';
  heatmapMode: boolean;

  // Authentication (Email, Google, TikTok, Facebook)
  authUser: AuthUser;
  showGatewayScreen: boolean;
  setShowGatewayScreen: (show: boolean) => void;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  authOAuthProvider: AuthProvider | null;
  authNotification: { type: 'success' | 'error' | 'info'; message: string } | null;
  openAuthModal: (tab?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  openOAuthPopup: (provider: AuthProvider) => void;
  closeOAuthPopup: () => void;
  setAuthNotification: (notif: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  loginWithEmail: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string; user?: AuthUser }>;
  loginWithSocial: (provider: 'google' | 'tiktok' | 'facebook', profile?: Partial<AuthUser>) => Promise<{ success: boolean; message: string; user?: AuthUser }>;
  registerWithEmail: (data: RegisterCredentials) => Promise<{ success: boolean; message: string; user?: AuthUser }>;
  linkSocialAccount: (provider: 'google' | 'tiktok' | 'facebook') => Promise<{ success: boolean; message: string }>;
  unlinkSocialAccount: (provider: 'google' | 'tiktok' | 'facebook') => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyResetCode: (code: string) => Promise<{ success: boolean; message: string; email?: string }>;
  confirmResetPassword: (code: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  requestResetOtp: (email: string) => Promise<{ success: boolean; message: string; mode: 'otp' | 'link'; requestId?: string }>;
  verifyResetOtp: (requestId: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string }>;

  // Recruitment
  applications: AgentApplication[];
  submitApplication: (appData: Omit<AgentApplication, 'id' | 'applicationNo' | 'submittedAt' | 'status'>) => { success: boolean; message: string; application: AgentApplication };
  updateApplicationStatus: (id: string, status: ApplicationStatus, reviewerNote?: string) => void;
  approveApplicationToMember: (id: string) => { success: boolean; message: string; member?: Member };
  
  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setActivePlanId: (planId: string) => void;
  setSelectedMember: (member: Member | null) => void;
  setSelectedMemberId: (memberId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedNetworkView: (view: 'tree' | 'radial' | 'galaxy' | 'geo') => void;
  setHeatmapMode: (enabled: boolean) => void;
  setIsPresentationMode: (enabled: boolean) => void;
  switchActiveUser: (memberId: string) => void;
  
  // CRUD & Business Actions
  addMember: (memberData: Partial<Member>) => { success: boolean; message: string; member?: Member };
  updateMember: (id: string, updates: Partial<Member>) => { success: boolean; message: string };
  deleteMember: (id: string) => { success: boolean; message: string };
  
  updateCompensationRule: (ruleId: string, updates: Partial<CompensationRule>, reason: string) => void;
  duplicatePlanVersion: (newCode: string, newName: string, reason: string) => void;
  
  calculateMemberIncome: (member: Member, calcType?: CalculationType) => IncomeCalculationResult;
  getDownlineStats: (memberId: string) => ReturnType<typeof calculateDownlineMetrics>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = safeGet('insure_os_lang');
    return (saved === 'en' || saved === 'th') ? saved : 'th';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    safeSet('insure_os_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'th' ? 'en' : 'th');
  };

  const t = (key: keyof typeof translations['th']): string => {
    const dict = translations[language] || translations.th;
    return dict[key] || translations.th[key] || String(key);
  };

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Initialize Firebase connection check and Auth listener + redirect result (mobile)
  useEffect(() => {
    testFirestoreConnection().then(connected => {
      setIsFirebaseConnected(connected);
    });

    // Mobile: Google sign-in via redirect returns to this page with a result.
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          try {
            const { authUser: u, member: m } = await buildAuthUserFromFirebase(result.user, 'google');
            setAuthUser(u);
            setActiveUser(m);
            setAuthOAuthProvider(null);
            setShowGatewayScreen(false);
            const log: AuditLog = {
              id: `log_${Date.now()}`,
              timestamp: new Date().toISOString(),
              userId: m.id,
              userName: m.name,
              action: 'LOGIN_GOOGLE',
              entityType: 'settings',
              entityId: u.email,
              oldValue: 'Logged Out',
              newValue: 'Logged In via Google',
              reason: 'เข้าสู่ระบบผ่าน Google OAuth สำเร็จ (redirect)',
            };
            setAuditLogs(prev => [log, ...prev]);
            setDoc(doc(db, 'auditLogs', log.id), log).catch(err => {
              handleFirestoreError(err, OperationType.CREATE, `auditLogs/${log.id}`);
            });
            setAuthNotification({ type: 'success', message: `เข้าสู่ระบบสำเร็จผ่าน Google (${u.name})` });
          } catch (e) {
            console.warn('redirect login processing error:', e);
          }
        }
      })
      .catch((e) => console.warn('getRedirectResult:', e?.message || e));

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsFirebaseConnected(true);
      }
    });

    return () => unsubAuth();
  }, []);

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = safeGet('insure_os_members_v3');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [positions, setPositions] = useState<Position[]>(DEFAULT_POSITIONS);

  const [planVersions, setPlanVersions] = useState<CompensationPlanVersion[]>([INITIAL_PLAN_VERSION]);
  const [activePlanId, setActivePlanIdState] = useState<string>(INITIAL_PLAN_VERSION.id);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Firestore Realtime Listener for Members
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'members'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteMembers: Member[] = [];
          snapshot.forEach(docSnap => {
            remoteMembers.push(docSnap.data() as Member);
          });
          setMembers(remoteMembers);
          safeSet('insure_os_members_v3', JSON.stringify(remoteMembers));
        } else {
          // Auto-seed Firestore on initial setup
          INITIAL_MEMBERS.forEach(m => {
            setDoc(doc(db, 'members', m.id), m).catch(err => {
              handleFirestoreError(err, OperationType.CREATE, `members/${m.id}`);
            });
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'members');
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firestore members listener init:', e);
    }
  }, []);

  // Firestore Realtime Listener for Applications
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'applications'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteApps: AgentApplication[] = [];
          snapshot.forEach(docSnap => {
            remoteApps.push(docSnap.data() as AgentApplication);
          });
          setApplications(remoteApps);
        } else {
          INITIAL_APPLICATIONS.forEach(app => {
            setDoc(doc(db, 'applications', app.id), app).catch(err => {
              handleFirestoreError(err, OperationType.CREATE, `applications/${app.id}`);
            });
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'applications');
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firestore applications listener init:', e);
    }
  }, []);

  // Firestore Realtime Listener for Audit Logs
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'auditLogs'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteLogs: AuditLog[] = [];
          snapshot.forEach(docSnap => {
            remoteLogs.push(docSnap.data() as AuditLog);
          });
          setAuditLogs(remoteLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } else {
          INITIAL_AUDIT_LOGS.forEach(log => {
            setDoc(doc(db, 'auditLogs', log.id), log).catch(err => {
              handleFirestoreError(err, OperationType.CREATE, `auditLogs/${log.id}`);
            });
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'auditLogs');
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firestore auditLogs listener init:', e);
    }
  }, []);
  
  const [activeUser, setActiveUser] = useState<Member>(ROOT_LEADER);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Authentication State — starts LOGGED OUT (real Firebase auth required)
  const initialAuthUser: AuthUser = {
    id: '',
    email: '',
    name: '',
    avatarUrl: '',
    provider: 'email',
    connectedProviders: [],
    memberId: '',
    role: 'viewer',
    positionId: 'agent',
    isLoggedIn: false,
    lastLoginAt: '',
    is2FAEnabled: false,
    token: '',
  };

  const [authUser, setAuthUser] = useState<AuthUser>(() => {
    const saved = safeGet('insure_os_auth_user_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AuthUser;
        // Only restore a session explicitly marked as logged-in.
        if (parsed && parsed.isLoggedIn) return parsed;
      } catch (e) {
        // ignore parse error
      }
    }
    return initialAuthUser;
  });

  // Require authentication: show the login gateway unless a valid session exists.
  const [showGatewayScreen, setShowGatewayScreen] = useState<boolean>(() => !authUser.isLoggedIn);

  useEffect(() => {
    safeSet('insure_os_auth_user_v3', JSON.stringify(authUser));
  }, [authUser]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [authOAuthProvider, setAuthOAuthProvider] = useState<AuthProvider | null>(null);
  const [authNotification, setAuthNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const openAuthModal = (tab: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openOAuthPopup = (provider: AuthProvider) => {
    setAuthOAuthProvider(provider);
  };

  const closeOAuthPopup = () => {
    setAuthOAuthProvider(null);
  };

  // Map a real Firebase Auth user → app AuthUser, with least-privilege defaults.
  const buildAuthUserFromFirebase = async (fbUser: any, provider: AuthProvider): Promise<{ authUser: AuthUser; member: Member }> => {
    const email = (fbUser.email || '').toLowerCase();
    const token = await fbUser.getIdToken();

    let member = members.find(m => (m.email || '').toLowerCase() === email) || null;

    if (!member) {
      // Unknown user → least-privilege agent record (NEVER super_admin).
      const fallbackName = fbUser.displayName || email.split('@')[0] || 'สมาชิกใหม่';
      member = {
        id: `mem_${fbUser.uid}`,
        memberCode: `AG-${String(fbUser.uid || '').slice(0, 6).toUpperCase()}`,
        name: fallbackName,
        nickname: fallbackName.split(' ')[0],
        avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        positionId: 'agent',
        role: 'agent',
        sponsorId: ROOT_LEADER.id,
        parentMemberId: ROOT_LEADER.id,
        unitId: null,
        centerId: null,
        regionId: null,
        joinDate: new Date().toISOString().slice(0, 10),
        status: 'active',
        email,
        personalFYC: 0,
        personalCOM: 0,
        firstYearPremium: 0,
        renewalPremium: 0,
        location: { province: 'กรุงเทพมหานคร', region: 'Bangkok & Metro', lat: 13.7563, lng: 100.5018 },
      };
      setMembers(prev => [member as Member, ...prev]);
    }

    const authUser: AuthUser = {
      id: fbUser.uid,
      email,
      name: member.name,
      avatarUrl: member.avatarUrl,
      provider,
      connectedProviders: [provider],
      memberId: member.id,
      role: member.role,
      positionId: member.positionId,
      isLoggedIn: true,
      lastLoginAt: new Date().toISOString(),
      is2FAEnabled: false,
      token,
    };

    return { authUser, member };
  };

  // Translate Firebase auth error codes into friendly Thai messages.
  const translateAuthError = (err: any): string => {
    const code = err?.code || '';
    const map: Record<string, string> = {
      'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
      'auth/user-not-found': 'ไม่พบบัญชีผู้ใช้นี้',
      'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง',
      'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว',
      'auth/weak-password': 'รหัสผ่านอ่อนเกินไป (อย่างน้อย 6 ตัวอักษร)',
      'auth/user-disabled': 'บัญชีนี้ถูกปิดใช้งาน',
      'auth/too-many-requests': 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่',
      'auth/network-request-failed': 'เชื่อมต่อเครือข่ายไม่สำเร็จ',
      'auth/popup-closed-by-user': 'ยกเลิกการเข้าสู่ระบบแล้ว',
      'auth/operation-not-allowed': 'ช่องทางล็อกอินนี้ยังไม่ถูกเปิดใช้งาน — ไปที่ Firebase Console → Authentication → Sign-in method แล้วเปิด Email/Password และ Google',
      'auth/unauthorized-domain': 'โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase — ไปที่ Firebase Console → Authentication → Settings → Authorized domains แล้วเพิ่ม ai-insurance-network-os.vercel.app',
      'auth/account-exists-with-different-credential': 'อีเมลนี้ถูกใช้กับช่องทางล็อกอินอื่นแล้ว กรุณาใช้ช่องทางเดิม',
      'auth/invalid-api-key': 'การตั้งค่า Firebase ไม่ถูกต้อง',
      'auth/invalid-action-code': 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุแล้ว',
      'auth/expired-action-code': 'รหัสยืนยันหมดอายุแล้ว กรุณาขอรหัสใหม่',
    };
    return map[code] || err?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
  };

  const loginWithEmail = async (credentials: LoginCredentials) => {
    const email = (credentials.email || '').trim().toLowerCase();
    const password = credentials.password || '';

    if (!email || !password) {
      return { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const { authUser: updatedUser, member } = await buildAuthUserFromFirebase(cred.user, 'email');

      setAuthUser(updatedUser);
      setActiveUser(member);
      setIsAuthModalOpen(false);
      setShowGatewayScreen(false);

      const log: AuditLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: member.id,
        userName: member.name,
        action: 'LOGIN_EMAIL',
        entityType: 'settings',
        entityId: email,
        oldValue: 'Logged Out',
        newValue: `Logged In (${email})`,
        reason: 'เข้าสู่ระบบด้วย Email & Password สำเร็จ',
      };
      setAuditLogs(prev => [log, ...prev]);

      setAuthNotification({
        type: 'success',
        message: `เข้าสู่ระบบสำเร็จในชื่อ ${member.name} (${email})`
      });

      return { success: true, message: 'เข้าสู่ระบบสำเร็จ', user: updatedUser };
    } catch (err) {
      const message = translateAuthError(err);
      setAuthNotification({ type: 'error', message });
      return { success: false, message };
    }
  };

  const loginWithSocial = async (provider: 'google' | 'tiktok' | 'facebook' | 'github' | 'gitlab' | 'bitbucket', profile?: Partial<AuthUser>) => {
    // TikTok & Facebook: use provided profile (mock/demo) or real TikTok API profile when available.
    if (provider === 'tiktok' || provider === 'facebook' || provider === 'github') {
      const email = (profile?.email || '').toLowerCase().trim();
      const displayName = profile?.name || (provider === 'tiktok' ? 'TikTok User' : provider === 'facebook' ? 'Facebook User' : 'GitHub User');
      const avatarUrl = profile?.avatarUrl || (provider === 'tiktok'
        ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
      if (!email) {
        const message = `ไม่พบอีเมลจาก ${provider.toUpperCase()} กรุณาลองใหม่`;
        setAuthNotification({ type: 'error', message });
        return { success: false, message };
      }
      // Find or create member linked to this social email — least-privilege agent.
      let member = members.find(m => (m.email || '').toLowerCase() === email) || null;
      const uid = profile?.id || `tiktok_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      if (!member) {
        member = {
          id: `mem_${uid}`,
          memberCode: `AG-${String(uid).slice(-6).toUpperCase()}`,
          name: displayName,
          nickname: displayName.split(' ')[0],
          avatarUrl,
          positionId: 'agent',
          role: 'agent',
          sponsorId: ROOT_LEADER.id,
          parentMemberId: ROOT_LEADER.id,
          unitId: null,
          centerId: null,
          regionId: null,
          joinDate: new Date().toISOString().slice(0, 10),
          status: 'active',
          email,
          personalFYC: 0,
          personalCOM: 0,
          firstYearPremium: 0,
          renewalPremium: 0,
          location: { province: 'กรุงเทพมหานคร', region: 'Bangkok & Metro', lat: 13.7563, lng: 100.5018 },
        };
        setMembers(prev => [member as Member, ...prev]);
        setDoc(doc(db, 'members', member!.id), member as Member).catch(err => {
          handleFirestoreError(err, OperationType.CREATE, `members/${member!.id}`);
        });
      }
      const authUserData: AuthUser = {
        id: uid,
        email,
        name: member.name,
        avatarUrl: member.avatarUrl,
        provider,
        connectedProviders: [provider],
        memberId: member.id,
        role: member.role,
        positionId: member.positionId,
        isLoggedIn: true,
        lastLoginAt: new Date().toISOString(),
        is2FAEnabled: false,
        token: `mock_${provider}_token_${Date.now()}`,
        ...(provider === 'tiktok' ? { tiktokHandle: profile?.tiktokHandle || '@tiktok_user' } : {}),
        ...(provider === 'facebook' ? { facebookId: profile?.facebookId || email } : {}),
      };
      setAuthUser(authUserData);
      setActiveUser(member);
      setIsAuthModalOpen(false);
      setAuthOAuthProvider(null);
      setShowGatewayScreen(false);
      const action = provider === 'tiktok' ? 'LOGIN_TIKTOK' : provider === 'facebook' ? 'LOGIN_FACEBOOK' : 'LOGIN_GITHUB';
      const log: AuditLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: member.id,
        userName: member.name,
        action: action as any,
        entityType: 'settings',
        entityId: email,
        oldValue: 'Logged Out',
        newValue: `Logged In via ${provider.toUpperCase()}`,
        reason: provider === 'tiktok' ? 'เข้าสู่ระบบผ่าน TikTok OAuth สำเร็จ' : provider === 'facebook' ? 'เข้าสู่ระบบผ่าน Facebook OAuth สำเร็จ' : 'เข้าสู่ระบบผ่าน GitHub OAuth สำเร็จ',
      };
      setAuditLogs(prev => [log, ...prev]);
      setDoc(doc(db, 'auditLogs', log.id), log).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `auditLogs/${log.id}`);
      });
      const successMsg = provider === 'tiktok' ? `เข้าสู่ระบบด้วย TikTok สำเร็จ (${displayName})` : provider === 'facebook' ? `เข้าสู่ระบบด้วย Facebook สำเร็จ (${displayName})` : `เข้าสู่ระบบด้วย GitHub สำเร็จ (${displayName})`;
      setAuthNotification({ type: 'success', message: successMsg });
      return { success: true, message: successMsg, user: authUserData };
    }
    if (provider !== 'google') {
      const message = `ล็อกอินด้วย ${provider.toUpperCase()} ยังไม่พร้อมใช้งาน — โปรดใช้ Google, TikTok, Facebook, GitHub หรือ Email`;
      setAuthNotification({ type: 'error', message });
      return { success: false, message };
    }

    try {
      // Mobile: popup sign-in is unreliable (blank/slow screen after auth) → use redirect flow.
      const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
      if (isMobile) {
        await signInWithRedirect(auth, googleAuthProvider);
        // Page will navigate to Google and come back — result handled in getRedirectResult.
        return { success: true, message: 'กำลังเชื่อมต่อ Google...' };
      }

      const result = await signInWithPopup(auth, googleAuthProvider);
      if (!result || !result.user) {
        const message = 'ไม่ได้รับข้อมูลผู้ใช้จาก Google กรุณาลองใหม่';
        setAuthNotification({ type: 'error', message });
        return { success: false, message };
      }

      const { authUser: updatedUser, member } = await buildAuthUserFromFirebase(result.user, 'google');

      setAuthUser(updatedUser);
      setActiveUser(member);
      setIsAuthModalOpen(false);
      setAuthOAuthProvider(null);
      setShowGatewayScreen(false);

      const log: AuditLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: member.id,
        userName: member.name,
        action: 'LOGIN_GOOGLE',
        entityType: 'settings',
        entityId: updatedUser.email,
        oldValue: 'Logged Out',
        newValue: 'Logged In via Google',
        reason: 'เข้าสู่ระบบผ่าน Google OAuth สำเร็จ',
      };
      setAuditLogs(prev => [log, ...prev]);

      setDoc(doc(db, 'auditLogs', log.id), log).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `auditLogs/${log.id}`);
      });

      setAuthNotification({
        type: 'success',
        message: `เข้าสู่ระบบสำเร็จผ่าน Google (${updatedUser.name})`
      });

      return { success: true, message: 'เข้าสู่ระบบผ่าน Google สำเร็จ', user: updatedUser };
    } catch (err) {
      const message = translateAuthError(err);
      setAuthNotification({ type: 'error', message });
      return { success: false, message };
    }
  };

  const registerWithEmail = async (data: RegisterCredentials) => {
    if (!data.email || !data.password) {
      return { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }

    // Create the real Firebase Auth account first (identity layer).
    let fbUser: any = null;
    let token = '';
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      fbUser = cred.user;
      token = await fbUser.getIdToken();
    } catch (err) {
      const message = translateAuthError(err);
      setAuthNotification({ type: 'error', message });
      return { success: false, message };
    }

    const newMemberId = `mem_${fbUser.uid}`;
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const memberCode = `AG-${randomSeq}`;

    // Identity consistency: if this email already exists as a member, reuse that record
    // (สมัคร 1 คน = คนคนเดียวกันในระบบ) instead of creating a duplicate member.
    const existingMember = members.find(m => (m.email || '').toLowerCase() === String(data.email).toLowerCase());
    if (existingMember) {
      const reusedUser: AuthUser = {
        id: fbUser.uid,
        email: data.email,
        name: existingMember.name,
        avatarUrl: existingMember.avatarUrl,
        provider: 'email',
        connectedProviders: ['email'],
        memberId: existingMember.id,
        role: existingMember.role,
        positionId: existingMember.positionId,
        isLoggedIn: true,
        lastLoginAt: new Date().toISOString(),
        phone: existingMember.phone || data.phone || '080-000-0000',
        token,
      };
      setAuthUser(reusedUser);
      setActiveUser(existingMember);
      setIsAuthModalOpen(false);
      setShowGatewayScreen(false);
      setAuthNotification({ type: 'success', message: `เข้าสู่ระบบด้วยสมาชิกเดิมในระบบแล้ว (รหัส ${existingMember.memberCode})` });
      return { success: true, message: 'พบสมาชิกเดิมในระบบ — ผูกบัญชีเข้าสู่ระบบเรียบร้อย', user: reusedUser };
    }

    const newMember: Member = {
      id: newMemberId,
      memberCode,
      name: data.name,
      nickname: data.name.split(' ')[0],
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      positionId: data.positionId || 'agent',
      role: 'agent',
      sponsorId: ROOT_LEADER.id,
      parentMemberId: ROOT_LEADER.id,
      unitId: 'unit_1',
      centerId: 'center_1',
      regionId: 'reg_1',
      joinDate: new Date().toISOString().slice(0, 10),
      status: 'active',
      personalFYC: 0,
      personalCOM: 0,
      firstYearPremium: 0,
      renewalPremium: 0,
      location: {
        province: 'กรุงเทพมหานคร',
        region: 'Bangkok & Metro',
        lat: 13.7563,
        lng: 100.5018,
      },
    };

    setMembers(prev => [newMember, ...prev]);

    // Persist the new member to Firestore so it appears for every user/device
    // (the app's real-time `members` listener reads from this collection).
    setDoc(doc(db, 'members', newMember.id), newMember).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `members/${newMember.id}`);
    });

    const updatedUser: AuthUser = {
      id: fbUser.uid,
      email: data.email,
      name: data.name,
      avatarUrl: newMember.avatarUrl,
      provider: 'email',
      connectedProviders: ['email'],
      memberId: newMember.id,
      role: 'agent',
      positionId: 'agent',
      isLoggedIn: true,
      lastLoginAt: new Date().toISOString(),
      phone: data.phone || '080-000-0000',
      token,
    };

    setAuthUser(updatedUser);
    setActiveUser(newMember);
    setIsAuthModalOpen(false);
    setShowGatewayScreen(false);

    const log: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: newMember.id,
      userName: newMember.name,
      action: 'REGISTER_ACCOUNT',
      entityType: 'member',
      entityId: newMember.id,
      oldValue: 'None',
      newValue: `${newMember.name} (${newMember.memberCode})`,
      reason: `สมัครสมาชิกบัญชีผู้ใช้ใหม่ผ่าน ${data.provider || 'Email'}`,
    };
    setAuditLogs(prev => [log, ...prev]);

    setAuthNotification({
      type: 'success',
      message: `สร้างบัญชีตัวแทนสำเร็จ รหัสสมาชิก: ${memberCode}`
    });

    // Sync new member to external stores (local JSON + Google Sheets + Vercel DB) – fire and forget
    try {
      const { toStoredRow, saveMemberLocal } = await import('../lib/localStore');
      const { appendMemberToSheet } = await import('../lib/sheetsSync');
      const { saveMemberToVercel } = await import('../lib/vercelDb');
      const row = toStoredRow(newMember, updatedUser);
      saveMemberLocal(row);
      appendMemberToSheet(newMember, updatedUser);
      saveMemberToVercel(newMember, updatedUser);
    } catch (syncErr) {
      console.warn('[registerWithEmail] external sync skipped:', syncErr);
    }

    // Notify owner via Telegram + LINE (skips silently if tokens not configured)
    try {
      const { notifyNewMember } = await import('../lib/notifier');
      notifyNewMember(newMember, updatedUser);
    } catch (e) { /* ignore */ }

    return { success: true, message: 'สมัครสมาชิกสำเร็จ', user: updatedUser };
  };

  const linkSocialAccount = async (provider: 'google' | 'tiktok' | 'facebook' | 'github' | 'gitlab' | 'bitbucket') => {
    setAuthUser(prev => ({
      ...prev,
      connectedProviders: Array.from(new Set([...prev.connectedProviders, provider])),
    }));

    setAuthNotification({
      type: 'success',
      message: `เชื่อมต่อบัญชี ${provider.toUpperCase()} เรียบร้อยแล้ว`
    });

    return { success: true, message: `เชื่อมต่อ ${provider} สำเร็จ` };
  };

  const unlinkSocialAccount = async (provider: 'google' | 'tiktok' | 'facebook' | 'github' | 'gitlab' | 'bitbucket') => {
    if (authUser.connectedProviders.length <= 1) {
      setAuthNotification({
        type: 'error',
        message: 'ต้องมีวิธีการเข้าสู่ระบบอย่างน้อย 1 ช่องทาง'
      });
      return { success: false, message: 'ไม่สามารถยกเลิกได้ ต้องมีอย่างน้อย 1 ช่องทาง' };
    }

    setAuthUser(prev => ({
      ...prev,
      connectedProviders: prev.connectedProviders.filter(p => p !== provider),
    }));

    setAuthNotification({
      type: 'info',
      message: `ยกเลิกการเชื่อมต่อบัญชี ${provider.toUpperCase()} แล้ว`
    });

    return { success: true, message: `ยกเลิกการเชื่อมต่อ ${provider} สำเร็จ` };
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase sign out:', e);
    }
    // Fully clear the session — no sensitive data retained.
    setAuthUser({ ...initialAuthUser });
    setShowGatewayScreen(true);
    safeRemove('insure_os_auth_user_v3');

    setAuthNotification({
      type: 'info',
      message: 'ออกจากระบบเรียบร้อยแล้ว'
    });
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'กรุณากรอกอีเมลให้ถูกต้อง' };
    }
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'ส่งอีเมลรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องข้อความ' };
    } catch (err) {
      const message = translateAuthError(err);
      return { success: false, message };
    }
  };

  const verifyResetCode = async (code: string): Promise<{ success: boolean; message: string; email?: string }> => {
    if (!code) {
      return { success: false, message: 'กรุณากรอกรหัสยืนยัน' };
    }
    try {
      const email = await verifyPasswordResetCode(auth, code);
      return { success: true, message: 'รหัสยืนยันถูกต้อง', email };
    } catch (err) {
      return { success: false, message: translateAuthError(err) };
    }
  };

  const confirmResetPassword = async (code: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!code) {
      return { success: false, message: 'รหัสยืนยันไม่ถูกต้อง' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' };
    }
    try {
      await confirmPasswordReset(auth, code, newPassword);
      return { success: true, message: 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว' };
    } catch (err) {
      return { success: false, message: translateAuthError(err) };
    }
  };

  const requestResetOtp = async (email: string): Promise<{ success: boolean; message: string; mode: 'otp' | 'link'; requestId?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'กรุณากรอกอีเมลให้ถูกต้อง', mode: 'link' };
    }
    const trimmed = email.trim().toLowerCase();
    try {
      const res = await fetch('/api/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!res.ok || !ct.includes('application/json')) {
        throw new Error('otp_endpoint_unavailable');
      }
      const data = await res.json();
      if (data.ok) {
        return {
          success: true,
          message: 'ส่งรหัส OTP (6 หลัก) ไปยังอีเมลของคุณแล้ว',
          mode: 'otp',
          requestId: data.requestId || '',
        };
      }
      if (data.code === 'RATE_LIMITED') {
        return { success: false, message: 'ขอรหัสบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่', mode: 'otp' };
      }
      if (data.code === 'INVALID_EMAIL') {
        return { success: false, message: 'กรุณากรอกอีเมลให้ถูกต้อง', mode: 'link' };
      }
      throw new Error('otp_not_configured');
    } catch (err) {
      // Fallback to the Firebase password-reset link flow.
      try {
        await sendPasswordResetEmail(auth, trimmed);
        return { success: true, message: 'ส่งอีเมลรีเซ็ตรหัสผ่านไปแล้ว กรุณาตรวจสอบกล่องข้อความ', mode: 'link' };
      } catch (fbErr) {
        return { success: false, message: translateAuthError(fbErr), mode: 'link' };
      }
    }
  };

  const verifyResetOtp = async (requestId: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!requestId || !code) {
      return { success: false, message: 'รหัสยืนยันไม่ถูกต้อง' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' };
    }
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, code, newPassword }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        return { success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
      }
      const data = await res.json();
      if (data.ok) {
        return { success: true, message: 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว' };
      }
      switch (data.code) {
        case 'INVALID_OR_EXPIRED':
          return { success: false, message: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว' };
        case 'TOO_MANY_ATTEMPTS':
          return { success: false, message: 'กรอกรหัสผิดหลายครั้งเกินไป กรุณาขอรหัสใหม่' };
        case 'WEAK_PASSWORD':
          return { success: false, message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' };
        case 'ADMIN_NOT_CONFIGURED':
        case 'EMAIL_NOT_CONFIGURED':
          return { success: false, message: 'ระบบ OTP ยังไม่พร้อมใช้งาน กรุณาใช้ลิงก์รีเซ็ตทางอีเมลแทน' };
        default:
          return { success: false, message: data.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
      }
    } catch (err) {
      return { success: false, message: 'เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่' };
    }
  };
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNetworkView, setSelectedNetworkView] = useState<'tree' | 'radial' | 'galaxy' | 'geo'>('tree');
  const [heatmapMode, setHeatmapMode] = useState<boolean>(false);

  const [applications, setApplications] = useState<AgentApplication[]>(() => {
    const saved = safeGet('insure_os_applications_v2');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  // Save applications to localStorage
  useEffect(() => {
    safeSet('insure_os_applications_v2', JSON.stringify(applications));
  }, [applications]);

  const submitApplication = (appData: Omit<AgentApplication, 'id' | 'applicationNo' | 'submittedAt' | 'status'>) => {
    const newId = `app_${Date.now()}`;
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const applicationNo = `APP-${yearMonth}-${randomSeq}`;

    const newApp: AgentApplication = {
      ...appData,
      id: newId,
      applicationNo,
      submittedAt: new Date().toISOString(),
      status: 'pending_review',
    };

    setApplications(prev => [newApp, ...prev]);

    // Save to Firestore applications collection
    setDoc(doc(db, 'applications', newId), newApp).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `applications/${newId}`);
    });

    // Add audit log
    const log: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: activeUser.id,
      userName: activeUser.name,
      action: 'SUBMIT_APPLICATION',
      entityType: 'member',
      entityId: newId,
      oldValue: 'None',
      newValue: `${newApp.prefix} ${newApp.firstName} ${newApp.lastName} (${applicationNo})`,
      reason: `ยื่นใบสมัครตัวแทนใหม่ ผู้แนะนำ: ${newApp.sponsorName} (${newApp.sponsorCode})`,
    };
    setAuditLogs(prev => [log, ...prev]);

    setDoc(doc(db, 'auditLogs', log.id), log).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `auditLogs/${log.id}`);
    });

    return {
      success: true,
      message: 'ยื่นใบสมัครตัวแทนประกันชีวิตเรียบร้อยแล้ว รหัสใบสมัคร: ' + applicationNo,
      application: newApp
    };
  };

  const updateApplicationStatus = (id: string, status: ApplicationStatus, reviewerNote?: string) => {
    const updatedApps = applications.map(app => {
      if (app.id === id) {
        return {
          ...app,
          status,
          reviewerNote: reviewerNote !== undefined ? reviewerNote : app.reviewerNote,
          reviewedBy: activeUser.name,
          reviewedAt: new Date().toISOString(),
        };
      }
      return app;
    });
    setApplications(updatedApps);

    const appToUpdate = updatedApps.find(a => a.id === id);
    if (appToUpdate) {
      updateDoc(doc(db, 'applications', id), {
        status,
        reviewerNote: appToUpdate.reviewerNote || '',
        reviewedBy: activeUser.name,
        reviewedAt: appToUpdate.reviewedAt,
      }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `applications/${id}`);
      });
    }

    const log: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: activeUser.id,
      userName: activeUser.name,
      action: 'UPDATE_APPLICATION_STATUS',
      entityType: 'member',
      entityId: id,
      oldValue: 'Previous Status',
      newValue: status,
      reason: reviewerNote || `ปรับสถานะใบสมัครเป็น ${status}`,
    };
    setAuditLogs(prev => [log, ...prev]);

    setDoc(doc(db, 'auditLogs', log.id), log).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `auditLogs/${log.id}`);
    });
  };

  const approveApplicationToMember = (id: string) => {
    const app = applications.find(a => a.id === id);
    if (!app) return { success: false, message: 'ไม่พบใบสมัคร' };

    // Find sponsor member
    const sponsor = members.find(m => m.id === app.sponsorMemberId || m.memberCode === app.sponsorCode) || ROOT_LEADER;

    // Create new Member from application
    const positionId = app.targetPositionPreference === 'unit_manager_fast_track' ? 'unit_manager' :
                       app.targetPositionPreference === 'center_executive_track' ? 'center_manager' : 'agent';
    
    const newMemberResult = addMember({
      name: `${app.firstName} ${app.lastName}`,
      nickname: app.nickname ? `น้อง${app.nickname}` : '',
      positionId: positionId,
      sponsorId: sponsor.id,
      parentMemberId: sponsor.id,
      unitId: sponsor.unitId,
      centerId: sponsor.centerId,
      regionId: sponsor.regionId,
      phone: app.phone,
      email: app.email,
      location: {
        province: app.province,
        region: app.region,
        lat: sponsor.location.lat + (Math.random() - 0.5) * 0.05,
        lng: sponsor.location.lng + (Math.random() - 0.5) * 0.05,
      },
      personalFYC: Math.round(app.targetYearlyFYCGoal / 12),
      personalCOM: Math.round((app.targetYearlyFYCGoal / 12) * 0.35),
      firstYearPremium: Math.round((app.targetYearlyFYCGoal / 12) * 3),
      renewalPremium: 0,
    });

    if (!newMemberResult.success || !newMemberResult.member) {
      return { success: false, message: newMemberResult.message };
    }

    // Update application status to approved
    setApplications(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'approved',
          assignedMemberCode: newMemberResult.member?.memberCode,
          reviewedBy: activeUser.name,
          reviewedAt: new Date().toISOString(),
          reviewerNote: (a.reviewerNote ? a.reviewerNote + ' | ' : '') + `อนุมัติบรรจุเป็นตัวแทน รหัส ${newMemberResult.member?.memberCode}`,
        };
      }
      return a;
    }));

    return {
      success: true,
      message: `อนุมัติใบสมัครและบรรจุตัวแทนสำเร็จ รหัสตัวแทนใหม่: ${newMemberResult.member.memberCode}`,
      member: newMemberResult.member
    };
  };

  // Save to localStorage when members change
  useEffect(() => {
    safeSet('insure_os_members_v3', JSON.stringify(members));
  }, [members]);

  const activePlan = planVersions.find(p => p.id === activePlanId) || planVersions[0];

  const switchActiveUser = (memberId: string) => {
    const found = members.find(m => m.id === memberId);
    if (found) {
      setActiveUser(found);
    }
  };

  const getDownlineStats = (memberId: string) => {
    return calculateDownlineMetrics(memberId, members);
  };

  const calculateMemberIncome = (member: Member, calcType: CalculationType = 'ACTUAL'): IncomeCalculationResult => {
    const stats = getDownlineStats(member.id);

    // Get separate FYC of subordinate centers if regional manager
    const subordinateCenterFYCs = members
      .filter(m => m.positionId === 'center_manager' && (m.parentMemberId === member.id || m.sponsorId === member.id))
      .map(c => {
        const cStats = calculateDownlineMetrics(c.id, members);
        return c.personalFYC + cStats.teamFYC;
      });

    return calculateTotalIncome({
      memberId: member.id,
      positionId: member.positionId,
      personalFYC: member.personalFYC,
      teamFYC: member.personalFYC + stats.teamFYC,
      personalCOM: member.personalCOM,
      teamCOM: member.personalCOM + stats.teamCOM,
      firstYearPremium: member.firstYearPremium,
      renewalPremium: member.renewalPremium,
      directMembersCount: stats.directCount,
      activeMembersCount: stats.activeDownlineCount + (member.status === 'active' ? 1 : 0),
      separatedUnitsCount: member.separatedUnitsCount || stats.totalUnits,
      separatedCentersCount: member.separatedCentersCount || stats.totalCenters,
      separatedRegionsCount: member.separatedRegionsCount || stats.totalRegions,
      centerFycList: subordinateCenterFYCs.length > 0 ? subordinateCenterFYCs : undefined,
      annualFYC: (member.personalFYC + stats.teamFYC) * 12,
      annualCOM: (member.personalCOM + stats.teamCOM) * 12,
      calculationType: calcType,
      planVersion: activePlan,
    });
  };

  const addMember = (memberData: Partial<Member>) => {
    // Identity consistency: same email = same person in the system — reuse existing record instead of duplicating
    if (memberData.email) {
      const existing = members.find(m => (m.email || '').toLowerCase() === String(memberData.email).toLowerCase());
      if (existing) {
        return { success: true, message: 'สมาชิกนี้มีในระบบอยู่แล้ว (อีเมลเดียวกัน) — ใช้ข้อมูลเดิมโดยไม่สร้างซ้ำ', member: existing, reused: true };
      }
    }
    const newId = `mem_${Date.now()}`;
    const codePrefix = memberData.positionId === 'region_manager' ? 'RM' :
                       memberData.positionId === 'center_manager' ? 'CM' :
                       memberData.positionId === 'unit_manager' ? 'UM' : 'AG';
    let newCode = `${codePrefix}-${Math.floor(100 + Math.random() * 900)}`;
    // Ensure the member code is unique across the whole system
    let codeGuard = 0;
    while (members.some(m => m.memberCode === newCode) && codeGuard++ < 50) {
      newCode = `${codePrefix}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const newMember: Member = {
      id: newId,
      memberCode: newCode,
      name: memberData.name || 'ตัวแทนใหม่',
      nickname: memberData.nickname || '',
      avatarUrl: memberData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      positionId: memberData.positionId || 'agent',
      role: (memberData.positionId === 'region_manager' ? 'regional_manager' :
             memberData.positionId === 'center_manager' ? 'center_manager' :
             memberData.positionId === 'unit_manager' ? 'unit_manager' : 'agent') as UserRole,
      sponsorId: memberData.sponsorId || ROOT_LEADER.id,
      parentMemberId: memberData.parentMemberId || ROOT_LEADER.id,
      unitId: memberData.unitId || null,
      centerId: memberData.centerId || null,
      regionId: memberData.regionId || 'reg_central_01',
      joinDate: memberData.joinDate || new Date().toISOString().split('T')[0],
      status: memberData.status || 'active',
      phone: memberData.phone || '081-000-0000',
      email: memberData.email || `${newCode.toLowerCase()}@insure-os.com`,
      location: memberData.location || {
        province: 'กรุงเทพมหานคร',
        region: 'Bangkok & Metro',
        lat: 13.75 + (Math.random() - 0.5) * 0.1,
        lng: 100.50 + (Math.random() - 0.5) * 0.1,
      },
      personalFYC: Number(memberData.personalFYC) || 15000,
      personalCOM: Number(memberData.personalCOM) || 4500,
      firstYearPremium: (Number(memberData.personalFYC) || 15000) * 3,
      renewalPremium: (Number(memberData.personalFYC) || 15000) * 2,
      separatedUnitsCount: Number(memberData.separatedUnitsCount) || 0,
      separatedCentersCount: Number(memberData.separatedCentersCount) || 0,
      separatedRegionsCount: Number(memberData.separatedRegionsCount) || 0,
    };

    const nextMembers = [...members, newMember];
    const validation = validateMemberRelationships(nextMembers);
    if (!validation.isValid) {
      return { success: false, message: validation.errors.join(', ') };
    }

    setMembers(nextMembers);

    // Save to Firestore members
    setDoc(doc(db, 'members', newMember.id), newMember).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `members/${newMember.id}`);
    });

    // Sync new member to external stores (local JSON + Google Sheets + Vercel DB) – fire and forget
    import('../lib/localStore').then(({ toStoredRow, saveMemberLocal }) => {
      const u: AuthUser = { id: newMember.id, email: newMember.email, name: newMember.name, provider: 'email', connectedProviders: ['email'], role: newMember.role, positionId: newMember.positionId } as AuthUser;
      saveMemberLocal(toStoredRow(newMember, u));
    }).catch(() => {});
    import('../lib/sheetsSync').then(({ appendMemberToSheet }) => {
      const u: AuthUser = { id: newMember.id, email: newMember.email, name: newMember.name, provider: 'email', connectedProviders: ['email'], role: newMember.role, positionId: newMember.positionId } as AuthUser;
      appendMemberToSheet(newMember, u);
    }).catch(() => {});
    import('../lib/vercelDb').then(({ saveMemberToVercel }) => {
      const u: AuthUser = { id: newMember.id, email: newMember.email, name: newMember.name, provider: 'email', connectedProviders: ['email'], role: newMember.role, positionId: newMember.positionId } as AuthUser;
      saveMemberToVercel(newMember, u);
    }).catch(() => {});

    // Add audit log
    const log: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: activeUser.id,
      userName: activeUser.name,
      action: 'ADD_MEMBER',
      entityType: 'member',
      entityId: newId,
      oldValue: 'None',
      newValue: `${newMember.name} (${newMember.memberCode}) [${newMember.positionId}]`,
      reason: 'เพิ่มสมาชิกใหม่เข้าสู่สายงาน',
    };
    setAuditLogs(prev => [log, ...prev]);

    setDoc(doc(db, 'auditLogs', log.id), log).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `auditLogs/${log.id}`);
    });

    return { success: true, message: 'เพิ่มสมาชิกสำเร็จ', member: newMember };
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    const currentMember = members.find(m => m.id === id);
    if (!currentMember) return { success: false, message: 'ไม่พบสมาชิก' };

    const updatedMembers = members.map(m => m.id === id ? { ...m, ...updates } : m);
    const validation = validateMemberRelationships(updatedMembers);
    if (!validation.isValid) {
      return { success: false, message: validation.errors.join(', ') };
    }

    setMembers(updatedMembers);

    // Update in Firestore
    updateDoc(doc(db, 'members', id), updates).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `members/${id}`);
    });

    const log: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: activeUser.id,
      userName: activeUser.name,
      action: 'UPDATE_MEMBER',
      entityType: 'member',
      entityId: id,
      oldValue: JSON.stringify(currentMember),
      newValue: JSON.stringify(updates),
      reason: 'ปรับปรุงข้อมูลสมาชิกหรือผลงาน',
    };
    setAuditLogs(prev => [log, ...prev]);

    setDoc(doc(db, 'auditLogs', log.id), log).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `auditLogs/${log.id}`);
    });

    return { success: true, message: 'บันทึกข้อมูลเรียบร้อย' };
  };

  const deleteMember = (id: string) => {
    if (id === ROOT_LEADER.id) {
      return { success: false, message: 'ไม่สามารถลบหัวหน้าสายงานระดับสูงสุด (Root Leader) ได้' };
    }

    // Reassign downlines to parent
    const memberToDelete = members.find(m => m.id === id);
    if (!memberToDelete) return { success: false, message: 'ไม่พบสมาชิก' };

    const parentId = memberToDelete.parentMemberId || ROOT_LEADER.id;
    const nextMembers = members
      .filter(m => m.id !== id)
      .map(m => {
        if (m.parentMemberId === id) {
          return { ...m, parentMemberId: parentId };
        }
        if (m.sponsorId === id) {
          return { ...m, sponsorId: parentId };
        }
        return m;
      });

    setMembers(nextMembers);

    // Delete in Firestore
    deleteDoc(doc(db, 'members', id)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `members/${id}`);
    });

    const log: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: activeUser.id,
      userName: activeUser.name,
      action: 'DELETE_MEMBER',
      entityType: 'member',
      entityId: id,
      oldValue: `${memberToDelete.name} (${memberToDelete.memberCode})`,
      newValue: 'DELETED',
      reason: 'ยกเลิกสถานะสมาชิกและส่งต่อสายงานให้หัวหน้าสาย',
    };
    setAuditLogs(prev => [log, ...prev]);

    setDoc(doc(db, 'auditLogs', log.id), log).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `auditLogs/${log.id}`);
    });

    return { success: true, message: 'ลบสมาชิกเรียบร้อย' };
  };

  const updateCompensationRule = (ruleId: string, updates: Partial<CompensationRule>, reason: string) => {
    const updatedRules = activePlan.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r);
    const updatedPlan = { ...activePlan, rules: updatedRules, updatedAt: new Date().toISOString() };
    
    setPlanVersions(prev => prev.map(p => p.id === activePlan.id ? updatedPlan : p));

    // Save updated plan to Firestore
    setDoc(doc(db, 'compensationPlans', activePlan.id), updatedPlan).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `compensationPlans/${activePlan.id}`);
    });

    const log: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: activeUser.id,
      userName: activeUser.name,
      action: 'UPDATE_RULE',
      entityType: 'rule',
      entityId: ruleId,
      oldValue: 'Prior Rule Config',
      newValue: JSON.stringify(updates),
      reason: reason || 'Admin ปรับปรุงเงื่อนไขหรืออัตราจ่ายของกฎผลประโยชน์',
    };
    setAuditLogs(prev => [log, ...prev]);

    setDoc(doc(db, 'auditLogs', log.id), log).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `auditLogs/${log.id}`);
    });
  };

  const duplicatePlanVersion = (newCode: string, newName: string, reason: string) => {
    const newVersion: CompensationPlanVersion = {
      ...activePlan,
      id: `plan_${Date.now()}`,
      code: newCode,
      name: newName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: activeUser.name,
      status: 'active',
    };

    setPlanVersions(prev => [...prev, newVersion]);
    setActivePlanIdState(newVersion.id);

    setDoc(doc(db, 'compensationPlans', newVersion.id), newVersion).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `compensationPlans/${newVersion.id}`);
    });

    const log: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: activeUser.id,
      userName: activeUser.name,
      action: 'DUPLICATE_PLAN',
      entityType: 'plan_version',
      entityId: newVersion.id,
      oldValue: activePlan.name,
      newValue: newName,
      reason: reason || 'สร้างเวอร์ชันใหม่ของแผนผลประโยชน์',
    };
    setAuditLogs(prev => [log, ...prev]);

    setDoc(doc(db, 'auditLogs', log.id), log).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `auditLogs/${log.id}`);
    });
  };

  const setSelectedMemberId = (memberId: string | null) => {
    if (!memberId) {
      setSelectedMember(null);
      return;
    }
    const found = members.find(m => m.id === memberId);
    setSelectedMember(found || null);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        t,
        setLanguage,
        toggleLanguage,
        isFirebaseConnected,
        members,
        positions,
        planVersions,
        activePlan,
        auditLogs,
        activeUser,
        currentUserRole: activeUser.role,
        selectedMember,
        activeTab,
        isPresentationMode,
        searchQuery,
        selectedNetworkView,
        heatmapMode,

        // Authentication
        authUser,
        showGatewayScreen,
        setShowGatewayScreen,
        isAuthModalOpen,
        authModalTab,
        authOAuthProvider,
        authNotification,
        openAuthModal,
        closeAuthModal,
        openOAuthPopup,
        closeOAuthPopup,
        setAuthNotification,
        loginWithEmail,
        loginWithSocial,
        registerWithEmail,
        linkSocialAccount,
        unlinkSocialAccount,
        logout,
        resetPassword,
        verifyResetCode,
        confirmResetPassword,
        requestResetOtp,
        verifyResetOtp,

        // Recruitment
        applications,
        submitApplication,
        updateApplicationStatus,
        approveApplicationToMember,
        setActiveTab,
        setActivePlanId: setActivePlanIdState,
        setSelectedMember,
        setSelectedMemberId,
        setSearchQuery,
        setSelectedNetworkView,
        setHeatmapMode,
        setIsPresentationMode,
        switchActiveUser,
        addMember,
        updateMember,
        deleteMember,
        updateCompensationRule,
        duplicatePlanVersion,
        calculateMemberIncome,
        getDownlineStats,
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
