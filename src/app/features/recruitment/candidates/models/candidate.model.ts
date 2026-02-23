import { JobVacancy } from '../../job-vacancies/models/job-vacancy.model';
import { Employee } from '../../../employees/models/employee.model';

export type CandidateStatus = 'New' | 'Review' | 'Interview' | 'Offer' | 'Rejected' | 'Hired';

export interface Candidate {
    id: number;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    nationalId?: string;
    phone?: string;
    linkedInProfile?: string;
    currentAddress?: string;
    currentEmployer?: string;
    currentJobTitle?: string;
    resumePath?: string;
    resumeFileName?: string;
    coverLetterPath?: string;
    jobVacancy: JobVacancy;
    employee?: Employee; // Only for internal candidates
    status: CandidateStatus;
    source: string;
    sourceDetails?: string;
    applicationDate: string;
    expectedSalary?: number;
    availableFrom?: string;
    noticePeriodDays?: number;
    willingToRelocate?: boolean;
    skills?: string;
    qualifications?: string;
    yearsOfExperience?: number;
    notes?: string;
    jobOffer?: any; // To be defined more precisely if needed
    referralCandidate?: boolean;
    referredBy?: string;
    blacklisted?: boolean;
    blacklistReason?: string;
    createdOn?: string;
    updatedOn?: string;
}

export interface InternalApplicationPayload {
    jobVacancyId: string;
    // Add other fields as per API if different from standard POST
}
