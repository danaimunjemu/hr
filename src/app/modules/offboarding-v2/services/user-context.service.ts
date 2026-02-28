import { Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, Observable, shareReplay, startWith } from 'rxjs';
import { AuthService } from '../../../features/authentication/services/auth';
import { CurrentUserContext, EmployeeSummary } from '../models/employee-summary.model';
import { EmployeesV2Service } from './employees-v2.service';

export function computeVisibleEmployeeIds(
  user: CurrentUserContext,
  employees: EmployeeSummary[]
): string[] {
  if (user.organizationalUnit === 9010) {
    return Array.from(new Set(employees.map((item) => item.employeeId)));
  }

  const subordinates = employees
    .filter((item) => item.managerId === user.employeeId)
    .map((item) => item.employeeId);

  if (subordinates.length > 0) {
    return Array.from(new Set([user.employeeId, ...subordinates]));
  }

  return [user.employeeId];
}

@Injectable()
export class UserContextService {
  readonly currentUser$: Observable<CurrentUserContext>;
  readonly isHR$: Observable<boolean>;
  readonly visibleEmployeeIds$: Observable<string[]>;
  readonly visibleEmployees$: Observable<EmployeeSummary[]>;
  readonly hasSubordinates$: Observable<boolean>;

  constructor(
    authService: AuthService,
    private readonly employeesService: EmployeesV2Service
  ) {
    const fallbackUser = this.resolveUser(authService.currentUser());
    this.currentUser$ = toObservable(authService.currentUser).pipe(
      startWith(authService.currentUser()),
      map((user) => this.resolveUser(user) || fallbackUser),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.isHR$ = this.currentUser$.pipe(
      map((user) => user.organizationalUnit === 9010),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.visibleEmployeeIds$ = combineLatest([
      this.currentUser$,
      this.employeesService.getEmployees()
    ]).pipe(
      map(([user, employees]) => computeVisibleEmployeeIds(user, employees)),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.visibleEmployees$ = combineLatest([
      this.visibleEmployeeIds$,
      this.employeesService.getEmployees()
    ]).pipe(
      map(([, employees]) => employees),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.hasSubordinates$ = combineLatest([
      this.currentUser$,
      this.employeesService.getEmployees()
    ]).pipe(
      map(([user, employees]) =>
        employees.some((employee) => employee.managerId === user.employeeId)
      ),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private resolveUser(raw: unknown): CurrentUserContext {
    if (raw && typeof raw === 'object') {
      const value = raw as Record<string, unknown>;
      const employeeObj =
        value['employee'] && typeof value['employee'] === 'object'
          ? (value['employee'] as Record<string, unknown>)
          : null;
      const employeeId = String(
        value['employeeId'] ?? employeeObj?.['id'] ?? value['id'] ?? '1002'
      );
      const organizationalUnit = Number(value['organizationalUnit'] ?? 0);
      const roles = Array.isArray(value['roles'])
        ? value['roles'].map((item) => String(item))
        : [];
      return {
        employeeId,
        organizationalUnit,
        roles
      };
    }

    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        return this.resolveUser(JSON.parse(stored));
      } catch {
        return {
          employeeId: '1002',
          organizationalUnit: 3010,
          roles: []
        };
      }
    }

    return {
      employeeId: '1002',
      organizationalUnit: 3010,
      roles: []
    };
  }
}
