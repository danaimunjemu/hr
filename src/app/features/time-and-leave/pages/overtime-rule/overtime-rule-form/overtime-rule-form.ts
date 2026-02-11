import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OvertimeRuleService } from '../../../services/overtime-rule.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OvertimeRule } from '../../../models/overtime-rule.model';
import { OrganizationalUnitsService } from '../../../../settings/services/organizational-units.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-overtime-rule-form',
  standalone: false,
  templateUrl: './overtime-rule-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class OvertimeRuleFormComponent implements OnInit {
  form: FormGroup;
  isEditMode: WritableSignal<boolean> = signal(false);
  ruleId: WritableSignal<number | null> = signal(null);
  loading: WritableSignal<boolean> = signal(false);
  submitting: WritableSignal<boolean> = signal(false);

  orgUnits$: Observable<any[]>;

  overtimeTypes = [
    { label: 'Standard', value: 'STANDARD' },
    { label: 'Night Shift', value: 'NIGHT_SHIFT' },
    { label: 'Weekend', value: 'WEEKEND' },
    { label: 'Public Holiday', value: 'PUBLIC_HOLIDAY' },
    { label: 'Double Time', value: 'DOUBLE_TIME' },
    { label: 'Call Out', value: 'CALL_OUT' },
    { label: 'Standby', value: 'STANDBY' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ruleService: OvertimeRuleService,
    private message: NzMessageService,
    private orgUnitService: OrganizationalUnitsService
  ) {
    this.orgUnits$ = this.orgUnitService.getAll();

    this.form = this.fb.group({
      ruleCode: ['', [Validators.required]],
      ruleName: ['', [Validators.required]],
      description: [''],
      overtimeType: ['STANDARD', [Validators.required]],
      multiplier: [1.5, [Validators.required, Validators.min(0)]],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      appliesToWeekdays: [true],
      appliesToSaturdays: [false],
      appliesToSundays: [false],
      appliesToPublicHolidays: [false],
      organizationalUnitId: [null, [Validators.required]],
      effectiveFrom: [null, [Validators.required]],
      effectiveTo: [null, [Validators.required]],
      active: [true],
      priority: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        const id = +params['id'];
        this.isEditMode.set(true);
        this.ruleId.set(id);
        this.loadRule(id);
      }
    });
  }

  loadRule(id: number): void {
    this.loading.set(true);
    this.ruleService.getById(id).subscribe({
      next: (rule: any) => {
        // Transform backend time objects {hour, minute...} to Date objects for nz-time-picker
        const startDate = this.timeToDate(rule.startTime);
        const endDate = this.timeToDate(rule.endTime);

        this.form.patchValue({
          ...rule,
          startTime: startDate,
          endTime: endDate,
          organizationalUnitId: rule.organizationalUnit?.id,
          effectiveFrom: rule.effectiveFrom ? new Date(rule.effectiveFrom) : null,
          effectiveTo: rule.effectiveTo ? new Date(rule.effectiveTo) : null
        });
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Failed to load overtime rule');
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  private timeToDate(timeInput: any): Date | null {
    if (!timeInput) return null;
    if (timeInput instanceof Date) return timeInput;
    if (typeof timeInput === 'string') return new Date(timeInput);
    // Fallback for object format just in case
    if (typeof timeInput === 'object' && 'hour' in timeInput) {
       const d = new Date();
       d.setHours(timeInput.hour || 0);
       d.setMinutes(timeInput.minute || 0);
       d.setSeconds(timeInput.second || 0);
       return d;
    }
    return null;
  }

  // private dateToTimeObj(date: Date): string | null {
  //   if (!date) return null;
  //   return date.toISOString();
  // }

  private dateToTimeObj(date: Date): string | null {
    if (!date) return null;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.submitting.set(true);
    const formVal = this.form.value;

    const payload = {
      ruleCode: formVal.ruleCode,
      ruleName: formVal.ruleName,
      description: formVal.description,
      overtimeType: formVal.overtimeType,
      multiplier: formVal.multiplier,
      startTime: this.dateToTimeObj(formVal.startTime),
      endTime: this.dateToTimeObj(formVal.endTime),
      appliesToWeekdays: formVal.appliesToWeekdays,
      appliesToSaturdays: formVal.appliesToSaturdays,
      appliesToSundays: formVal.appliesToSundays,
      appliesToPublicHolidays: formVal.appliesToPublicHolidays,
      organizationalUnit: { id: formVal.organizationalUnitId },
      effectiveFrom: formVal.effectiveFrom ? formVal.effectiveFrom.toISOString().split('T')[0] : null,
      effectiveTo: formVal.effectiveTo ? formVal.effectiveTo.toISOString().split('T')[0] : null,
      active: formVal.active,
      priority: formVal.priority,
      // Timestamps typically ignored on update or handled by backend, but included for completeness if required
      createdOn: new Date().toISOString(), 
      updatedOn: new Date().toISOString(),
      deletedOn: null
    };

    const ruleId = this.ruleId();
    const request$ = (this.isEditMode() && ruleId !== null)
      ? this.ruleService.update(ruleId, payload as any)
      : this.ruleService.create(payload as any);

    request$.subscribe({
      next: () => {
        this.message.success(this.isEditMode() ? 'Rule updated successfully' : 'Rule created successfully');
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err) => {
        console.error(err);
        this.message.error('Failed to save rule');
        this.submitting.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
