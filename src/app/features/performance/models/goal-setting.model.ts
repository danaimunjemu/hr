export interface GoalSetting {
  id?: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  employeeName?: string;
  cycleName?: string;
  status?: string;
  submittedDate?: string;
  workFlowStatus?: string;
  employee?: GoalSettingEmployee;
  manager?: GoalSettingManager;
  cycle?: GoalSettingCycle;
  goals?: GoalSettingGoal[];
}

export interface GoalSettingEmployee {
  id?: number;
  firstName?: string;
  lastName?: string;
}

export interface GoalSettingManager {
  id?: number;
  firstName?: string;
  lastName?: string;
}

export interface GoalSettingCycle {
  id?: number;
  name?: string;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

export interface GoalSettingGoal {
  id?: number;
  description?: string;
  weight?: number;
  measurement?: string;
  dueDate?: string;
}

export enum AssignmentType {
  ALL_EMPLOYEES = 'ALL_EMPLOYEES',
  DEPARTMENT = 'DEPARTMENT'
}

export interface GoalSettingAssignmentRequest {
  employeeIds?: number[];
  assignmentType?: AssignmentType;
  departmentIds?: number[];
}
