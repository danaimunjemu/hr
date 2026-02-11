import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { EmployeeGroupsService } from '../../services/employee-groups.service';

@Component({
  selector: 'app-create-employee-group',
  standalone: false,
  templateUrl: './create-employee-group.html',
  styleUrl: './create-employee-group.scss'
})
export class CreateEmployeeGroup {
  createForm: FormGroup;
  loading: WritableSignal<boolean> = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private employeeGroupsService: EmployeeGroupsService,
    private message: NzMessageService
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  submitForm(): void {
    if (this.createForm.valid) {
      this.loading.set(true);
      this.employeeGroupsService.createEmployeeGroup(this.createForm.value)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: () => {
            this.message.success('Employee Group created successfully');
            this.router.navigate(['/app/settings/employee-groups']);
          },
          error: (err) => {
            this.message.error(err.message || 'Failed to create employee group');
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
    this.router.navigate(['/app/settings/employee-groups']);
  }
}
