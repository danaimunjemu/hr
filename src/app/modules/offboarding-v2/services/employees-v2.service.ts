import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import {
  Employee,
  EmployeesService
} from '../../../features/employees/services/employees.service';
import { EmployeeSummary } from '../models/employee-summary.model';
import { OffboardingV2MockStore } from './offboarding-v2-mock.store';

@Injectable()
export class EmployeesV2Service {
  private warned = false;

  readonly employees$: Observable<EmployeeSummary[]>;

  constructor(
    private readonly employeesService: EmployeesService,
    private readonly mock: OffboardingV2MockStore
  ) {
    this.employees$ = this.employeesService.getEmployees().pipe(
      map((employees) => employees.map((employee) => this.toEmployeeSummary(employee))),
      catchError((error: unknown) => {
        if (!this.warned) {
          this.warned = true;
          console.warn('[offboarding-v2] Falling back to in-memory mock for employees', error);
        }
        return this.mock.getEmployees();
      }),
      catchError(() => of([])),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getEmployees(): Observable<EmployeeSummary[]> {
    return this.employees$.pipe(
      catchError(() => of([]))
    );
  }

  private toEmployeeSummary(employee: Employee): EmployeeSummary {
    const managerId =
      typeof employee.superior === 'object' && employee.superior !== null
        ? String((employee.superior as { id?: number }).id ?? '')
        : null;

    return {
      employeeId: String(employee.id),
      employeeNumber: employee.employeeNumber || String(employee.id),
      fullName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
      department:
        employee.organizationalUnit?.name ||
        employee.company?.name ||
        employee.personnelArea?.name ||
        '-',
      jobTitle: employee.jobDescription?.name || employee.position?.name || '-',
      organizationalUnit: Number(employee.organizationalUnit?.id || 0),
      managerId: managerId && managerId.length > 0 ? managerId : null,
      managerName:
        typeof employee.superior === 'object' && employee.superior !== null
          ? String(
              (employee.superior as { firstName?: string; lastName?: string; name?: string }).name ||
                `${(employee.superior as { firstName?: string }).firstName || ''} ${(employee.superior as { lastName?: string }).lastName || ''}`.trim()
            )
          : undefined,
      employeeType: employee.employmentType || 'Permanent',
      startDate: employee.dateJoined || '',
      yearsOfService: this.computeYearsOfService(employee.dateJoined)
    };
  }

  private computeYearsOfService(dateJoined: string): number {
    if (!dateJoined) {
      return 0;
    }
    const start = new Date(dateJoined);
    if (Number.isNaN(start.getTime())) {
      return 0;
    }
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const anniversaryPassed =
      now.getMonth() > start.getMonth() ||
      (now.getMonth() === start.getMonth() && now.getDate() >= start.getDate());
    return anniversaryPassed ? years : Math.max(0, years - 1);
  }
}
