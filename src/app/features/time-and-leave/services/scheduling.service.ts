import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

// Use the Employee from the EmployeesService (not the model file, to avoid conflicts)
// But we need the WorkContract and WorkScheduleRule models from Time & Leave
import { Employee, EmployeesService } from '../../employees/services/employees.service';
import { DailyShiftAssignment } from '../models/daily-shift-assignment.model';
import { ScheduleException } from '../models/schedule-exception.model';
import { EmployeeScheduleOverride } from '../models/employee-schedule-override.model';
import { GroupScheduleRule } from '../models/group-schedule-rule.model';
import { WorkScheduleRule } from '../models/work-schedule-rule.model';
import { WorkContract } from '../models/work-contract.model';
import { ShiftDefinition } from '../models/shift-definition.model';
import { WorkContractService } from './work-contract.service';
import { WorkScheduleRuleService } from './work-schedule-rule.service';

export interface ResolvedSchedule {
  source: 'EXCEPTION_EMPLOYEE' | 'EXCEPTION_GROUP' | 'SHIFT_ASSIGNMENT' | 'OVERRIDE' | 'GROUP_RULE' | 'WORK_SCHEDULE' | 'CONTRACT';
  date: string;
  isOffDay: boolean;
  startTime?: string;
  endTime?: string;
  totalHours: number;
  breakMinutes: number;
  shiftName?: string;
  shiftDefinitionId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  private readonly apiUrl = 'http://localhost:8090/api';

  constructor(
    private http: HttpClient,
    private employeesService: EmployeesService,
    private workContractService: WorkContractService,
    private workScheduleRuleService: WorkScheduleRuleService
  ) {}

  /**
   * Calculates the effective schedule for a specific employee and date.
   */
  resolveSchedule(employeeId: number, date: Date): Observable<ResolvedSchedule> {
    const dateStr = this.dateToString(date);

    // 1. Fetch Employee details (includes shallow references to Group, Contract, WorkScheduleRule)
    return this.employeesService.getById(employeeId).pipe(
      switchMap(employee => {
        // 2. Fetch all potential schedule sources in parallel
        const requests = {
          employeeExceptions: this.getEmployeeExceptions(employeeId),
          groupExceptions: employee.group ? this.getGroupExceptions(employee.group.id) : of([]),
          dailyAssignment: this.getDailyAssignment(employeeId, dateStr),
          overrides: this.getEmployeeOverrides(employeeId),
          groupRules: employee.group ? this.getGroupRules(employee.group.id) : of([]),
          
          // Fetch full Work Contract if linked
          workContract: employee.workContract ? this.workContractService.getById(employee.workContract.id).pipe(catchError(() => of(null))) : of(null),
          
          // Fetch full Work Schedule Rule if linked
          workScheduleRule: employee.workScheduleRule ? this.workScheduleRuleService.getById(employee.workScheduleRule.id).pipe(catchError(() => of(null))) : of(null)
        };

        return forkJoin(requests).pipe(
          map(results => {
            return this.applyResolutionLogic(
              employee,
              date,
              dateStr,
              results.employeeExceptions,
              results.groupExceptions,
              results.dailyAssignment,
              results.overrides,
              results.groupRules,
              results.workContract,
              results.workScheduleRule
            );
          })
        );
      })
    );
  }

  // --- API Methods ---

