export interface OrganogramEmployee {
  id: number;
  employeeNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  positionName?: string | null;
  organizationalUnitName?: string | null;
  organizationalUnitId?: number | null;
}

export interface OrganogramPositionResponse {
  positionId?: number | null;
  positionName?: string | null;
  employees?: OrganogramEmployee[] | null;
  subordinates?: Array<OrganogramPositionResponse | string | number> | null;
}

export interface OrganogramEmployeeProfile {
  id: number;
  employeeNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  organizationalUnitName?: string | null;
  positionName?: string | null;
  employmentStatus?: string | null;
}

export interface OrganogramNode {
  id: string;
  name: string;
  title: string;
  department: string;
  employeeNumber: string;
  employeeId?: number | null;
  departmentId?: number | null;
  children?: OrganogramNode[];
  collapsed?: boolean;
  hidden?: boolean;
  nodeClass?: string;
}
