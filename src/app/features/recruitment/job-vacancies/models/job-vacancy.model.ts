import { Position } from './position.model';
import { OrganisationalUnit } from './organisational-unit.model';
import { Employee } from './employee.model';

export enum JobPostingType {
    NEW_POSITION = 'NEW_POSITION',
    TEMPORARY = 'TEMPORARY',
    REPLACEMENT = 'REPLACEMENT',
    INTERNSHIP = 'INTERNSHIP',
    CONTRACT = 'CONTRACT',

}

export enum ApprovalStatus {
    PENDING = 'PENDING',
    APPROVE = 'APPROVE',
    DECLINE = 'DECLINE'
}

export enum JobVacancyStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    DECLINED = 'DECLINED'
}

export interface Company {
    id: string;
    name: string;
    code: string;
}

export interface JobVacancy {
    id: string;
    position: Position;
    organisationalUnit: OrganisationalUnit;
    company: Company;
    hiringManager: Employee;
    headOfDepartment: Employee;
    hrManager: Employee;
    jobPostingType: JobPostingType;
    status: JobVacancyStatus;
    numberOfPositions: number;
    positionsFilled: number;
    motivation: string;
    requestedDate: string;
    startDate: string;
    targetStartDate: string;
    internalOpportunity: boolean;
    headOfDepartmentApprovalStatus: ApprovalStatus;
    headOfDepartmentApprovalComment?: string;
    hrManagerApprovalStatus: ApprovalStatus;
    hrManagerApprovalComment?: string;
    overrideBy?: Employee;
}

export interface ApprovalRequestPayload {
    decision: ApprovalStatus;
    comment: string;
}
