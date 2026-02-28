export interface ExitInterviewResponse {
  offboardingId: string;
  submitted: boolean;
  skipped: boolean;
  reasonForLeaving?: string;
  managerRating?: 1 | 2 | 3;
  workEnvironmentRating?: 1 | 2 | 3;
  careerGrowthRating?: 1 | 2 | 3;
  recommendCompanyRating?: 1 | 2 | 3;
  companyDidWell?: string;
  improvementAreas?: string;
  considerReturning?: boolean;
  submittedAt?: string;
  submittedDate?: string;
}

export interface ExitInterviewSubmitPayload {
  skipped: boolean;
  reasonForLeaving?: string;
  managerRating?: 1 | 2 | 3;
  workEnvironmentRating?: 1 | 2 | 3;
  careerGrowthRating?: 1 | 2 | 3;
  recommendCompanyRating?: 1 | 2 | 3;
  companyDidWell?: string;
  improvementAreas?: string;
  considerReturning?: boolean;
}
