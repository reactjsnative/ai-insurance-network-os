export type RegistrationStep = 1 | 2 | 3 | 4;

export type ApplicationStatus = 'pending_review' | 'document_verified' | 'exam_passed' | 'approved' | 'rejected';

export type AgentLicenseStatus = 'has_license' | 'exam_passed' | 'exam_scheduled' | 'needs_training' | 'no_license';

export type ExperienceLevel = 'newcomer' | 'under_1_year' | '1_to_3_years' | '3_to_5_years' | 'over_5_years';

export type TargetPositionPreference = 'agent' | 'unit_manager_fast_track' | 'center_executive_track';

export interface AgentApplication {
  id: string;
  applicationNo: string;
  submittedAt: string;
  status: ApplicationStatus;
  
  // Step 1: Personal Profile
  prefix: 'นาย' | 'นาง' | 'นางสาว' | 'Mr.' | 'Mrs.' | 'Ms.';
  firstName: string;
  lastName: string;
  nickname: string;
  nationalId: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  lineId: string;
  currentAddress: string;
  province: string;
  district: string;
  postalCode: string;
  region: 'Bangkok & Metro' | 'Central' | 'North' | 'Northeast' | 'East' | 'South';
  
  // Step 2: Education & Background
  educationLevel: 'high_school' | 'vocational' | 'bachelor' | 'master' | 'doctorate';
  major: string;
  university: string;
  currentOccupation: string;
  experienceLevel: ExperienceLevel;
  insuranceExperienceYears: number;
  previousCompany?: string;
  
  // Step 3: OIC License & Qualifications (คปภ.)
  licenseStatus: AgentLicenseStatus;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  hasGeneralInsuranceLicense: boolean;
  hasICLicense: boolean; // Investment Consultant
  examDate?: string;
  
  // Step 4: Sponsor & Career Pathway
  sponsorMemberId: string;
  sponsorCode: string;
  sponsorName: string;
  targetPositionPreference: TargetPositionPreference;
  targetMonthlyIncomeGoal: number;
  targetYearlyFYCGoal: number;
  expectedStartDate: string;
  recruitmentChannel: 'direct_referral' | 'social_media' | 'seminar' | 'company_booth' | 'online_ad' | 'other';
  motivationNote: string;
  
  // Documents checklist
  documents: {
    idCardUploaded: boolean;
    idCardFileName?: string;
    photoUploaded: boolean;
    photoFileName?: string;
    educationCertUploaded: boolean;
    educationCertFileName?: string;
    oicLicenseUploaded: boolean;
    oicLicenseFileName?: string;
    bankBookUploaded: boolean;
    bankBookFileName?: string;
  };
  
  // Internal Review Notes
  reviewerNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  assignedMemberCode?: string;
}