  private getEmployeeExceptions(employeeId: number): Observable<ScheduleException[]> {
    const params = new HttpParams().set('employeeId', employeeId.toString());
    return this.http.get<ScheduleException[]>(`${this.apiUrl}/schedule-exceptions`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  private getGroupExceptions(groupId: number): Observable<ScheduleException[]> {
    const params = new HttpParams().set('groupId', groupId.toString());
    return this.http.get<ScheduleException[]>(`${this.apiUrl}/schedule-exceptions`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  private getDailyAssignment(employeeId: number, date: string): Observable<DailyShiftAssignment | null> {
    const params = new HttpParams()
      .set('employeeId', employeeId.toString())
      .set('date', date);
    // Assuming backend returns an array or single object. If array, take first.
    return this.http.get<DailyShiftAssignment[]>(`${this.apiUrl}/shift-assignments`, { params }).pipe(
      map(data => data && data.length > 0 ? data[0] : null),
      catchError(() => of(null))
    );
  }

  private getEmployeeOverrides(employeeId: number): Observable<EmployeeScheduleOverride[]> {
    const params = new HttpParams().set('employeeId', employeeId.toString());
    return this.http.get<EmployeeScheduleOverride[]>(`${this.apiUrl}/employee-schedule-overrides`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  private getGroupRules(groupId: number): Observable<GroupScheduleRule[]> {
    const params = new HttpParams().set('groupId', groupId.toString());
    return this.http.get<GroupScheduleRule[]>(`${this.apiUrl}/group-schedule-rules`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  // --- Resolution Logic ---

  private applyResolutionLogic(
    employee: Employee,
    dateObj: Date,
    dateStr: string,
    empExceptions: ScheduleException[],
    groupExceptions: ScheduleException[],
    dailyAssignment: DailyShiftAssignment | null,
    overrides: EmployeeScheduleOverride[],
    groupRules: GroupScheduleRule[],
    workContract: WorkContract | null,
    workScheduleRule: WorkScheduleRule | null
  ): ResolvedSchedule {

    // 1. Employee Exception
    const empEx = empExceptions.find(e => e.exceptionDate === dateStr);
    if (empEx) {
      return this.mapExceptionToSchedule(empEx, 'EXCEPTION_EMPLOYEE', dateStr);
    }

    // 2. Group Exception
    const groupEx = groupExceptions.find(e => e.exceptionDate === dateStr);
    if (groupEx) {
      return this.mapExceptionToSchedule(groupEx, 'EXCEPTION_GROUP', dateStr);
    }

    // 3. Shift Assignment (Daily)
    if (dailyAssignment) {
      return {
        source: 'SHIFT_ASSIGNMENT',
        date: dateStr,
        isOffDay: false,
        startTime: dailyAssignment.shiftDefinition.startTime,
        endTime: dailyAssignment.shiftDefinition.endTime,
        totalHours: dailyAssignment.shiftDefinition.paidHours,
        breakMinutes: dailyAssignment.shiftDefinition.breakMinutes,
        shiftName: dailyAssignment.shiftDefinition.name,
        shiftDefinitionId: dailyAssignment.shiftDefinition.id
      };
    }

    // 4. Employee Schedule Override
    const activeOverride = this.findActiveRule(overrides, dateObj);
    if (activeOverride) {
      const result = this.resolveRotation(activeOverride, dateObj);
      if (result.isOffWeek) {
        return {
          source: 'OVERRIDE',
          date: dateStr,
          isOffDay: true,
          totalHours: 0,
          breakMinutes: 0,
          shiftName: 'Off Week (Override)'
        };
      }
      if (result.shift) {
        return {
          source: 'OVERRIDE',
          date: dateStr,
          isOffDay: false,
          startTime: result.shift.startTime,
          endTime: result.shift.endTime,
          totalHours: result.shift.paidHours,
          breakMinutes: result.shift.breakMinutes,
          shiftName: result.shift.name,
          shiftDefinitionId: result.shift.id
        };
      }
    }

    // 5. Group Schedule Rule
    const activeGroupRule = this.findActiveRule(groupRules, dateObj);
    if (activeGroupRule) {
      const result = this.resolveRotation(activeGroupRule, dateObj);
      if (result.isOffWeek) {
        return {
          source: 'GROUP_RULE',
          date: dateStr,
          isOffDay: true,
          totalHours: 0,
          breakMinutes: 0,
          shiftName: 'Off Week (Group)'
        };
      }
      if (result.shift) {
        return {
          source: 'GROUP_RULE',
          date: dateStr,
          isOffDay: false,
          startTime: result.shift.startTime,
          endTime: result.shift.endTime,
          totalHours: result.shift.paidHours,
          breakMinutes: result.shift.breakMinutes,
          shiftName: result.shift.name,
          shiftDefinitionId: result.shift.id
        };
      }
    }

    // 6. Work Schedule Rule
    if (workScheduleRule) {
      // Check weekend rule
      if (this.isWeekend(dateObj, workScheduleRule)) {
         return {
          source: 'WORK_SCHEDULE',
          date: dateStr,
          isOffDay: true,
          totalHours: 0,
          breakMinutes: 0,
          shiftName: 'Weekend'
        };
      }

      return {
        source: 'WORK_SCHEDULE',
        date: dateStr,
        isOffDay: false,
        startTime: workScheduleRule.startTime,
        endTime: workScheduleRule.endTime,
        totalHours: workScheduleRule.paidHours,
        breakMinutes: workScheduleRule.breakMinutes,
        shiftName: workScheduleRule.name,
        shiftDefinitionId: workScheduleRule.id
      };
    }

    // 7. Work Contract (Fallback)
    if (workContract) {
      return {
        source: 'CONTRACT',
        date: dateStr,
        isOffDay: false,
        totalHours: workContract.normalHoursPerDay,
        breakMinutes: 0,
        shiftName: 'Contract Default'
      };
    }

    // Default Fallback
    return {
      source: 'CONTRACT',
      date: dateStr,
      isOffDay: true,
      totalHours: 0,
      breakMinutes: 0,
      shiftName: 'None'
    };
  }

  // --- Helpers ---

  private mapExceptionToSchedule(ex: ScheduleException, source: 'EXCEPTION_EMPLOYEE' | 'EXCEPTION_GROUP', date: string): ResolvedSchedule {
    if (ex.offDay) {
      return {
        source,
        date,
        isOffDay: true,
        totalHours: 0,
        breakMinutes: 0,
        shiftName: 'Off Day Exception'
      };
    } else if (ex.shiftDefinition) {
      return {
        source,
        date,
        isOffDay: false,
        startTime: ex.shiftDefinition.startTime,
        endTime: ex.shiftDefinition.endTime,
        totalHours: ex.shiftDefinition.paidHours,
        breakMinutes: ex.shiftDefinition.breakMinutes,
        shiftName: ex.shiftDefinition.name,
        shiftDefinitionId: ex.shiftDefinition.id
      };
    }
    return {
      source,
      date,
      isOffDay: true,
      totalHours: 0,
      breakMinutes: 0,
      shiftName: 'Unknown Exception'
    };
  }

  private findActiveRule<T extends { effectiveFrom: string }>(rules: T[], date: Date): T | undefined {
    // Find rules that started on or before date
    // Sort by effectiveFrom desc to get latest
    const validRules = rules.filter(r => new Date(r.effectiveFrom) <= date);
    validRules.sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime());
    return validRules[0];
  }

  private resolveRotation(rule: EmployeeScheduleOverride | GroupScheduleRule, date: Date): { shift: ShiftDefinition | null, isOffWeek: boolean } {
    if (rule.rotationType === 'FIXED') {
      return { shift: rule.shiftDefinition || null, isOffWeek: false };
    } else if (rule.rotationType === 'ROTATING' && rule.rotationShifts && rule.rotationShifts.length > 0) {
      // Normalize dates to midnight local to avoid timezone issues
      const start = new Date(rule.cycleStartDate);
      start.setHours(0, 0, 0, 0);
      
      const target = new Date(date);
      target.setHours(0, 0, 0, 0);

      const diffTime = target.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { shift: null, isOffWeek: false }; // Date is before cycle start

      const cycleLenDays = rule.cycleOnWeeks * 7;
      const fullCycleDays = (rule.cycleOnWeeks + rule.cycleOffWeeks) * 7;
      
      const dayInFullCycle = diffDays % fullCycleDays;

      if (dayInFullCycle >= cycleLenDays) {
        // In off weeks
        return { shift: null, isOffWeek: true };
      }

      // We are in on weeks.
      // Assuming rotationShifts sequence maps to weeks
      const weekIndex = Math.floor(dayInFullCycle / 7); // 0-based week index
      
      const shifts = rule.rotationShifts.sort((a, b) => a.sequence - b.sequence);
      if (shifts.length === 0) return { shift: null, isOffWeek: false };

      const shiftIndex = weekIndex % shifts.length;
      return { shift: shifts[shiftIndex].shiftDefinition, isOffWeek: false };
    }
    return { shift: null, isOffWeek: false };
  }

  calculateEffectiveHours(
    workedStartStr: string,
    workedEndStr: string,
    breakMinutes: number,
    schedule: ResolvedSchedule
  ): { normalHours: number, overtimeHours: number } {
    const workedMinutes = this.calculateDurationMinutes(workedStartStr, workedEndStr) - breakMinutes;
    const workedHours = Math.max(0, workedMinutes / 60);

    if (schedule.isOffDay) {
      return { normalHours: 0, overtimeHours: workedHours };
    }

    const scheduledHours = schedule.totalHours;
    
    // Simplistic Logic: Overtime is anything worked beyond scheduled hours
    // (A more complex logic might check if worked hours are *outside* the specific scheduled window)
    
    let normalHours = Math.min(workedHours, scheduledHours);
    let overtimeHours = Math.max(0, workedHours - scheduledHours);

    return { normalHours, overtimeHours };
  }

  private calculateDurationMinutes(start: string, end: string): number {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    
    let minutes1 = h1 * 60 + m1;
    let minutes2 = h2 * 60 + m2;
    
    if (minutes2 < minutes1) {
      // Assuming next day crossover if end < start, add 24 hours
      minutes2 += 24 * 60;
    }
    
    return minutes2 - minutes1;
  }

  private isWeekend(date: Date, rule: WorkScheduleRule): boolean {
    if (!rule.weekendRule) return false;
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    if (day === 0 && rule.weekendRule.sunday) return true;
    if (day === 6 && rule.weekendRule.saturday) return true;
    return false;
  }

  private dateToString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
