import { Member } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateMemberRelationships(members: Member[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const memberMap = new Map<string, Member>();

  members.forEach(m => {
    if (memberMap.has(m.id)) {
      errors.push(`พบรหัสสมาชิกซ้ำซ้อน: ${m.id} (${m.name})`);
    }
    memberMap.set(m.id, m);

    // Negative value checks
    if (m.personalFYC < 0) {
      errors.push(`สมาชิก ${m.name} (${m.memberCode}) มีค่า FYC ติดลบ: ${m.personalFYC}`);
    }
    if (m.personalCOM < 0) {
      errors.push(`สมาชิก ${m.name} (${m.memberCode}) มีค่า COM ติดลบ: ${m.personalCOM}`);
    }
    if (m.renewalPremium < 0) {
      errors.push(`สมาชิก ${m.name} มีค่าเบี้ยปีต่อไปติดลบ`);
    }

    // Self sponsor check
    if (m.sponsorId === m.id) {
      errors.push(`สมาชิก ${m.name} (${m.memberCode}) ไม่สามารถเป็นผู้แนะนำ (Sponsor) ตนเองได้`);
    }
    if (m.parentMemberId === m.id) {
      errors.push(`สมาชิก ${m.name} (${m.memberCode}) ไม่สามารถเป็นหัวหน้าสายตรงตนเองได้`);
    }
  });

  // Cycle Detection (A -> B -> C -> A)
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(currentId: string, path: string[]): boolean {
    visited.add(currentId);
    recursionStack.add(currentId);

    const currentMember = memberMap.get(currentId);
    if (!currentMember) return false;

    const parentId = currentMember.parentMemberId || currentMember.sponsorId;
    if (parentId && memberMap.has(parentId)) {
      if (!visited.has(parentId)) {
        if (hasCycle(parentId, [...path, parentId])) return true;
      } else if (recursionStack.has(parentId)) {
        errors.push(`ตรวจพบการเชื่อมโยงวนลูป (Circular Hierarchy): ${[...path, parentId].join(' → ')}`);
        return true;
      }
    }

    recursionStack.delete(currentId);
    return false;
  }

  for (const member of members) {
    if (!visited.has(member.id)) {
      hasCycle(member.id, [member.id]);
    }
  }

  // Orphan checks
  members.forEach(m => {
    if (m.parentMemberId && !memberMap.has(m.parentMemberId)) {
      warnings.push(`สมาชิก ${m.name} ระบุหัวหน้าสายงาน ${m.parentMemberId} ที่ไม่มีอยู่ในระบบ`);
    }
    if (m.sponsorId && !memberMap.has(m.sponsorId)) {
      warnings.push(`สมาชิก ${m.name} ระบุผู้แนะนำ ${m.sponsorId} ที่ไม่มีอยู่ในระบบ`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateInputNumbers(val: number, fieldName: string, min = 0): { isValid: boolean; error?: string } {
  if (isNaN(val) || val === null || val === undefined) {
    return { isValid: false, error: `${fieldName} ต้องเป็นตัวเลขที่ถูกต้อง` };
  }
  if (val < min) {
    return { isValid: false, error: `${fieldName} ต้องไม่น้อยกว่า ${min}` };
  }
  return { isValid: true };
}
