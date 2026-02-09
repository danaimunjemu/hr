import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OvertimeRuleService } from '../../../services/overtime-rule.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OvertimeRule } from '../../../models/overtime-rule.model';

@Component({
  selector: 'app-overtime-rule-form',
  standalone: false,
  templateUrl: './overtime-rule-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 600px;
      margin: 0 auto;
    }
  `]
})
export class OvertimeRuleFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  ruleId: number | null = null;
  loading = false;
  submitting = false;

  conditionTypes = [
    { label: 'Daily Excess Hours', value: 'DAILY_EXCESS' },
    { label: 'Weekly Excess Hours', value: 'WEEKLY_EXCESS' },
    { label: 'Weekend Work', value: 'WEEKEND' },
    { label: 'Holiday Work', value: 'HOLIDAY' },
    { label: 'Rest Day Work', value: 'REST_DAY' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ruleService: OvertimeRuleService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      conditionType: ['DAILY_EXCESS', [Validators.required]],
      rateMultiplier: [1.5, [Validators.required, Validators.min(1)]],
      thresholdMinutes: [0, [Validators.min(0)]],
      priority: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.ruleId = +params['id'];
        this.loadRule(this.ruleId);
      }
    });

    // Watch condition type to toggle threshold validation/visibility if needed
    this.form.get('conditionType')?.valueChanges.subscribe(val => {
       if (val === 'DAILY_EXCESS' || val === 'WEEKLY_EXCESS') {
         this.form.get('thresholdMinutes')?.enable();
       } else {
         this.form.get('thresholdMinutes')?.disable();
         this.form.get('thresholdMinutes')?.setValue(0);
       }
    });
  }

  loadRule(id: number): void {
    this.loading = true;
    this.ruleService.getById(id).subscribe({
      next: (rule) => {
        this.form.patchValue(rule);
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load overtime rule');
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
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

    this.submitting = true;
    const ruleData: OvertimeRule = {
      ...this.form.value,
      id: this.ruleId || 0
    };

    if (this.isEditMode && this.ruleId) {
      this.ruleService.update(this.ruleId, ruleData).subscribe({
        next: () => {
          this.message.success('Rule updated successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update rule');
          this.submitting = false;
        }
      });
    } else {
      this.ruleService.create(ruleData).subscribe({
        next: () => {
          this.message.success('Rule created successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to create rule');
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
