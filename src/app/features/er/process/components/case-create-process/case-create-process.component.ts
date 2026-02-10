import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ErProcessService } from '../../services/er-process.service';
import { EmployeesService, Employee } from '../../../../employees/services/employees.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-case-create-process',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">Start New ER Case Process</h1>
    </div>
    <nz-card>
      <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Title</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <input nz-input formControlName="title" placeholder="Case Title" />
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Type</nz-form-label>
              <nz-form-control>
                <nz-select formControlName="caseType">
                  <nz-option nzValue="MISCONDUCT" nzLabel="Misconduct"></nz-option>
                  <nz-option nzValue="GRIEVANCE" nzLabel="Grievance"></nz-option>
                  <nz-option nzValue="PERFORMANCE" nzLabel="Performance"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label nzRequired>Priority</nz-form-label>
              <nz-form-control>
                <nz-select formControlName="priority">
                  <nz-option nzValue="HIGH" nzLabel="High"></nz-option>
                  <nz-option nzValue="MEDIUM" nzLabel="Medium"></nz-option>
                  <nz-option nzValue="LOW" nzLabel="Low"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label nzRequired>Subject</nz-form-label>
              <nz-form-control>
                <nz-select formControlName="subjectEmployee" nzShowSearch nzAllowClear>
                  <nz-option *ngFor="let emp of employees" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label nzRequired>Reporter</nz-form-label>
              <nz-form-control>
                <nz-select formControlName="reporterEmployee" nzShowSearch nzAllowClear>
                  <nz-option *ngFor="let emp of employees" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
        <nz-form-item>
          <nz-form-label>Summary</nz-form-label>
          <nz-form-control>
            <textarea nz-input formControlName="summary" rows="4"></textarea>
          </nz-form-control>
        </nz-form-item>
        <button nz-button nzType="primary" [nzLoading]="loading">Create Case & Start Process</button>
      </form>
    </nz-card>
  `
})
export class CaseCreateProcessComponent implements OnInit {
  form: FormGroup;
  loading = false;
  employees: Employee[] = [];

  constructor(
    private fb: FormBuilder,
    private processService: ErProcessService,
    private employeeService: EmployeesService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      title: [null, [Validators.required]],
      caseType: ['MISCONDUCT', [Validators.required]],
      priority: ['MEDIUM', [Validators.required]],
      subjectEmployee: [null, [Validators.required]],
      reporterEmployee: [null, [Validators.required]],
      summary: [''],
      company: [1] // Default
    });
  }

  ngOnInit() {
    this.employeeService.getAll().subscribe(data => this.employees = data);
  }

  submit() {
    if (this.form.valid) {
      this.loading = true;
      const val = this.form.value;
      const payload = {
        ...val,
        subjectEmployee: { id: val.subjectEmployee },
        reporterEmployee: { id: val.reporterEmployee },
        company: { id: val.company }
      };
      this.processService.createCase(payload).subscribe({
        next: () => {
          this.message.success('Case process started');
          this.router.navigate(['../../cases'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to start case process');
          this.loading = false;
        }
      });
    }
  }
}
