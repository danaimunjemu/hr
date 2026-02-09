import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeaveService } from '../../../services/leave.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LeaveType } from '../../../models/leave-type.model';

@Component({
  selector: 'app-leave-type-form',
  standalone: false,
  templateUrl: './leave-type-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 600px;
      margin: 0 auto;
    }
  `]
})
export class LeaveTypeFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  typeId: number | null = null;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private leaveService: LeaveService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      daysPerYear: [0, [Validators.required, Validators.min(0)]],
      carryOverAllowed: [false],
      maxCarryOverDays: [{ value: 0, disabled: true }, [Validators.min(0)]],
      paid: [true]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.typeId = +params['id'];
        this.loadType(this.typeId);
      }
    });

    this.form.get('carryOverAllowed')?.valueChanges.subscribe(allowed => {
      if (allowed) {
        this.form.get('maxCarryOverDays')?.enable();
      } else {
        this.form.get('maxCarryOverDays')?.disable();
        this.form.get('maxCarryOverDays')?.setValue(0);
      }
    });
  }

  loadType(id: number): void {
    this.loading = true;
    this.leaveService.getTypeById(id).subscribe({
      next: (type) => {
        this.form.patchValue(type);
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load leave type');
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
    const typeData: LeaveType = {
      ...this.form.value,
      id: this.typeId || 0
    };

    if (this.isEditMode && this.typeId) {
      this.leaveService.updateType(this.typeId, typeData).subscribe({
        next: () => {
          this.message.success('Leave type updated successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update leave type');
          this.submitting = false;
        }
      });
    } else {
      this.leaveService.createType(typeData).subscribe({
        next: () => {
          this.message.success('Leave type created successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to create leave type');
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
