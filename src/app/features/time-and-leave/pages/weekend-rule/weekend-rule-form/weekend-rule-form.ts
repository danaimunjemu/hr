import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WeekendRuleService } from '../../../services/weekend-rule.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WeekendRule } from '../../../models/weekend-rule.model';

@Component({
  selector: 'app-weekend-rule-form',
  standalone: false,
  templateUrl: './weekend-rule-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class WeekendRuleFormComponent implements OnInit {
  form: FormGroup;
  isEditMode: WritableSignal<boolean> = signal(false);
  ruleId: WritableSignal<number | null> = signal(null);
  loading: WritableSignal<boolean> = signal(false);
  submitting: WritableSignal<boolean> = signal(false);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private weekendRuleService: WeekendRuleService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      saturday: [true],
      sunday: [true]
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
    this.weekendRuleService.getById(id).subscribe({
      next: (rule) => {
        this.form.patchValue(rule);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.message.error('Failed to load weekend rule details');
        this.loading.set(false);
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

    this.submitting.set(true);
    const ruleData: WeekendRule = this.form.value;

    const ruleId = this.ruleId();
    if (this.isEditMode() && ruleId !== null) {
      this.weekendRuleService.update(ruleId, ruleData).subscribe({
        next: () => {
          this.message.success('Weekend rule updated successfully');
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update weekend rule');
          this.submitting.set(false);
        }
      });
    } else {
      this.weekendRuleService.create(ruleData).subscribe({
        next: () => {
          this.message.success('Weekend rule created successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to create weekend rule');
          this.submitting.set(false);
        }
      });
    }
  }

  onCancel(): void {
    const parentRoute = this.isEditMode() ? '../../' : '../';
    this.router.navigate([parentRoute], { relativeTo: this.route });
  }
}
