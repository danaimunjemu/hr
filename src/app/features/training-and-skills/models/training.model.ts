export type TrainingType = 'MANDATORY' | 'OPTIONAL' | 'CERTIFICATION';
export type TrainingCategory = 'TECHNICAL' | 'SOFT_SKILLS' | 'COMPLIANCE' | 'LEADERSHIP';
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  trainingType: TrainingType;
  category: TrainingCategory;
  durationHours: number;
  active: boolean;
  createdAt: string;
}

export interface TrainingSession {
  id: string;
  programId: string;
  programName?: string;
  date: string; // ISO Date
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  trainer: string;
  capacity: number;
  enrolledCount: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface EmployeeSkill {
  id: string;
  employeeId: string;
  employeeName: string;
  skillName: string;
  level: SkillLevel;
  lastAssessed: string; // ISO Date
  certificationExpiry?: string; // ISO Date
}

export interface TrainingStats {
  totalPrograms: number;
  upcomingSessions: number;
  employeesTrainedMonth: number;
  expiringCertifications: number;
  completionRate: number; // Percentage
  hoursByMonth: { month: string; hours: number }[];
  typeDistribution: { type: string; count: number }[];
  skillCoverage: { skill: string; count: number }[];
}
