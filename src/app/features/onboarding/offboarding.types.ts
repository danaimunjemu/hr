// offboarding.types.ts
export type OffboardingStatus =
  | 'PENDING_HOD'
  | 'PENDING_HR'
  | 'APPROVED'
  | 'DECLINED';

export type OffboardingType =
  | 'RESIGNATION'
  | 'TERMINATION'
  | 'RETIREMENT'
  | string;

export interface Offboarding {
  id: number;
  offboardingType: OffboardingType;
  exitDate: string;
  reason: string;
  comments?: string;
  status: OffboardingStatus;
  userActive?: boolean;
  employeeId?: number;
  createdOn?: string;
}
