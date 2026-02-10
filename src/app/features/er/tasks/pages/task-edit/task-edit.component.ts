import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ErTaskService } from '../../services/er-task.service';
import { ErCaseService } from '../../../cases/services/er-case.service';
import { EmployeesService } from '../../../../../features/employees/services/employees.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-task-edit',
  standalone: false,
  templateUrl: './task-edit.component.html'
})
export class TaskEditComponent implements OnInit {
  form: FormGroup;
  loading = false;
  id!: number;
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
      erCase: [{ value: null, disabled: true }, [Validators.required]],
      title: [null, [Validators.required]],
      taskType: [null, [Validators.required]],
      description: [''],
      assignedTo: [null, [Validators.required]],
      dueAt: [null],
      status: [null, [Validators.required]],
      completionNotes: ['']
    });
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDependencies();
    this.loadData();
  }

  loadDependencies(): void {
    this.caseService.getCases().subscribe(data => this.cases = data);
    this.employeeService.getAll().subscribe(data => this.employees = data);
  }

  loadData(): void {
    this.loading = true;
    this.taskService.getTask(this.id).subscribe({
      next: (data) => {
        this.form.patchValue({
          erCase: data.erCase?.id,
          title: data.title,
          taskType: data.taskType,
          description: data.description,
          assignedTo: data.assignedTo?.id,
          dueAt: data.dueAt ? new Date(data.dueAt) : null,
          status: data.status,
          completionNotes: data.completionNotes
        });
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load task');
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;
      const val = this.form.getRawValue(); // getRawValue to include disabled erCase
      const payload = {
        id: this.id,
        erCase: { id: val.erCase },
        title: val.title,
        taskType: val.taskType,
        description: val.description,
        assignedTo: { id: val.assignedTo },
        dueAt: val.dueAt ? val.dueAt.toISOString() : null,
        status: val.status,
        completionNotes: val.completionNotes
      };

      this.taskService.updateTask(payload).subscribe({
        next: () => {
          this.message.success('Task updated successfully');
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update task');
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
