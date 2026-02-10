export interface OhsWorkFlowApprovalRequestDto {
  incidentId: string;
  comment: string;
}

export type OhsWorkflowStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export type IncidentType = 'INJURY' | 'ILLNESS' | 'ENVIRONMENTAL' | 'PROPERTY_DAMAGE' | 'VEHICLE' | 'FIRE' | 'OTHER';
export type InjuryType = 'NONE' | 'FIRST_AID' | 'MEDICAL_TREATMENT' | 'LOST_TIME' | 'FATALITY';
export type ActionStatus = 'OVERDUE' | 'CANCELLED' | 'PENDING_VERIFICATION' | 'IN_PROGRESS' | 'OPEN' | 'COMPLETED';

export interface OhsAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

export interface SafetyIncident {
  id: string;
  incidentType: IncidentType;
  injuryOccurred: InjuryType;
  severity: 'MINOR' | 'MODERATE' | 'SERIOUS' | 'MAJOR' | 'FATALITY' | 'CATASTROPHIC';
  incidentDateTime: string; // LocalDateTime
  location: string;
  reportedBy: any; // Employee object or ID
  dateReported: string; // LocalDate
  
  description: string; // Keeping for compatibility, map to injuryDetails if needed or separate
  injuryDetails: string;
  medicalTreatmentRequired: boolean;
  medicalTreatmentDetails: string;
  daysLost: number;
  immediateActions: string;
  rootCauseAnalysis: string;
  investigationStatus: ActionStatus;
  investigationCompletedDate: string;
  investigationFindings: string;
  correctiveActions: string;
  closed: boolean;
  closedDate: string;
  attachments: OhsAttachment[];

  status: OhsWorkflowStatus;
  referenceNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NearMissReport {
  id: string;
  incidentDateTime: string; // LocalDateTime
  location: string;
  potentialSeverity: 'MINOR' | 'MODERATE' | 'SERIOUS' | 'MAJOR' | 'CATASTROPHIC' | 'FATALITY';
  description: string;
  potentialConsequences?: string;
  reportedBy: any; // Employee object or ID
  dateReported: string; // LocalDate
  anonymous: boolean;
  attachments: OhsAttachment[];
  status: OhsWorkflowStatus;
  createdAt?: string;
}

export interface MedicalSurveillance {
  id: string;
  employee: any; // Employee object or ID
  examinationType: string;
  examinationDate: string; // LocalDate
  nextExaminationDue?: string; // LocalDate
  medicalProvider?: string;
  examiningDoctor?: string;
  fitnessStatus: boolean;
  restrictions?: string;
  restrictionEndDate?: string; // LocalDate
  reportedBy: any; // Employee object or ID
  dateReported: string; // LocalDate
  recommendations?: string;
  status: OhsWorkflowStatus;
  createdAt?: string;
}

export interface Induction {
  id: string;
  title: string;
  description: string;
  validFrom: string;
  validUntil: string;
  requiredForRoles: string[];
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface CorrectiveAction {
  id: string;
  incidentId?: string; // Optional link to incident
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'CLOSED';
  verified?: boolean;
  completionDate?: string;
}
