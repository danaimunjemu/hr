export interface OrganogramEmployeeSummary {
  id: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  nationalId?: string | null;
  positionId?: number | null;
  positionName?: string | null;
  organizationalUnitId?: number | null;
  organizationalUnitName?: string | null;
}

export interface OrganogramNode {
  positionId: number;
  positionName: string;
  employees: OrganogramEmployeeSummary[];
  subordinates: string[];
}

export interface EmployeeProfileDto {
  id: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  positionId?: number | null;
  positionName?: string | null;
  organizationalUnitId?: number | null;
  organizationalUnitName?: string | null;
  dateJoined?: string | null;
  employmentType?: string | null;
  lifecycleStage?: string | null;
  managerName?: string | null;
  managerId?: number | null;
  superior?: unknown;
  subordinates?: string[] | null;
}
