import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ErTemplateService } from '../../services/er-template.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-template-edit',
  standalone: false,
  template: `
    <nz-page-header (nzBack)="onCancel()" nzBackIcon nzTitle="Edit Template">
    </nz-page-header>

    <nz-card>
      <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Name</nz-form-label>
              <nz-form-control nzErrorTip="Please enter name">
                <input nz-input formControlName="name" placeholder="Template Name" />
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Case Type</nz-form-label>
              <nz-form-control nzErrorTip="Please select type">
                <nz-select formControlName="caseType">
                  <nz-option nzValue="MISCONDUCT" nzLabel="Misconduct"></nz-option>
                  <nz-option nzValue="GRIEVANCE" nzLabel="Grievance"></nz-option>
                  <nz-option nzValue="PERFORMANCE" nzLabel="Performance"></nz-option>
                  <nz-option nzValue="MEDICAL" nzLabel="Medical"></nz-option>
                  <nz-option nzValue="OTHER" nzLabel="Other"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>

        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label nzRequired>Version</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-input-number formControlName="version" [nzMin]="1" [nzStep]="1" style="width: 100%"></nz-input-number>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label>Default Confidentiality</nz-form-label>
              <nz-form-control>
                <nz-select formControlName="defaultConfidentiality">
                  <nz-option nzValue="NORMAL" nzLabel="Normal"></nz-option>
                  <nz-option nzValue="RESTRICTED" nzLabel="Restricted"></nz-option>
                  <nz-option nzValue="CONFIDENTIAL" nzLabel="Confidential"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label>Status</nz-form-label>
              <nz-form-control>
                <label nz-checkbox formControlName="active">Active</label>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>

        <nz-form-item>
          <nz-form-label>Description</nz-form-label>
          <nz-form-control>
            <textarea nz-input formControlName="description" rows="4"></textarea>
          </nz-form-control>
        </nz-form-item>

        <div class="flex justify-end gap-2">
          <button nz-button type="button" (click)="onCancel()">Cancel</button>
          <button nz-button nzType="primary" [nzLoading]="loading">Update</button>
        </div>
      </form>
    </nz-card>
  `
})
export class TemplateEditComponent implements OnInit {
  form: FormGroup;
  loading = false;
  id!: number;

  constructor(
    private fb: FormBuilder,
    private templateService: ErTemplateService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      caseType: [null, [Validators.required]],
      version: [1, [Validators.required]],
      active: [true],
      defaultConfidentiality: ['NORMAL'],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.templateService.getTemplate(this.id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load template');
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;
      const payload = {
        id: this.id,
        ...this.form.value
      };
      this.templateService.updateTemplate(payload).subscribe({
        next: () => {
          this.message.success('Template updated successfully');
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update template');
          this.loading = false;
        }
      });
    } else {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
