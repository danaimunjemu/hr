import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkScheduleRuleService } from '../../../services/work-schedule-rule.service';
import { WeekendRuleService } from '../../../services/weekend-rule.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WorkScheduleRule } from '../../../models/work-schedule-rule.model';
import { WeekendRule } from '../../../models/weekend-rule.model';

@Component({
  selector: 'app-work-schedule-rule-form',
  standalone: false,
  templateUrl: './work-schedule-rule-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class WorkScheduleRuleFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  ruleId: number | null = null;
  loading = false;
  submitting = false;
  weekendRules: WeekendRule[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private workScheduleRuleService: WorkScheduleRuleService,
    private weekendRuleService: WeekendRuleService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      breakMinutes: [60, [Validators.required, Validators.min(0)]],
      paidHours: [8, [Validators.required, Validators.min(0)]],
      nightShift: [false],
      weekendShift: [false],
      weekendRule: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadWeekendRules();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.ruleId = +params['id'];
        this.loadRule(this.ruleId);
      }
    });
  }

  loadWeekendRules(): void {
    this.weekendRuleService.getAll().subscribe({
      next: (data) => {
        this.weekendRules = data;
      },
      error: (err: any) => {
        console.error('Failed to load weekend rules', err);
        this.message.error('Failed to load weekend rules list');
      }
    });
  }

  loadRule(id: number): void {
    this.loading = true;
    this.workScheduleRuleService.getById(id).subscribe({
      next: (rule) => {
        let startTimeDate = null;
        if (rule.startTime) {
            const [hours, minutes] = rule.startTime.split(':');
            startTimeDate = new Date();
            startTimeDate.setHours(+hours, +minutes, 0, 0);
        }

        let endTimeDate = null;
        if (rule.endTime) {
            const [hours, minutes] = rule.endTime.split(':');
            endTimeDate = new Date();
            endTimeDate.setHours(+hours, +minutes, 0, 0);
        }

        this.form.patchValue({
          ...rule,
          startTime: startTimeDate,
          endTime: endTimeDate,
          weekendRule: rule.weekendRule
        });
        
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error('Failed to load schedule rule details');
        this.loading = false;
        this.router.navigate(['../'], { relativeTo: this.route });
      }
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

    this.submitting = true;
    const formValue = this.form.value;

    const formatTime = (date: Date): string => {
        if (!date) return '';
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const ruleData: WorkScheduleRule = {
      ...formValue,
      startTime: formatTime(formValue.startTime),
      endTime: formatTime(formValue.endTime),
    };

    if (this.isEditMode && this.ruleId) {
      this.workScheduleRuleService.update(this.ruleId, ruleData).subscribe({
        next: () => {
          this.message.success('Schedule rule updated successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update schedule rule');
          this.submitting = false;
        }
      });
    } else {
      this.workScheduleRuleService.create(ruleData).subscribe({
        next: () => {
          this.message.success('Schedule rule created successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to create schedule rule');
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
