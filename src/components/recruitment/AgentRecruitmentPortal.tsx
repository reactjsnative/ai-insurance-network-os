import React, { useState } from 'react';
import { 
  UserPlus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Briefcase, 
  GraduationCap, 
  Award, 
  UserCheck, 
  Building2, 
  Send, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Check, 
  Eye, 
  UploadCloud, 
  BadgeAlert,
  ArrowRight,
  Calculator
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AgentApplication, ApplicationStatus, RegistrationStep } from '../../types/recruitment';

export const AgentRecruitmentPortal: React.FC = () => {
  const { 
    applications, 
    submitApplication, 
    updateApplicationStatus, 
    approveApplicationToMember, 
    members, 
    activeUser, 
    t,
    language 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'form' | 'list' | 'stats'>('form');
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<AgentApplication | null>(null);
  const [submissionSuccessModal, setSubmissionSuccessModal] = useState<AgentApplication | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState('');
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<AgentApplication, 'id' | 'applicationNo' | 'submittedAt' | 'status'>>({
    prefix: 'นาย',
    firstName: '',
    lastName: '',
    nickname: '',
    nationalId: '',
    birthDate: '1998-05-15',
    gender: 'male',
    phone: '',
    email: '',
    lineId: '',
    currentAddress: '',
    province: 'กรุงเทพมหานคร',
    district: '',
    postalCode: '',
    region: 'Bangkok & Metro',
    educationLevel: 'bachelor',
    major: '',
    university: '',
    currentOccupation: '',
    experienceLevel: 'newcomer',
    insuranceExperienceYears: 0,
    previousCompany: '',
    licenseStatus: 'needs_training',
    licenseNumber: '',
    licenseExpiryDate: '',
    hasGeneralInsuranceLicense: false,
    hasICLicense: false,
    examDate: '',
    sponsorMemberId: activeUser.id,
    sponsorCode: activeUser.memberCode,
    sponsorName: activeUser.name,
    targetPositionPreference: 'agent',
    targetMonthlyIncomeGoal: 50000,
    targetYearlyFYCGoal: 360000,
    expectedStartDate: new Date().toISOString().slice(0, 10),
    recruitmentChannel: 'direct_referral',
    motivationNote: '',
    documents: {
      idCardUploaded: true,
      idCardFileName: 'thai_national_id.pdf',
      photoUploaded: true,
      photoFileName: 'professional_photo.jpg',
      educationCertUploaded: true,
      educationCertFileName: 'graduation_diploma.pdf',
      oicLicenseUploaded: false,
      bankBookUploaded: true,
      bankBookFileName: 'bank_book_account.pdf',
    },
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Auto calculate estimated first year monthly income projection based on FYC target
  const estimatedMonthlyCommission = Math.round((formData.targetYearlyFYCGoal / 12) * 0.35);

  const validateStep = (step: RegistrationStep): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = language === 'th' ? 'กรุณากรอกชื่อจริง' : 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = language === 'th' ? 'กรุณากรอกนามสกุล' : 'Last name is required';
      if (!formData.nationalId.trim() || formData.nationalId.length < 13) {
        errors.nationalId = language === 'th' ? 'กรุณากรอกเลขบัตรประชาชน 13 หลัก' : '13-digit National ID is required';
      }
      if (!formData.phone.trim()) errors.phone = language === 'th' ? 'กรุณากรอกเบอร์โทรศัพท์' : 'Phone number is required';
      if (!formData.email.trim() || !formData.email.includes('@')) {
        errors.email = language === 'th' ? 'กรุณากรอกอีเมลที่ถูกต้อง' : 'Valid email is required';
      }
      if (!formData.province.trim()) errors.province = language === 'th' ? 'กรุณาระบุจังหวัด' : 'Province is required';
    }

    if (step === 2) {
      if (!formData.university.trim()) errors.university = language === 'th' ? 'กรุณาระบุสถาบันการศึกษา' : 'University/Institute is required';
      if (!formData.currentOccupation.trim()) errors.currentOccupation = language === 'th' ? 'กรุณาระบุอาชีพปัจจุบัน' : 'Current occupation is required';
    }

    if (step === 3) {
      if (formData.licenseStatus === 'has_license' && !formData.licenseNumber?.trim()) {
        errors.licenseNumber = language === 'th' ? 'กรุณาระบุเลขที่ใบอนุญาต คปภ.' : 'OIC License number is required';
      }
    }

    if (step === 4) {
      if (!formData.sponsorCode.trim()) errors.sponsorCode = language === 'th' ? 'กรุณาระบุผู้แนะนำ' : 'Sponsor is required';
      if (!formData.motivationNote.trim()) {
        errors.motivationNote = language === 'th' ? 'กรุณาระบุเป้าหมายหรือความมุ่งหวัง' : 'Motivation / Goals note is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as RegistrationStep);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as RegistrationStep);
    }
  };

  const handleSponsorChange = (sponsorId: string) => {
    const found = members.find(m => m.id === sponsorId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        sponsorMemberId: found.id,
        sponsorCode: found.memberCode,
        sponsorName: found.name,
      }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    const result = submitApplication(formData);
    if (result.success) {
      setSubmissionSuccessModal(result.application);
      // Reset form to clean state
      setFormData({
        prefix: 'นาย',
        firstName: '',
        lastName: '',
        nickname: '',
        nationalId: '',
        birthDate: '1998-05-15',
        gender: 'male',
        phone: '',
        email: '',
        lineId: '',
        currentAddress: '',
        province: 'กรุงเทพมหานคร',
        district: '',
        postalCode: '',
        region: 'Bangkok & Metro',
        educationLevel: 'bachelor',
        major: '',
        university: '',
        currentOccupation: '',
        experienceLevel: 'newcomer',
        insuranceExperienceYears: 0,
        previousCompany: '',
        licenseStatus: 'needs_training',
        licenseNumber: '',
        licenseExpiryDate: '',
        hasGeneralInsuranceLicense: false,
        hasICLicense: false,
        examDate: '',
        sponsorMemberId: activeUser.id,
        sponsorCode: activeUser.memberCode,
        sponsorName: activeUser.name,
        targetPositionPreference: 'agent',
        targetMonthlyIncomeGoal: 50000,
        targetYearlyFYCGoal: 360000,
        expectedStartDate: new Date().toISOString().slice(0, 10),
        recruitmentChannel: 'direct_referral',
        motivationNote: '',
        documents: {
          idCardUploaded: true,
          idCardFileName: 'thai_national_id.pdf',
          photoUploaded: true,
          photoFileName: 'professional_photo.jpg',
          educationCertUploaded: true,
          educationCertFileName: 'graduation_diploma.pdf',
          oicLicenseUploaded: false,
          bankBookUploaded: true,
          bankBookFileName: 'bank_book_account.pdf',
        },
      });
      setCurrentStep(1);
    }
  };

  // Filtered applications
  const filteredApps = applications.filter(app => {
    const fullName = `${app.firstName} ${app.lastName} ${app.nickname || ''}`.toLowerCase();
    const matchQuery = 
      fullName.includes(searchFilter.toLowerCase()) ||
      app.applicationNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.phone.includes(searchFilter) ||
      app.province.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.sponsorName.toLowerCase().includes(searchFilter.toLowerCase());

    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            {language === 'th' ? 'รอตรวจสอบเอกสาร' : 'Pending Review'}
          </span>
        );
      case 'document_verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {language === 'th' ? 'เอกสารผ่านแล้ว' : 'Doc Verified'}
          </span>
        );
      case 'exam_passed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            {language === 'th' ? 'สอบ คปภ. ผ่านแล้ว' : 'Exam Passed'}
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <UserCheck className="w-3.5 h-3.5" />
            {language === 'th' ? 'อนุมัติบรรจุตัวแทนแล้ว' : 'Approved Member'}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            {language === 'th' ? 'ไม่อนุมัติ / ขอข้อมูลเพิ่ม' : 'Rejected'}
          </span>
        );
    }
  };

  const handleApproveModal = (appId: string) => {
    const res = approveApplicationToMember(appId);
    if (res.success) {
      setActionAlert({ type: 'success', message: res.message });
      setSelectedApplication(null);
    } else {
      setActionAlert({ type: 'error', message: res.message });
    }
  };

  // Stats
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === 'pending_review').length;
  const verifiedApps = applications.filter(a => a.status === 'document_verified' || a.status === 'exam_passed').length;
  const approvedApps = applications.filter(a => a.status === 'approved').length;

  return (
    <div id="recruitment_portal_container" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {language === 'th' ? 'ระบบรับสมัครและขึ้นทะเบียนตัวแทนใหม่ (Life Agent Onboarding)' : 'Life Insurance Agent Recruitment & Onboarding'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-indigo-400" />
              {language === 'th' ? 'ระบบสมัครตัวแทนประกันชีวิต' : 'Agent Recruitment & Registration'}
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              {language === 'th' 
                ? 'ระบบยื่นใบสมัครตัวแทนใหม่ ตรวจสอบคุณวุฒิใบอนุญาต คปภ. ผูกสายงานผู้แนะนำ (Sponsor) วางเป้าหมายรายได้ FYC และอนุมัติบรรจุเข้าสู่ผังองค์กรแบบ Real-Time'
                : 'Submit new agent applications, verify OIC license qualifications, assign network sponsors, project income goals, and instantly approve new team members into the network tree.'}
            </p>
          </div>

          {/* Quick Subtab Switcher */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              id="tab_recruitment_form"
              onClick={() => { setActiveSubTab('form'); setSelectedApplication(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'form'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              {language === 'th' ? 'ยื่นใบสมัครใหม่' : 'Application Form'}
            </button>
            <button
              id="tab_recruitment_list"
              onClick={() => setActiveSubTab('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                activeSubTab === 'list'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {language === 'th' ? 'รายการใบสมัคร' : 'Applications List'}
              {pendingApps > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                  {pendingApps}
                </span>
              )}
            </button>
            <button
              id="tab_recruitment_stats"
              onClick={() => setActiveSubTab('stats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'stats'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {language === 'th' ? 'สถิติการสรรหา' : 'Recruitment Stats'}
            </button>
          </div>
        </div>

        {/* 4 Mini KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <p className="text-xs text-slate-400">{language === 'th' ? 'ใบสมัครทั้งหมด' : 'Total Applications'}</p>
            <p className="text-xl font-bold text-white mt-1">{totalApps} <span className="text-xs font-normal text-slate-400">{language === 'th' ? 'ราย' : 'apps'}</span></p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <p className="text-xs text-amber-400">{language === 'th' ? 'รอตรวจสอบ' : 'Pending Review'}</p>
            <p className="text-xl font-bold text-amber-400 mt-1">{pendingApps} <span className="text-xs font-normal text-slate-400">{language === 'th' ? 'ราย' : 'apps'}</span></p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <p className="text-xs text-cyan-400">{language === 'th' ? 'พร้อมบรรจุ/ผ่านเกณฑ์' : 'Qualified / Ready'}</p>
            <p className="text-xl font-bold text-cyan-400 mt-1">{verifiedApps} <span className="text-xs font-normal text-slate-400">{language === 'th' ? 'ราย' : 'apps'}</span></p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <p className="text-xs text-emerald-400">{language === 'th' ? 'อนุมัติบรรจุแล้ว' : 'Approved to Team'}</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{approvedApps} <span className="text-xs font-normal text-slate-400">{language === 'th' ? 'ราย' : 'members'}</span></p>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          actionAlert.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-3">
            {actionAlert.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <BadgeAlert className="w-5 h-5 text-rose-400" />}
            <p className="text-sm font-medium">{actionAlert.message}</p>
          </div>
          <button 
            onClick={() => setActionAlert(null)}
            className="text-xs underline hover:text-white px-2 py-1"
          >
            {language === 'th' ? 'ปิด' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* SUBTAB 1: 4-STEP RECRUITMENT APPLICATION FORM */}
      {activeSubTab === 'form' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          {/* Step Progress Tracker */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 w-full -z-0" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 transition-all duration-300 -z-0"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />

              {[
                { step: 1, title: language === 'th' ? 'ข้อมูลส่วนตัว' : 'Personal Info', icon: UserPlus },
                { step: 2, title: language === 'th' ? 'การศึกษา & ประสบการณ์' : 'Education & Work', icon: GraduationCap },
                { step: 3, title: language === 'th' ? 'ใบอนุญาต คปภ.' : 'OIC License', icon: Award },
                { step: 4, title: language === 'th' ? 'ผู้แนะนำ & เป้าหมาย' : 'Sponsor & Goals', icon: Building2 },
              ].map((s) => {
                const Icon = s.icon;
                const isPassed = currentStep > s.step;
                const isCurrent = currentStep === s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      if (s.step < currentStep || validateStep(currentStep)) {
                        setCurrentStep(s.step as RegistrationStep);
                      }
                    }}
                    className={`flex flex-col items-center gap-2 relative z-10 bg-slate-900 px-3 py-1 rounded-xl transition-all ${
                      isCurrent ? 'scale-105' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isPassed 
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 border-indigo-400 text-white ring-4 ring-indigo-500/20'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                      {isPassed ? <Check className="w-5 h-5 font-bold" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${
                      isCurrent ? 'text-indigo-400' : isPassed ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {s.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* STEP 1: PERSONAL INFORMATION */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-indigo-400" />
                    {language === 'th' ? 'ขั้นตอนที่ 1: ข้อมูลประวัติส่วนตัวของผู้สมัคร' : 'Step 1: Personal Profile'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {language === 'th' ? 'กรอกข้อมูลส่วนตัวสำหรับการลงทะเบียนเข้าสู่ระบบบริหารองค์กร' : 'Provide candidate details for agent record registration.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'คำนำหน้าชื่อ' : 'Prefix'}</label>
                    <select
                      value={formData.prefix}
                      onChange={(e) => setFormData({ ...formData, prefix: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="นาย">นาย (Mr.)</option>
                      <option value="นางสาว">นางสาว (Ms.)</option>
                      <option value="นาง">นาง (Mrs.)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'ชื่อจริง *' : 'First Name *'}</label>
                    <input
                      type="text"
                      placeholder="เช่น ธนภัทร"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={`w-full bg-slate-950 border rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none ${
                        validationErrors.firstName ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                    {validationErrors.firstName && <p className="text-xs text-rose-400 mt-1">{validationErrors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'นามสกุล *' : 'Last Name *'}</label>
                    <input
                      type="text"
                      placeholder="เช่น สิทธิวงศ์"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={`w-full bg-slate-950 border rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none ${
                        validationErrors.lastName ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                    {validationErrors.lastName && <p className="text-xs text-rose-400 mt-1">{validationErrors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'ชื่อเล่น' : 'Nickname'}</label>
                    <input
                      type="text"
                      placeholder="เช่น บอล, แพรว"
                      value={formData.nickname}
                      onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'เลขบัตรประจำตัวประชาชน (13 หลัก) *' : 'National ID Number *'}</label>
                    <input
                      type="text"
                      maxLength={17}
                      placeholder="x-xxxx-xxxxx-xx-x"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      className={`w-full bg-slate-950 border rounded-lg px-3 py-2.5 text-sm text-slate-200 font-mono focus:outline-none ${
                        validationErrors.nationalId ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                    {validationErrors.nationalId && <p className="text-xs text-rose-400 mt-1">{validationErrors.nationalId}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'วัน/เดือน/ปี เกิด' : 'Birth Date'}</label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'เพศ' : 'Gender'}</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="male">{language === 'th' ? 'ชาย' : 'Male'}</option>
                      <option value="female">{language === 'th' ? 'หญิง' : 'Female'}</option>
                      <option value="other">{language === 'th' ? 'อื่นๆ' : 'Other'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'เบอร์โทรศัพท์ติดต่อ *' : 'Phone Number *'}</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        placeholder="081-234-5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full bg-slate-950 border rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 focus:outline-none ${
                          validationErrors.phone ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                    {validationErrors.phone && <p className="text-xs text-rose-400 mt-1">{validationErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'อีเมล (Email) *' : 'Email *'}</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        placeholder="candidate@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full bg-slate-950 border rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 focus:outline-none ${
                          validationErrors.email ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                    {validationErrors.email && <p className="text-xs text-rose-400 mt-1">{validationErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'LINE ID' : 'LINE ID'}</label>
                    <input
                      type="text"
                      placeholder="line_agent_id"
                      value={formData.lineId}
                      onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'ที่อยู่ปัจจุบัน' : 'Current Address'}</label>
                    <input
                      type="text"
                      placeholder="บ้านเลขที่ อาคาร ถนน ตำบล/แขวง"
                      value={formData.currentAddress}
                      onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'จังหวัด *' : 'Province *'}</label>
                    <input
                      type="text"
                      placeholder="กรุงเทพฯ, เชียงใหม่, ขอนแก่น..."
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: EDUCATION & EXPERIENCE */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                    {language === 'th' ? 'ขั้นตอนที่ 2: วุฒิการศึกษาและประวัติการทำงาน' : 'Step 2: Education & Work Experience'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {language === 'th' ? 'ข้อมูลเพื่อการวิเคราะห์ศักยภาพและกำหนดแผนการฝึกอบรมที่เหมาะสม' : 'Evaluate candidate background for customized training & fast-track pathways.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'ระดับการศึกษาสูงสุด' : 'Highest Education'}</label>
                    <select
                      value={formData.educationLevel}
                      onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="high_school">{language === 'th' ? 'มัธยมศึกษาตอนปลาย / ปวช.' : 'High School / Vocational'}</option>
                      <option value="vocational">{language === 'th' ? 'อนุปริญญา / ปวส.' : 'Associate Degree / High Vocational'}</option>
                      <option value="bachelor">{language === 'th' ? 'ปริญญาตรี (Bachelor)' : 'Bachelor Degree'}</option>
                      <option value="master">{language === 'th' ? 'ปริญญาโท (Master)' : 'Master Degree'}</option>
                      <option value="doctorate">{language === 'th' ? 'ปริญญาเอก (Doctorate)' : 'Doctorate Degree'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'สาขาวิชา' : 'Major'}</label>
                    <input
                      type="text"
                      placeholder="เช่น บริหารธุรกิจ, การเงิน, การตลาด, วิศวกรรม..."
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'สถาบันการศึกษา *' : 'University / Institute *'}</label>
                    <input
                      type="text"
                      placeholder="เช่น ม.เกษตรศาสตร์, ม.จุฬาฯ, มช."
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      className={`w-full bg-slate-950 border rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none ${
                        validationErrors.university ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                    {validationErrors.university && <p className="text-xs text-rose-400 mt-1">{validationErrors.university}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'อาชีพ/ตำแหน่งงานปัจจุบัน *' : 'Current Occupation *'}</label>
                    <input
                      type="text"
                      placeholder="เช่น พนักงานบริษัท, ธุรกิจส่วนตัว, ข้าราชการ"
                      value={formData.currentOccupation}
                      onChange={(e) => setFormData({ ...formData, currentOccupation: e.target.value })}
                      className={`w-full bg-slate-950 border rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none ${
                        validationErrors.currentOccupation ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                    {validationErrors.currentOccupation && <p className="text-xs text-rose-400 mt-1">{validationErrors.currentOccupation}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'ระดับประสบการณ์ในสายงานขาย/ประกัน' : 'Sales/Insurance Experience'}</label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="newcomer">{language === 'th' ? 'ไม่มีประสบการณ์ (Newcomer พร้อมเรียนรู้)' : 'No Experience (Fresh Candidate)'}</option>
                      <option value="under_1_year">{language === 'th' ? 'น้อยกว่า 1 ปี' : 'Under 1 year'}</option>
                      <option value="1_to_3_years">{language === 'th' ? '1 - 3 ปี' : '1 - 3 years'}</option>
                      <option value="3_to_5_years">{language === 'th' ? '3 - 5 ปี' : '3 - 5 years'}</option>
                      <option value="over_5_years">{language === 'th' ? 'มากกว่า 5 ปี (ระดับมืออาชีพ)' : 'Over 5 years (Professional)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'บริษัทเดิม (ถ้ามี)' : 'Previous Company (if any)'}</label>
                    <input
                      type="text"
                      placeholder="ระบุบริษัทหรือสังกัดเดิม"
                      value={formData.previousCompany}
                      onChange={(e) => setFormData({ ...formData, previousCompany: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: OIC LICENSE & QUALIFICATIONS */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-400" />
                    {language === 'th' ? 'ขั้นตอนที่ 3: สถานะใบอนุญาตตัวแทนประกันชีวิต (คปภ.)' : 'Step 3: OIC Life Insurance License Status'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {language === 'th' ? 'ตรวจสอบคุณสมบัติตามกฎหมาย คปภ. และใบอนุญาตเสริม (IC / วินาศภัย)' : 'Verify legal compliance, OIC agent license number, and additional certifications.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-2">{language === 'th' ? 'สถานะใบอนุญาตตัวแทนประกันชีวิต *' : 'OIC License Status *'}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'has_license', label: language === 'th' ? 'มีใบอนุญาต คปภ. แล้ว' : 'Has Valid OIC License', desc: language === 'th' ? 'พร้อมเริ่มงานและรับรหัสตัวแทนทันที' : 'Ready for instant code issuance' },
                        { id: 'exam_scheduled', label: language === 'th' ? 'รอสอบ / มีรอบสอบแล้ว' : 'Exam Scheduled', desc: language === 'th' ? 'อยู่ระหว่างรอผลสอบ คปภ.' : 'Awaiting official test result' },
                        { id: 'needs_training', label: language === 'th' ? 'ยังไม่มี (ต้องการเข้าคอร์สอบรม)' : 'Needs Training Course', desc: language === 'th' ? 'สมัครคอร์สอบรมเตรียมสอบของทีม' : 'Join fast onboarding training' },
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setFormData({ ...formData, licenseStatus: item.id as any })}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            formData.licenseStatus === item.id
                              ? 'bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/20'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <p className="font-semibold text-sm text-slate-200">{item.label}</p>
                          <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formData.licenseStatus === 'has_license' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'เลขที่ใบอนุญาตตัวแทนประกันชีวิต (คปภ.) *' : 'OIC License Number *'}</label>
                        <input
                          type="text"
                          placeholder="เช่น 6401029384"
                          value={formData.licenseNumber}
                          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                        />
                        {validationErrors.licenseNumber && <p className="text-xs text-rose-400 mt-1">{validationErrors.licenseNumber}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'วันหมดอายุใบอนุญาต' : 'License Expiry Date'}</label>
                        <input
                          type="date"
                          value={formData.licenseExpiryDate}
                          onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </>
                  )}

                  {formData.licenseStatus === 'exam_scheduled' && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'วันที่นัดสอบ คปภ.' : 'Exam Date'}</label>
                      <input
                        type="date"
                        value={formData.examDate}
                        onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>

                {/* Additional Credentials */}
                <div className="pt-4 border-t border-slate-800/80">
                  <label className="block text-xs font-medium text-slate-300 mb-3">{language === 'th' ? 'ใบอนุญาตและคุณวุฒิเพิ่มเติม' : 'Additional Certifications'}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.hasICLicense}
                        onChange={(e) => setFormData({ ...formData, hasICLicense: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{language === 'th' ? 'มีใบอนุญาตผู้แนะนำการลงทุน (IC License)' : 'Investment Consultant (IC License)'}</p>
                        <p className="text-[11px] text-slate-400">{language === 'th' ? 'สามารถเสนอขายแบบประกันควบการลงทุน (Unit-Linked / Universal Life)' : 'Eligible for Unit-Linked & Wealth products'}</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.hasGeneralInsuranceLicense}
                        onChange={(e) => setFormData({ ...formData, hasGeneralInsuranceLicense: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{language === 'th' ? 'มีใบอนุญาตนายหน้าประกันวินาศภัย' : 'General / Non-Life Insurance License'}</p>
                        <p className="text-[11px] text-slate-400">{language === 'th' ? 'สามารถเสนอขายประกันรถยนต์ พ.ร.บ. และอัคคีภัย' : 'Auto & property insurance selling'}</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SPONSOR & CAREER TARGETS */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    {language === 'th' ? 'ขั้นตอนที่ 4: ผู้แนะนำ (Sponsor) และเป้าหมายเส้นทางอาชีพ' : 'Step 4: Network Sponsor & Career Goals'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {language === 'th' ? 'เชื่อมโยงสายงานในระบบ Infinite Network และคำนวณเป้าหมายรายได้' : 'Connect into the downline hierarchy and project monthly/annual income goals.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Sponsor */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'ผู้แนะนำเข้าสู่สายงาน (Sponsor) *' : 'Direct Sponsor *'}</label>
                    <select
                      value={formData.sponsorMemberId}
                      onChange={(e) => handleSponsorChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.memberCode}) - {m.positionId.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preferred Career Pathway */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'เส้นทางเติบโตที่มุ่งหวัง (Career Track)' : 'Preferred Career Track'}</label>
                    <select
                      value={formData.targetPositionPreference}
                      onChange={(e) => setFormData({ ...formData, targetPositionPreference: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="agent">{language === 'th' ? 'ตัวแทนมาตรฐาน (Professional Life Agent)' : 'Professional Life Agent'}</option>
                      <option value="unit_manager_fast_track">{language === 'th' ? 'Fast-Track สู่ผู้บริหารหน่วย (UM Fast Track)' : 'Unit Manager Fast Track (UM)'}</option>
                      <option value="center_executive_track">{language === 'th' ? 'Executive Track ผู้บริหารศูนย์ (CM Track)' : 'Center Executive Track (CM)'}</option>
                    </select>
                  </div>
                </div>

                {/* Target Projection Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-bold text-white">{language === 'th' ? 'การจำลองเป้าหมายรายได้และผลงานปีแรก' : 'First Year Income Goal Simulation'}</h3>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Rule Engine 15 ม.ค. 64
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        {language === 'th' ? 'เป้าหมาย FYC ปีแรก (บาท/ปี)' : 'Target FYC Year 1 (THB)'}
                      </label>
                      <input
                        type="number"
                        step={10000}
                        min={50000}
                        value={formData.targetYearlyFYCGoal}
                        onChange={(e) => setFormData({ ...formData, targetYearlyFYCGoal: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        ≈ {(formData.targetYearlyFYCGoal / 12).toLocaleString()} บาท/เดือน
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        {language === 'th' ? 'เป้าหมายรายได้เฉลี่ย (บาท/เดือน)' : 'Target Monthly Income (THB)'}
                      </label>
                      <input
                        type="number"
                        step={5000}
                        min={10000}
                        value={formData.targetMonthlyIncomeGoal}
                        onChange={(e) => setFormData({ ...formData, targetMonthlyIncomeGoal: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        {language === 'th' ? 'ประมาณการคอมมิชชั่นขั้นต้น' : 'Est. base commission'}: ≈ {estimatedMonthlyCommission.toLocaleString()} ฿/ด.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Motivation & Channel */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'ช่องทางที่รู้จัก/แนะนำ' : 'Recruitment Channel'}</label>
                    <select
                      value={formData.recruitmentChannel}
                      onChange={(e) => setFormData({ ...formData, recruitmentChannel: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="direct_referral">{language === 'th' ? 'ผู้บริหาร/ตัวแทนแนะนำตรง' : 'Direct Referral'}</option>
                      <option value="seminar">{language === 'th' ? 'สัมมนาเปิดโอกาส (Opportunity Seminar)' : 'Opportunity Seminar'}</option>
                      <option value="social_media">{language === 'th' ? 'โซเชียลมีเดีย (TikTok / FB / IG)' : 'Social Media'}</option>
                      <option value="company_booth">{language === 'th' ? 'บูธกิจกรรมองค์กร' : 'Company Booth'}</option>
                      <option value="online_ad">{language === 'th' ? 'โฆษณาออนไลน์' : 'Online Ad'}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{language === 'th' ? 'ความมุ่งหวัง / เหตุผลที่ตัดสินใจเข้าร่วมธุรกิจ *' : 'Motivation / Why Join *'}</label>
                    <textarea
                      rows={3}
                      placeholder="เช่น ต้องการสร้างความมั่นคงทางการเงิน ขยายทีมงาน และวางแผนเกษียณด้วย Passive Income จากโครงสร้างองค์กร"
                      value={formData.motivationNote}
                      onChange={(e) => setFormData({ ...formData, motivationNote: e.target.value })}
                      className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none ${
                        validationErrors.motivationNote ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                    {validationErrors.motivationNote && <p className="text-xs text-rose-400 mt-1">{validationErrors.motivationNote}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* FORM FOOTER CONTROLS */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {language === 'th' ? 'ย้อนกลับ' : 'Previous Step'}
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {language === 'th' ? 'ขั้นตอนถัดไป' : 'Next Step'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-600/30 transition-all"
                >
                  <Send className="w-4 h-4" />
                  {language === 'th' ? 'ยืนยันการยื่นใบสมัครตัวแทน' : 'Submit Agent Application'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 2: APPLICATIONS LIST & MANAGEMENT */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={language === 'th' ? 'ค้นหาชื่อผู้สมัคร, รหัสใบสมัคร (APP-), เบอร์โทร, จังหวัด...' : 'Search by name, app no, phone, province...'}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{language === 'th' ? 'ทุกสถานะ' : 'All Statuses'}</option>
                <option value="pending_review">{language === 'th' ? 'รอตรวจสอบ' : 'Pending Review'}</option>
                <option value="document_verified">{language === 'th' ? 'เอกสารผ่านแล้ว' : 'Doc Verified'}</option>
                <option value="exam_passed">{language === 'th' ? 'สอบผ่าน คปภ.' : 'Exam Passed'}</option>
                <option value="approved">{language === 'th' ? 'อนุมัติบรรจุแล้ว' : 'Approved'}</option>
                <option value="rejected">{language === 'th' ? 'ไม่อนุมัติ' : 'Rejected'}</option>
              </select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">{language === 'th' ? 'รหัสใบสมัคร / วันที่' : 'App No / Date'}</th>
                    <th className="px-4 py-3">{language === 'th' ? 'ผู้สมัคร' : 'Candidate'}</th>
                    <th className="px-4 py-3">{language === 'th' ? 'สถานะใบอนุญาต' : 'License Status'}</th>
                    <th className="px-4 py-3">{language === 'th' ? 'ผู้แนะนำ (Sponsor)' : 'Sponsor'}</th>
                    <th className="px-4 py-3">{language === 'th' ? 'เป้าหมาย FYC/ปี' : 'Target FYC'}</th>
                    <th className="px-4 py-3">{language === 'th' ? 'สถานะ' : 'Status'}</th>
                    <th className="px-4 py-3 text-right">{language === 'th' ? 'จัดการ' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                        {language === 'th' ? 'ไม่พบรายการใบสมัครตามเงื่อนไข' : 'No applications found matching criteria'}
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-mono font-bold text-xs text-indigo-400">{app.applicationNo}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(app.submittedAt).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-200 border border-slate-700">
                              {app.firstName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-100 text-xs">
                                {app.prefix} {app.firstName} {app.lastName} {app.nickname ? `(${app.nickname})` : ''}
                              </p>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400" /> {app.phone} | <MapPin className="w-3 h-3 text-slate-400" /> {app.province}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          {app.licenseStatus === 'has_license' ? (
                            <div>
                              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> มีใบอนุญาต คปภ.
                              </span>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">No. {app.licenseNumber || '-'}</p>
                            </div>
                          ) : app.licenseStatus === 'exam_scheduled' ? (
                            <span className="text-xs font-medium text-amber-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> นัดสอบ {app.examDate || 'เร็วๆ นี้'}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">
                              รอเข้าคอร์สอบรม
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-medium text-xs text-slate-200">{app.sponsorName}</p>
                          <span className="text-[10px] text-indigo-400 font-mono">{app.sponsorCode}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-bold text-xs text-amber-400">{(app.targetYearlyFYCGoal || 0).toLocaleString()} ฿</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {app.targetPositionPreference === 'unit_manager_fast_track' ? 'UM Fast Track' :
                             app.targetPositionPreference === 'center_executive_track' ? 'CM Track' : 'Life Agent'}
                          </p>
                        </td>

                        <td className="px-4 py-3.5">
                          {getStatusBadge(app.status)}
                          {app.assignedMemberCode && (
                            <p className="text-[10px] font-mono text-emerald-400 mt-1 font-bold">
                              ID: {app.assignedMemberCode}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setReviewNoteInput(app.reviewerNote || '');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {language === 'th' ? 'ดูรายละเอียด / อนุมัติ' : 'View / Review'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: RECRUITMENT PERFORMANCE STATS */}
      {activeSubTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              {language === 'th' ? 'ช่องทางการสรรหาตัวแทน (Recruitment Channels)' : 'Recruitment Source Breakdown'}
            </h3>
            <div className="space-y-3 pt-2">
              {[
                { label: language === 'th' ? 'ผู้บริหารและตัวแทนแนะนำตรง (Direct Referral)' : 'Direct Referral', count: applications.filter(a => a.recruitmentChannel === 'direct_referral').length, color: 'bg-indigo-500' },
                { label: language === 'th' ? 'สัมมนาเปิดโอกาส (Opportunity Seminar)' : 'Opportunity Seminar', count: applications.filter(a => a.recruitmentChannel === 'seminar').length, color: 'bg-cyan-500' },
                { label: language === 'th' ? 'โซเชียลมีเดีย (TikTok / FB / IG)' : 'Social Media', count: applications.filter(a => a.recruitmentChannel === 'social_media').length, color: 'bg-amber-500' },
                { label: language === 'th' ? 'อื่นๆ / โฆษณา' : 'Others / Ads', count: applications.filter(a => a.recruitmentChannel === 'company_booth' || a.recruitmentChannel === 'online_ad' || a.recruitmentChannel === 'other').length, color: 'bg-emerald-500' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-bold text-white">{item.count} {language === 'th' ? 'ราย' : 'apps'}</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${totalApps > 0 ? (item.count / totalApps) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              {language === 'th' ? 'ศักยภาพและเป้าหมายตัวแทนใหม่' : 'New Agent Capacity & Goals'}
            </h3>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">{language === 'th' ? 'เป้าหมาย FYC รวมของผู้สมัครทั้งหมด' : 'Total Projected FYC Pipeline'}</span>
                <span className="font-bold text-amber-400 text-sm">
                  {applications.reduce((sum, a) => sum + (a.targetYearlyFYCGoal || 0), 0).toLocaleString()} THB
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">{language === 'th' ? 'ผู้สมัครที่มีใบอนุญาต คปภ. แล้ว' : 'Licensed Candidates Ready'}</span>
                <span className="font-bold text-emerald-400">
                  {applications.filter(a => a.licenseStatus === 'has_license').length} {language === 'th' ? 'ท่าน' : 'agents'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">{language === 'th' ? 'ผู้สมัครสนใจสายบริหาร Fast-Track' : 'Management Fast-Track Applicants'}</span>
                <span className="font-bold text-cyan-400">
                  {applications.filter(a => a.targetPositionPreference !== 'agent').length} {language === 'th' ? 'ท่าน' : 'leaders'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL / APPROVAL MODAL */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs text-indigo-400 font-bold">{selectedApplication.applicationNo}</span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {selectedApplication.prefix} {selectedApplication.firstName} {selectedApplication.lastName}
                </h3>
              </div>
              {getStatusBadge(selectedApplication.status)}
            </div>

            {/* Application Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <p className="font-bold text-slate-300">{language === 'th' ? 'ข้อมูลติดต่อ & ภูมิลำเนา' : 'Contact & Location'}</p>
                <p className="text-slate-400"><span className="text-slate-500">โทร:</span> {selectedApplication.phone}</p>
                <p className="text-slate-400"><span className="text-slate-500">อีเมล:</span> {selectedApplication.email}</p>
                <p className="text-slate-400"><span className="text-slate-500">จังหวัด:</span> {selectedApplication.province} ({selectedApplication.region})</p>
                <p className="text-slate-400"><span className="text-slate-500">LINE:</span> {selectedApplication.lineId || '-'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <p className="font-bold text-slate-300">{language === 'th' ? 'ประวัติการศึกษา & ใบอนุญาต' : 'Education & License'}</p>
                <p className="text-slate-400"><span className="text-slate-500">วุฒิ:</span> {selectedApplication.educationLevel.toUpperCase()} ({selectedApplication.major || '-'})</p>
                <p className="text-slate-400"><span className="text-slate-500">สถาบัน:</span> {selectedApplication.university}</p>
                <p className="text-slate-400"><span className="text-slate-500">ใบอนุญาต คปภ.:</span> {selectedApplication.licenseNumber || selectedApplication.licenseStatus}</p>
                <p className="text-slate-400"><span className="text-slate-500">IC License:</span> {selectedApplication.hasICLicense ? '✅ มี' : '❌ ไม่มี'}</p>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <p className="font-bold text-slate-300">{language === 'th' ? 'ผู้แนะนำ & เป้าหมาย' : 'Sponsor & Track'}</p>
                <p className="text-slate-400">
                  <span className="text-slate-500">ผู้แนะนำ:</span> <span className="text-white font-semibold">{selectedApplication.sponsorName}</span> ({selectedApplication.sponsorCode})
                </p>
                <p className="text-slate-400">
                  <span className="text-slate-500">เป้าหมาย FYC:</span> <span className="text-amber-400 font-bold">{(selectedApplication.targetYearlyFYCGoal || 0).toLocaleString()} บาท/ปี</span>
                </p>
                <p className="text-slate-400">
                  <span className="text-slate-500">เป้าหมายรายได้:</span> <span className="text-emerald-400 font-bold">{(selectedApplication.targetMonthlyIncomeGoal || 0).toLocaleString()} บาท/เดือน</span>
                </p>
                <p className="text-slate-300 mt-2 italic bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  "{selectedApplication.motivationNote}"
                </p>
              </div>
            </div>

            {/* Reviewer Note Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                {language === 'th' ? 'บันทึกการพิจารณา / ความเห็นผู้ตรวจ' : 'Reviewer Assessment & Notes'}
              </label>
              <textarea
                rows={2}
                value={reviewNoteInput}
                onChange={(e) => setReviewNoteInput(e.target.value)}
                placeholder="ระบุข้อคิดเห็น เช่น เอกสารครบถ้วน ตรวจสอบใบอนุญาตผ่านเกณฑ์..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
              >
                {language === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
              </button>

              <div className="flex items-center gap-2">
                {selectedApplication.status !== 'approved' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        updateApplicationStatus(selectedApplication.id, 'document_verified', reviewNoteInput);
                        setSelectedApplication(null);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600 hover:text-white transition-all"
                    >
                      {language === 'th' ? 'ยืนยันเอกสารผ่าน' : 'Verify Docs'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApproveModal(selectedApplication.id)}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      {language === 'th' ? 'อนุมัติบรรจุเป็นตัวแทนทันที' : 'Approve & Issue Agent Code'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION SUCCESS MODAL */}
      {submissionSuccessModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-scaleUp">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white">
              {language === 'th' ? 'ยื่นใบสมัครสำเร็จเรียบร้อย!' : 'Application Submitted!'}
            </h3>

            <p className="text-xs text-slate-300">
              {language === 'th'
                ? `ระบบได้บันทึกใบสมัครของ ${submissionSuccessModal.prefix} ${submissionSuccessModal.firstName} ${submissionSuccessModal.lastName} เข้าสู่คิวตรวจสอบเรียบร้อยแล้ว`
                : `Application for ${submissionSuccessModal.firstName} ${submissionSuccessModal.lastName} has been submitted.`}
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-indigo-400 font-bold">
              {submissionSuccessModal.applicationNo}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccessModal(null);
                  setActiveSubTab('list');
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-all"
              >
                {language === 'th' ? 'ดูรายการใบสมัครทั้งหมด' : 'View Applications List'}
              </button>
              <button
                type="button"
                onClick={() => setSubmissionSuccessModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-all"
              >
                {language === 'th' ? 'ปิด' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
