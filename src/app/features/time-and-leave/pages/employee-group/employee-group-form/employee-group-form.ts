import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeGroupService } from '../../../services/employee-group.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EmployeeGroup } from '../../../models/employee-group.model';

@Component({
  selector: 'app-employee-group-form',
  standalone: false,
  templateUrl: './employee-group-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class EmployeeGroupFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  groupId: number | null = null;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeGroupService: EmployeeGroupService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.groupId = +params['id'];
        this.loadGroup(this.groupId);
      }
    });
  }

  loadGroup(id: number): void {
    this.loading = true;
    this.employeeGroupService.getById(id).subscribe({
      next: (group) => {
        this.form.patchValue(group);
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error('Failed to load employee group details');
        this.loading = false;
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.submitting = true;
    const groupData: EmployeeGroup = this.form.value;

    if (this.isEditMode && this.groupId) {
      this.employeeGroupService.update(this.groupId, groupData).subscribe({
        next: () => {
          this.message.success('Employee group updated successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update employee group');
          this.submitting = false;
        }
      });
    } else {
      this.employeeGroupService.create(groupData).subscribe({
        next: () => {
          this.message.success('Employee group created successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to create employee group');
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
