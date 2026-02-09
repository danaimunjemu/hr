import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SchedulingService, ResolvedSchedule } from '../../../../time-and-leave/services/scheduling.service';
import { Employee } from '../../../../employees/services/employees.service';
import { EmployeesService } from '../../../../employees/services/employees.service';

@Component({
  selector: 'app-schedule-checklist',
  standalone: false,
  template: `
    <nz-collapse [nzBordered]="false" class="bg-transparent">
      <nz-collapse-panel [nzHeader]="'Schedule Diagnostics: ' + (date | date)" [nzActive]="false">
        <nz-spin [nzSpinning]="loading">
          <div *ngIf="resolvedSchedule" class="space-y-2 text-sm">
            
            <!-- Source Check -->
            <div class="flex items-center gap-2">
              <span class="font-bold">Applied Rule:</span>
              <nz-tag [nzColor]="getSourceColor(resolvedSchedule.source)">{{ resolvedSchedule.source }}</nz-tag>
            </div>

            <!-- Configuration Missing Alerts -->
            <div *ngIf="!loading && employee" class="space-y-1">
              <div *ngIf="!employee.workContract" class="text-red-500 flex items-center gap-1">
                <span nz-icon nzType="warning"></span> Missing Work Contract
              </div>
              <div *ngIf="!employee.workScheduleRule" class="text-red-500 flex items-center gap-1">
                <span nz-icon nzType="warning"></span> Missing Work Schedule Rule
              </div>
              <div *ngIf="!employee.group" class="text-yellow-500 flex items-center gap-1">
                <span nz-icon nzType="info-circle"></span> No Employee Group assigned
              </div>
            </div>

            <nz-divider class="my-2"></nz-divider>

            <!-- Schedule Details -->
            <div class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-gray-500">Status:</span>
                <span [class.text-red-500]="resolvedSchedule.isOffDay" [class.text-green-500]="!resolvedSchedule.isOffDay">
                  {{ resolvedSchedule.isOffDay ? 'Off Day' : 'Working Day' }}
                </span>
              </div>
              <div *ngIf="!resolvedSchedule.isOffDay">
                <span class="text-gray-500">Shift:</span>
                <span>{{ resolvedSchedule.shiftName || 'N/A' }}</span>
              </div>
              <div *ngIf="!resolvedSchedule.isOffDay">
                <span class="text-gray-500">Time:</span>
                <span>{{ resolvedSchedule.startTime }} - {{ resolvedSchedule.endTime }}</span>
              </div>
              <div *ngIf="!resolvedSchedule.isOffDay">
                <span class="text-gray-500">Paid Hours:</span>
                <span>{{ resolvedSchedule.totalHours }}h</span>
              </div>
            </div>

            <!-- Rules Breakdown (Visual Indicator of what was checked) -->
            <nz-divider class="my-2" nzText="Resolution Path" nzOrientation="left"></nz-divider>
            <ul class="list-disc pl-4 text-xs text-gray-500">
              <li [class.text-blue-600]="resolvedSchedule.source === 'EXCEPTION_EMPLOYEE'">Employee Exception</li>
              <li [class.text-blue-600]="resolvedSchedule.source === 'EXCEPTION_GROUP'">Group Exception</li>
              <li [class.text-blue-600]="resolvedSchedule.source === 'SHIFT_ASSIGNMENT'">Daily Assignment</li>
              <li [class.text-blue-600]="resolvedSchedule.source === 'OVERRIDE'">Employee Override</li>
              <li [class.text-blue-600]="resolvedSchedule.source === 'GROUP_RULE'">Group Schedule Rule</li>
              <li [class.text-blue-600]="resolvedSchedule.source === 'WORK_SCHEDULE'">Work Schedule Rule</li>
              <li [class.text-blue-600]="resolvedSchedule.source === 'CONTRACT'">Work Contract (Fallback)</li>
            </ul>

          </div>
          <nz-empty *ngIf="!loading && !resolvedSchedule" nzNotFoundContent="No schedule data resolved"></nz-empty>
        </nz-spin>
      </nz-collapse-panel>
    </nz-collapse>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ScheduleChecklistComponent implements OnChanges {
  @Input() employeeId!: number;
  @Input() date!: string | Date; // Accept string or Date

  loading = false;
  resolvedSchedule: ResolvedSchedule | null = null;
  employee: Employee | null = null;

  constructor(
    private schedulingService: SchedulingService,
    private employeesService: EmployeesService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['employeeId'] || changes['date']) && this.employeeId && this.date) {
      this.loadDiagnostics();
    }
  }

  private loadDiagnostics(): void {
    this.loading = true;
    const dateObj = typeof this.date === 'string' ? new Date(this.date) : this.date;

    this.employeesService.getById(this.employeeId).subscribe(emp => this.employee = emp);

    this.schedulingService.resolveSchedule(this.employeeId, dateObj).subscribe({
      next: (schedule) => {
        this.resolvedSchedule = schedule;
        this.loading = false;
      },
      error: () => {
        this.resolvedSchedule = null;
        this.loading = false;
      }
    });
  }

  getSourceColor(source: string): string {
    switch (source) {
      case 'EXCEPTION_EMPLOYEE':
      case 'EXCEPTION_GROUP':
      case 'SHIFT_ASSIGNMENT':
        return 'volcano'; // High priority / manual overrides
      case 'OVERRIDE':
      case 'GROUP_RULE':
        return 'geekblue'; // Rotations / complex rules
      case 'WORK_SCHEDULE':
        return 'green'; // Standard rule
      default:
        return 'default'; // Fallback
    }
  }
}
