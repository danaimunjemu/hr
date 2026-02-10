import { EmployeeRef, ErCase } from '../../cases/models/er-case.model';

export type TaskType = 'INVESTIGATION' | 'REVIEW' | 'MEETING' | 'DOCUMENTATION' | 'OTHER';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface CaseRef {
  id: number;
  caseNumber?: string;
  title?: string;
}

export interface ErTask {
  id: number;
  erCase: CaseRef;
  title: string;
  description?: string;
  taskType: TaskType;
  status: TaskStatus;
  assignedTo: EmployeeRef;
  dueAt?: string;
  completionNotes?: string;
  createdOn?: string;
  updatedOn?: string;
}
