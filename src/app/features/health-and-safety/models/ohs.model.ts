export interface OhsWorkFlowApprovalRequestDto {
  incidentId: string;
  comment: string;
}

export type OhsWorkflowStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface SafetyIncident {
  id: string;
  incidentDate: string;
  description: string;
  location: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: OhsWorkflowStatus;
  reportedBy: string; // Employee ID or Name
  createdAt?: string;
  updatedAt?: string;
}

export interface NearMissReport {
  id: string;
  incidentDate: string;
  description: string;
  location: string;
  potentialSeverity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: OhsWorkflowStatus;
  reportedBy: string;
}

export interface MedicalSurveillance {
  id: string;
  employeeId: string;
  checkupDate: string;
  type: string; // e.g., 'Annual', 'Pre-employment'
  result: string;
  status: OhsWorkflowStatus;
  notes?: string;
}

export interface Induction {
  id: string;
  title: string;
  description: string;
  validFrom: string;
  validUntil: string;
  requiredForRoles: string[];
}

export interface CorrectiveAction {
  id: string;
  incidentId?: string; // Optional link to incident
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  completionDate?: string;
}
