import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { EmployeeGroup, EmployeeGroupsService } from '../../services/employee-groups.service';

@Component({
  selector: 'app-edit-employee-group',
  standalone: false,
  templateUrl: './edit-employee-group.html',
  styleUrl: './edit-employee-group.scss'
})
export class EditEmployeeGroup implements OnInit {
  editForm!: FormGroup;
  employeeGroupId!: number;
  loading: WritableSignal<boolean> = signal(false);
  saving: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeGroupsService: EmployeeGroupsService,
    private message: NzMessageService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.employeeGroupId = +id;
      this.fetchEmployeeGroup(this.employeeGroupId);
    } else {
      this.error.set('Invalid employee group ID');
    }
  }

  createForm(): void {
    this.editForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  fetchEmployeeGroup(id: number): void {
    this.loading.set(true);
    this.employeeGroupsService.getEmployeeGroup(id)
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
      const payload = { ...this.editForm.value, id: this.employeeGroupId };
      
      this.employeeGroupsService.updateEmployeeGroup(this.employeeGroupId, payload)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => {
            this.message.success('Employee Group updated successfully');
            this.router.navigate(['/app/settings/employee-groups']);
          },
          error: (err) => {
            this.message.error(err.message || 'Failed to update employee group');
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
    this.router.navigate(['/app/settings/employee-groups']);
  }
}
