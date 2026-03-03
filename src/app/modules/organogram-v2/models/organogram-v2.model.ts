export interface CompanyDto {
  id: number;
  name: string;
  code: string;
  parentCompany?: string;
  subsidiaries?: string[];
}

export interface EmployeeDto {
  employeeId: number;
  fullName: string;
  jobTitle: string;
  department: string;
  directManager: string;
}

export interface RoleDto {
  companyRoleId: number;
  roleName: string;
  employees: EmployeeDto[];
}

export interface RoleGroupDto {
  level: number;
  roles: RoleDto[];
}

export interface CompanyOrganogramDto {
  companyId: number;
  companyName: string;
  rolesGroupedByLevel: RoleGroupDto[];
  subsidiaries: string[];
}
