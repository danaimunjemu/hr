import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ErTaskService } from '../../services/er-task.service';
import { TaskStatus } from '../../models/er-task.model';
import { ErCaseService } from '../../../cases/services/er-case.service';
import { EmployeesService } from '../../../../../features/employees/services/employees.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-task-create',
  standalone: false,
  templateUrl: './task-create.component.html'
})
export class TaskCreateComponent implements OnInit {
  form: FormGroup;
  loading = false;
  cases: any[] = [];
  employees: any[] = [];

  constructor(
    private fb: FormBuilder,
    private taskService: ErTaskService,
    private caseService: ErCaseService,
    private employeeService: EmployeesService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      erCase: [null, [Validators.required]],
      title: [null, [Validators.required]],
      taskType: ['INVESTIGATION', [Validators.required]],
      description: [''],
      assignedTo: [null, [Validators.required]],
      dueAt: [null]
    });
  }

  ngOnInit(): void {
    this.loadDependencies();
  }

  loadDependencies(): void {
    this.caseService.getCases().subscribe(data => this.cases = data);
    this.employeeService.getAll().subscribe(data => this.employees = data);
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;
      const val = this.form.value;
      const payload = {
        erCase: { id: val.erCase },
        title: val.title,
        taskType: val.taskType,
        description: val.description,
        assignedTo: { id: val.assignedTo },
        dueAt: val.dueAt ? val.dueAt.toISOString() : null,
        status: 'OPEN' as TaskStatus
      };

      this.taskService.createTask(payload).subscribe({
        next: () => {
          this.message.success('Task created successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to create task');
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
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
