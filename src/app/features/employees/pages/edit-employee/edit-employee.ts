import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { Employee, EmployeesService } from '../../services/employees.service';

@Component({
  selector: 'app-edit-employee',
  standalone: false,
  templateUrl: './edit-employee.html',
  styleUrl: './edit-employee.scss'
})
export class EditEmployee implements OnInit {
  editForm!: FormGroup;
  employeeId!: number;
  
  // 1️⃣ State Management using Signals
  loading: WritableSignal<boolean> = signal(false);
  saving: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);
  employee: WritableSignal<Employee | null> = signal(null);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeesService: EmployeesService,
    private message: NzMessageService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.employeeId = +id;
      this.fetchEmployee(this.employeeId);
    } else {
      this.error.set('Invalid employee ID');
    }
  }

  createForm(): void {
    this.editForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      workPhone: [''],
      mobilePhone: [''],
      maritalStatus: [''],
      nationality: [''],
      employmentStatus: [''],
      superior: [''],
      address: this.fb.group({
        physicalAddress: [''],
        postalAddress: ['']
      })
    });
  }

  fetchEmployee(id: number): void {
    // 2️⃣ Signals set immediately for predictable state
    this.loading.set(true);
    this.employeesService.getEmployeeById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.employee.set(data);
          this.patchForm(data);
        },
        error: (err) => {
          this.error.set(err.message);
        }
      });
  }

  patchForm(employee: Employee): void {
    if (!employee) return;
    
    this.editForm.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      workPhone: employee.workPhone,
      mobilePhone: employee.mobilePhone,
      maritalStatus: employee.maritalStatus,
      nationality: employee.nationality,
      employmentStatus: employee.employmentStatus,
      superior: employee.superior,
      address: {
        physicalAddress: employee.address?.physicalAddress,
        postalAddress: employee.address?.postalAddress
      }
    });
  }

  submitForm(): void {
    if (this.editForm.valid) {
      this.saving.set(true);
      const formValue = this.editForm.value;
      
      const payload: Partial<Employee> = {
        ...formValue,
        id: this.employeeId,
        address: {
            ...formValue.address,
            id: this.employee()?.address?.id
        }
      };

      this.employeesService.updateEmployee(this.employeeId, payload)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => {
            this.message.success('Employee updated successfully');
            this.router.navigate(['/employees']);
          },
          error: (err) => {
            this.message.error(err.message || 'Failed to update employee');
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
    this.router.navigate(['/app/employees']);
  }
}
