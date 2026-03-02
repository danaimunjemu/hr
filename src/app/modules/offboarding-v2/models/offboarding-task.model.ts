export type TaskDepartment = 'HR' | 'IT' | 'OPERATIONS' | 'LINE_MANAGER' | 'FINANCE';
export type TaskCompletionStatus = 'OPEN' | 'COMPLETED';

export interface OffboardingTask {
  taskId: string;
  offboardingId: string;
  department: TaskDepartment;
  taskName: string;
  taskOwnerId: number;
  taskOwner: string;
  taskOwnerEmployeeId?: number;
  taskDeadline: string;
  completionStatus: TaskCompletionStatus;
  completionDate?: string;
  evidenceFilePath?: string;
  systemName?: string;
  accessRevoked?: boolean;
  comment?: string;
}

export interface TaskCompletionPayload {
  completed: boolean;
  completionDate: string;
  evidenceFilePath?: string;
  systemName?: string;
  comment?: string;
  accessRevoked?: boolean;
  taskOwnerId: number;
}
