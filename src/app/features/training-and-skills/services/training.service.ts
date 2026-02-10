import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  TrainingProgram,
  TrainingSession,
  EmployeeSkill,
  TrainingStats,
  TrainingType,
  TrainingCategory,
  SkillLevel
} from '../models/training.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  // --- Dummy Data Storage ---
  private programs: TrainingProgram[] = [
    {
      id: '1',
      name: 'Cybersecurity Awareness',
      description: 'Annual mandatory security training.',
      trainingType: 'MANDATORY',
      category: 'COMPLIANCE',
      durationHours: 2,
      active: true,
      createdAt: '2025-01-01'
    },
    {
      id: '2',
      name: 'Advanced Angular Development',
      description: 'Deep dive into RxJS and Signals.',
      trainingType: 'OPTIONAL',
      category: 'TECHNICAL',
      durationHours: 16,
      active: true,
      createdAt: '2025-01-10'
    },
    {
      id: '3',
      name: 'Leadership 101',
      description: 'Core skills for new managers.',
      trainingType: 'CERTIFICATION',
      category: 'LEADERSHIP',
      durationHours: 24,
      active: true,
      createdAt: '2025-01-15'
    },
    {
      id: '4',
      name: 'Workplace Safety',
      description: 'OHS basic protocols.',
      trainingType: 'MANDATORY',
      category: 'COMPLIANCE',
      durationHours: 4,
      active: true,
      createdAt: '2025-02-01'
    }
  ];

  private sessions: TrainingSession[] = [
    {
      id: '101',
      programId: '1',
      programName: 'Cybersecurity Awareness',
      date: '2026-02-15',
      startTime: '10:00',
      endTime: '12:00',
      location: 'Online (Zoom)',
      trainer: 'IT Security Team',
      capacity: 100,
      enrolledCount: 45,
      status: 'SCHEDULED'
    },
    {
      id: '102',
      programId: '2',
      programName: 'Advanced Angular Development',
      date: '2026-02-20',
      startTime: '09:00',
      endTime: '17:00',
      location: 'Training Room A',
      trainer: 'John Doe',
      capacity: 20,
      enrolledCount: 15,
      status: 'SCHEDULED'
    },
    {
      id: '103',
      programId: '4',
      programName: 'Workplace Safety',
      date: '2026-02-10', // Past
      startTime: '13:00',
      endTime: '17:00',
      location: 'Main Hall',
      trainer: 'Safety Officer',
      capacity: 50,
      enrolledCount: 48,
      status: 'COMPLETED'
    }
  ];

  private skills: EmployeeSkill[] = [
    {
      id: '201',
      employeeId: 'EMP001',
      employeeName: 'Alice Johnson',
      skillName: 'Angular',
      level: 'EXPERT',
      lastAssessed: '2025-11-20'
    },
    {
      id: '202',
      employeeId: 'EMP002',
      employeeName: 'Bob Smith',
      skillName: 'Project Management',
      level: 'ADVANCED',
      lastAssessed: '2025-10-15',
      certificationExpiry: '2026-03-01' // Expiring soon
    },
    {
      id: '203',
      employeeId: 'EMP003',
      employeeName: 'Charlie Davis',
      skillName: 'Java',
      level: 'INTERMEDIATE',
      lastAssessed: '2026-01-10'
    },
    {
      id: '204',
      employeeId: 'EMP001',
      employeeName: 'Alice Johnson',
      skillName: 'Leadership',
      level: 'BEGINNER',
      lastAssessed: '2026-02-01'
    }
  ];

  constructor() {
    // In a real app, load from LocalStorage here if needed
    // this.loadFromStorage();
  }

  // --- Programs ---
  getPrograms(): Observable<TrainingProgram[]> {
    return of([...this.programs]);
  }

  getProgram(id: string): Observable<TrainingProgram | undefined> {
    return of(this.programs.find(p => p.id === id));
  }

  createProgram(program: Omit<TrainingProgram, 'id' | 'createdAt'>): Observable<TrainingProgram> {
    const newProgram: TrainingProgram = {
      ...program,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    this.programs.push(newProgram);
    return of(newProgram);
  }

  updateProgram(id: string, updates: Partial<TrainingProgram>): Observable<TrainingProgram> {
    const index = this.programs.findIndex(p => p.id === id);
    if (index !== -1) {
      this.programs[index] = { ...this.programs[index], ...updates };
      return of(this.programs[index]);
    }
    throw new Error('Program not found');
  }

  deleteProgram(id: string): Observable<void> {
    this.programs = this.programs.filter(p => p.id !== id);
    return of(void 0);
  }

  // --- Sessions ---
  getSessions(): Observable<TrainingSession[]> {
    // Enrich sessions with program names if missing
    const enriched = this.sessions.map(s => {
      const prog = this.programs.find(p => p.id === s.programId);
      return { ...s, programName: prog ? prog.name : 'Unknown Program' };
    });
    return of(enriched);
  }

  createSession(session: Omit<TrainingSession, 'id' | 'enrolledCount' | 'status'>): Observable<TrainingSession> {
    const newSession: TrainingSession = {
      ...session,
      id: uuidv4(),
      enrolledCount: 0,
      status: 'SCHEDULED'
    };
    this.sessions.push(newSession);
    return of(newSession);
  }

  // --- Skills ---
  getSkills(): Observable<EmployeeSkill[]> {
    return of([...this.skills]);
  }

  // --- Dashboard Stats ---
  getStats(): Observable<TrainingStats> {
    const totalPrograms = this.programs.filter(p => p.active).length;
    const upcomingSessions = this.sessions.filter(s => s.status === 'SCHEDULED').length;
    
    // Mock calculation for "Trained This Month" (Sessions completed in current month * enrolled)
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const completedThisMonth = this.sessions.filter(s => 
      s.status === 'COMPLETED' && s.date.startsWith(currentMonth)
    );
    const employeesTrainedMonth = completedThisMonth.reduce((acc, s) => acc + s.enrolledCount, 0);

    // Mock expiring certs (within next 30 days)
    const now = new Date();
    const future30 = new Date();
    future30.setDate(now.getDate() + 30);
    const expiringCertifications = this.skills.filter(s => {
      if (!s.certificationExpiry) return false;
      const expiry = new Date(s.certificationExpiry);
      return expiry >= now && expiry <= future30;
    }).length;

    return of({
      totalPrograms,
      upcomingSessions,
      employeesTrainedMonth,
      expiringCertifications,
      completionRate: 85, // Mock
      hoursByMonth: [
        { month: 'Sep', hours: 120 },
        { month: 'Oct', hours: 150 },
        { month: 'Nov', hours: 180 },
        { month: 'Dec', hours: 90 },
        { month: 'Jan', hours: 200 },
        { month: 'Feb', hours: 140 }
      ],
      typeDistribution: [
        { type: 'Technical', count: 45 },
        { type: 'Soft Skills', count: 25 },
        { type: 'Compliance', count: 30 }
      ],
      skillCoverage: [
        { skill: 'Angular', count: 12 },
        { skill: 'Java', count: 18 },
        { skill: 'Project Mgmt', count: 8 },
        { skill: 'Leadership', count: 15 },
        { skill: 'Security', count: 25 }
      ]
    });
  }
}
