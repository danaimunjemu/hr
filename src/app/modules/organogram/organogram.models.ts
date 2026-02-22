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
  positionId: number;
  positionName: string;
  employees: OrganogramEmployee[];
  subordinates: string[];
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

export interface OrganogramTreeNode {
  key: string;
  positionId: number;
  positionName: string;
  employees: OrganogramEmployee[];
  children: OrganogramTreeNode[];
  collapsed: boolean;
  parentKey: string | null;
  depth: number;
}
