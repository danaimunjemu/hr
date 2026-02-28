export type WorkflowNodeCode =
  | 'INITIATION'
  | 'TASK_EXECUTION'
  | 'ASSETS_RECOVERY'
  | 'EMPLOYEE_ACKNOWLEDGEMENT'
  | 'EXIT_INTERVIEW'
  | 'COMPLETION_ATTEMPT'
  | 'COMPLETED';

export type WorkflowNodeStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

export interface WorkflowNode {
  code: WorkflowNodeCode;
  label: string;
  status: WorkflowNodeStatus;
}

export interface WorkflowStatus {
  offboardingId: string;
  nodes: WorkflowNode[];
  readyForCompletion: boolean;
  currentStatus: 'INITIATED' | 'IN_PROGRESS' | 'BLOCKED' | 'READY_FOR_COMPLETION' | 'COMPLETED';
}
