export type OffboardingStatus =
  | 'PENDING'
  | 'PENDING_HOD'
  | 'PENDING_HR'
  | 'APPROVED'
  | 'REJECTED'
  | 'DECLINED'
  | 'COMPLETED'
  | string;

export type OffboardingApprovalStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

export type OffboardingType =
  | 'RESIGNATION'
  | 'TERMINATION'
  | 'RETIREMENT'
  | 'END_OF_CONTRACT'
  | string;

export interface OffboardingRecord {
  id: number;
  employeeId: number;
  employeeName?: string;
  employeeNumber?: string;
  offboardingType?: OffboardingType;
  reason: string;
  lastWorkingDay: string;
  notes?: string;
  status: OffboardingStatus;
  approvalStatus: OffboardingApprovalStatus | string;
  headOfDepartmentApprovalStatus: OffboardingApprovalStatus | string;
  hrManagerApprovalStatus: OffboardingApprovalStatus | string;
  headOfDepartmentApprovalComment?: string;
  hrManagerApprovalComment?: string;
  headOfDepartmentApprovalOn?: string;
  hrManagerApprovalOn?: string;
  headOfDepartmentName?: string;
  hrManagerName?: string;
  hrApproved?: boolean;
  hodApproved?: boolean;
  createdOn?: string;
  updatedOn?: string;
}

export interface OffboardingUpsertRequest {
  employeeId: number;
  offboardingType: OffboardingType;
  reason: string;
  lastWorkingDay: string;
  notes?: string;
}

export interface OffboardingCreateRequest {
  offboardingType: OffboardingType;
  exitDate: string;
  reason: string;
  comments?: string;
}
