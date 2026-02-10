import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PerformanceGoalTemplateService } from '../../../services/performance-goal-template.service';
import { PerformanceCycleService } from '../../../services/performance-cycle.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PerformanceGoalTemplate } from '../../../models/performance-goal-template.model';
import { PerformanceCycle } from '../../../models/performance-cycle.model';

@Component({
  selector: 'app-performance-goal-template-form',
  standalone: false,
  templateUrl: './performance-goal-template-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class PerformanceGoalTemplateFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  templateId: number | null = null;
  loading: WritableSignal<boolean> = signal(false);
  submitting: WritableSignal<boolean> = signal(false);
  cycles: WritableSignal<PerformanceCycle[]> = signal([]);
  loadingCycles: WritableSignal<boolean> = signal(false);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private performanceGoalTemplateService: PerformanceGoalTemplateService,
    private performanceCycleService: PerformanceCycleService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      cycleId: [null, [Validators.required]],
      locked: [false]
    });
  }

  ngOnInit(): void {
    this.loadCycles();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.templateId = +params['id'];
        this.loadTemplate(this.templateId);
      }
    });
  }

  loadCycles(): void {
    this.loadingCycles.set(true);
    this.performanceCycleService.getAll()
      .pipe(finalize(() => this.loadingCycles.set(false)))
      .subscribe({
        next: (data) => this.cycles.set(data),
        error: () => this.message.error('Failed to load performance cycles')
      });
  }

  loadTemplate(id: number): void {
    this.loading.set(true);
    this.performanceGoalTemplateService.getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (template) => {
          this.form.patchValue({
            name: template.name,
            cycleId: template.cycle.id,
            locked: template.locked
          });
        },
        error: (err: any) => {
          this.message.error('Failed to load performance goal template');
          this.router.navigate(['/app/performance/goal-template']);
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
    const formValue = this.form.value;
    const selectedCycle = this.cycles().find(c => c.id === formValue.cycleId);

    if (!selectedCycle) {
      this.message.error('Please select a valid cycle');
      this.submitting.set(false);
      return;
    }

    const templateData: PerformanceGoalTemplate = {
      name: formValue.name,
      cycle: selectedCycle,
      locked: formValue.locked
    };

    const request$ = this.isEditMode && this.templateId
      ? this.performanceGoalTemplateService.update(this.templateId, templateData)
      : this.performanceGoalTemplateService.create(templateData);

    request$
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.message.success(`Performance goal template ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.router.navigate(['/app/performance/goal-template']);
        },
        error: () => {
          this.message.error(`Failed to ${this.isEditMode ? 'update' : 'create'} performance goal template`);
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/app/performance/goal-template']);
  }
}
