import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupScheduleRuleService } from '../../../services/group-schedule-rule.service';
import { EmployeeGroupService } from '../../../services/employee-group.service';
import { ShiftDefinitionService } from '../../../services/shift-definition.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { GroupScheduleRule, RotationShift } from '../../../models/group-schedule-rule.model';
import { EmployeeGroup } from '../../../models/employee-group.model';
import { ShiftDefinition } from '../../../models/shift-definition.model';

@Component({
  selector: 'app-group-schedule-rule-form',
  standalone: false,
  templateUrl: './group-schedule-rule-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
    .rotation-shift-item {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }
  `]
})
export class GroupScheduleRuleFormComponent implements OnInit {
  form: FormGroup;
  isEditMode: WritableSignal<boolean> = signal(false);
  ruleId: WritableSignal<number | null> = signal(null);
  loading: WritableSignal<boolean> = signal(false);
  submitting: WritableSignal<boolean> = signal(false);
  employeeGroups: WritableSignal<EmployeeGroup[]> = signal([]);
  shiftDefinitions: WritableSignal<ShiftDefinition[]> = signal([]);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private groupScheduleRuleService: GroupScheduleRuleService,
    private employeeGroupService: EmployeeGroupService,
    private shiftDefinitionService: ShiftDefinitionService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      employeeGroup: [null, [Validators.required]],
      rotationType: ['FIXED', [Validators.required]],
      effectiveFrom: [null, [Validators.required]],
      cycleOnWeeks: [1, [Validators.required, Validators.min(1)]],
      cycleOffWeeks: [0, [Validators.required, Validators.min(0)]],
      cycleStartDate: [null, [Validators.required]],
      shiftDefinition: [null], // For FIXED
      rotationShifts: this.fb.array([]) // For ROTATING
    });
  }

  get rotationShifts(): FormArray {
    return this.form.get('rotationShifts') as FormArray;
  }

  ngOnInit(): void {
    this.loadDependencies();
    this.route.params.subscribe(params => {
      if (params['id']) {
        const id = +params['id'];
        this.isEditMode.set(true);
        this.ruleId.set(id);
        this.loadRule(id);
      }
    });

    // Watch rotationType changes
    this.form.get('rotationType')?.valueChanges.subscribe(type => {
      if (type === 'FIXED') {
        this.form.get('shiftDefinition')?.setValidators([Validators.required]);
        this.rotationShifts.clear();
      } else {
        this.form.get('shiftDefinition')?.clearValidators();
        this.form.get('shiftDefinition')?.setValue(null);
        if (this.rotationShifts.length === 0) {
          this.addRotationShift();
        }
      }
      this.form.get('shiftDefinition')?.updateValueAndValidity();
    });
  }

  loadDependencies(): void {
    this.employeeGroupService.getAll().subscribe(data => this.employeeGroups.set(data));
    this.shiftDefinitionService.getAll().subscribe(data => this.shiftDefinitions.set(data));
  }

  loadRule(id: number): void {
    this.loading.set(true);
    this.groupScheduleRuleService.getById(id).subscribe({
      next: (rule) => {
        this.form.patchValue({
          ...rule,
          effectiveFrom: new Date(rule.effectiveFrom),
          cycleStartDate: new Date(rule.cycleStartDate),
          shiftDefinition: rule.shiftDefinition,
          employeeGroup: rule.employeeGroup
        });

        if (rule.rotationType === 'ROTATING' && rule.rotationShifts) {
          rule.rotationShifts.forEach(shift => {
            this.addRotationShift(shift);
          });
        }

        this.loading.set(false);
      },
      error: (err: any) => {
        this.message.error('Failed to load rule details');
        this.loading.set(false);
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  addRotationShift(shift?: RotationShift): void {
    const shiftGroup = this.fb.group({
      shiftDefinition: [shift?.shiftDefinition || null, [Validators.required]],
      sequence: [shift?.sequence || this.rotationShifts.length + 1, [Validators.required]]
    });
    this.rotationShifts.push(shiftGroup);
  }

  removeRotationShift(index: number): void {
    this.rotationShifts.removeAt(index);
    // Reorder sequences
    this.rotationShifts.controls.forEach((control, i) => {
      control.get('sequence')?.setValue(i + 1);
    });
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.id === o2.id : o1 === o2);

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
    const formValue = this.form.value;

    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const ruleData: GroupScheduleRule = {
      ...formValue,
      effectiveFrom: formatDate(formValue.effectiveFrom),
      cycleStartDate: formatDate(formValue.cycleStartDate),
    };

    const ruleId = this.ruleId();
    if (this.isEditMode() && ruleId !== null) {
      this.groupScheduleRuleService.update(ruleId, ruleData).subscribe({
        next: () => {
          this.message.success('Rule updated successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update rule');
          this.submitting.set(false);
        }
      });
    } else {
      this.groupScheduleRuleService.create(ruleData).subscribe({
        next: () => {
          this.message.success('Rule created successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to create rule');
          this.submitting.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
