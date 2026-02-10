import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PerformanceGoalTemplateItemService } from '../../../services/performance-goal-template-item.service';
import { PerformanceGoalTemplateService } from '../../../services/performance-goal-template.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PerformanceGoalTemplate } from '../../../models/performance-goal-template.model';
import { AddGoalItemsRequest } from '../../../models/performance-goal-template-item.model';

@Component({
  selector: 'app-goal-template-items-form',
  standalone: false,
  templateUrl: './goal-template-items-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class GoalTemplateItemsFormComponent implements OnInit {
  form: FormGroup;
  templates: WritableSignal<PerformanceGoalTemplate[]> = signal([]);
  loadingTemplates: WritableSignal<boolean> = signal(false);
  submitting: WritableSignal<boolean> = signal(false);
  selectedTemplate: PerformanceGoalTemplate | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private goalTemplateItemService: PerformanceGoalTemplateItemService,
    private goalTemplateService: PerformanceGoalTemplateService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      templateId: [null, [Validators.required]],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadTemplates();
    const templateId = this.route.snapshot.params['id'];
    if (templateId) {
      this.form.patchValue({ templateId: +templateId });
      this.onTemplateChange(+templateId);
    }
    this.addItem();
  }

  loadTemplates(): void {
    this.loadingTemplates.set(true);
    this.goalTemplateService.getAll()
      .pipe(finalize(() => this.loadingTemplates.set(false)))
      .subscribe({
        next: (data) => this.templates.set(data),
        error: () => this.message.error('Failed to load templates')
      });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(): void {
    const itemForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      weight: [0, [Validators.required, Validators.min(0)]],
      measurement: ['', [Validators.required]],
      dueDate: [null, [Validators.required]]
    });
    this.items.push(itemForm);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onTemplateChange(templateId: number): void {
    const template = this.templates().find(t => t.id === templateId);
    this.selectedTemplate = template || null;
  }

  isDateValid(dueDate: string): boolean {
    if (!this.selectedTemplate) return true;
    const due = new Date(dueDate);
    const start = new Date(this.selectedTemplate.cycle.startDate);
    const end = new Date(this.selectedTemplate.cycle.endDate);
    return due >= start && due <= end;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.items.controls.forEach(control => {
        Object.values((control as FormGroup).controls).forEach(c => {
          if (c.invalid) {
            c.markAsDirty();
            c.updateValueAndValidity({ onlySelf: true });
          }
        });
      });
      return;
    }

    if (this.items.length === 0) {
      this.message.error('Please add at least one item');
      return;
    }

    const formValue = this.form.value;

    for (const item of formValue.items) {
      if (!this.isDateValid(item.dueDate)) {
        this.message.error('Due date must be within the cycle date range');
        return;
      }
    }

    this.submitting.set(true);
    const request: AddGoalItemsRequest = {
      templateId: formValue.templateId,
      items: formValue.items
    };

    this.goalTemplateItemService.addGoalItems(request)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Goal items added successfully');
          this.router.navigate(['/app/performance/goal-template']);
        },
        error: () => this.message.error('Failed to add goal items')
      });
  }

  onCancel(): void {
    this.router.navigate(['/app/performance/goal-template']);
  }
}
