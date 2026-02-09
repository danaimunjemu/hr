import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { EmployeeSubGroup, EmployeeSubGroupsService } from '../../services/employee-sub-groups.service';

@Component({
  selector: 'app-edit-employee-sub-group',
  standalone: false,
  templateUrl: './edit-employee-sub-group.html',
  styleUrl: './edit-employee-sub-group.scss'
})
export class EditEmployeeSubGroup implements OnInit {
  editForm!: FormGroup;
  employeeSubGroupId!: number;
  loading: WritableSignal<boolean> = signal(false);
  saving: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeSubGroupsService: EmployeeSubGroupsService,
    private message: NzMessageService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.employeeSubGroupId = +id;
      this.fetchEmployeeSubGroup(this.employeeSubGroupId);
    } else {
      this.error.set('Invalid employee sub group ID');
    }
  }

  createForm(): void {
    this.editForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  fetchEmployeeSubGroup(id: number): void {
    this.loading.set(true);
    this.employeeSubGroupsService.getEmployeeSubGroup(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.editForm.patchValue({
            name: data.name
          });
        },
        error: (err) => this.error.set(err.message)
      });
  }

  submitForm(): void {
    if (this.editForm.valid) {
      this.saving.set(true);
      const payload = { ...this.editForm.value, id: this.employeeSubGroupId };
      
      this.employeeSubGroupsService.updateEmployeeSubGroup(this.employeeSubGroupId, payload)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => {
            this.message.success('Employee Sub Group updated successfully');
            this.router.navigate(['/app/settings/employee-sub-groups']);
          },
          error: (err) => {
            this.message.error(err.message || 'Failed to update employee sub group');
          }
        });
    } else {
      Object.values(this.editForm.controls).forEach(control => {
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
