import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { EmployeeSubGroupsService } from '../../services/employee-sub-groups.service';

@Component({
  selector: 'app-create-employee-sub-group',
  standalone: false,
  templateUrl: './create-employee-sub-group.html',
  styleUrl: './create-employee-sub-group.scss'
})
export class CreateEmployeeSubGroup {
  createForm: FormGroup;
  loading: WritableSignal<boolean> = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private employeeSubGroupsService: EmployeeSubGroupsService,
    private message: NzMessageService
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  submitForm(): void {
    if (this.createForm.valid) {
      this.loading.set(true);
      this.employeeSubGroupsService.createEmployeeSubGroup(this.createForm.value)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: () => {
            this.message.success('Employee Sub Group created successfully');
            this.router.navigate(['/app/settings/employee-sub-groups']);
          },
          error: (err) => {
            this.message.error(err.message || 'Failed to create employee sub group');
          }
        });
    } else {
      Object.values(this.createForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/app/settings/employee-sub-groups']);
  }
}
