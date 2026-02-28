export interface EmployeeSummary {
  employeeId: string;
  employeeNumber: string;
  fullName: string;
  department: string;
  jobTitle: string;
  organizationalUnit: number;
  managerId: string | null;
  managerName?: string;
  employeeType: string;
  startDate: string;
  yearsOfService: number;
}

export interface CurrentUserContext {
  employeeId: string;
  organizationalUnit: number;
  roles: string[];
}
