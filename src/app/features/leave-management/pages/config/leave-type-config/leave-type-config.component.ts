import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { LeaveManagementTypeService } from '../../../services/leave-type.service';
import { LeaveType } from '../../../models/leave-type.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-leave-type-config',
  templateUrl: './leave-type-config.component.html',
  standalone: false
})
export class LeaveTypeConfigComponent implements OnInit {
  leaveTypes = signal<LeaveType[]>([]);
  loading = signal<boolean>(false);
  isModalVisible = signal<boolean>(false);
  validateForm!: FormGroup;
  editingId: number | null = null;

  constructor(
    private typeService: LeaveManagementTypeService,
    private message: NzMessageService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loadLeaveTypes();
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      leaveComplianceType: ['STATUTORY', [Validators.required]],
      defaultDaysPerYear: [21, [Validators.required]],
      requiresDocumentation: [false],
      allowNegativeBalance: [false],
      carryOverAllowed: [true],
      maxCarryOverDays: [5],
      category: [null]
    });
  }

  loadLeaveTypes(): void {
    this.loading.set(true);
    this.typeService.getAll().subscribe({
      next: (res) => {
        this.leaveTypes.set(res);
        this.loading.set(false);
      },
      error: () => this.message.error('Failed to load leave types')
    });
  }

  showModal(type?: LeaveType): void {
    this.isModalVisible.set(true);
    if (type) {
      this.editingId = type.id!;
      this.validateForm.patchValue(type);
    } else {
      this.editingId = null;
      this.validateForm.reset({
        leaveComplianceType: 'STATUTORY',
        defaultDaysPerYear: 21,
        requiresDocumentation: false,
        allowNegativeBalance: false,
        carryOverAllowed: true,
        maxCarryOverDays: 5
      });
    }
  }

  handleCancel(): void {
    this.isModalVisible.set(false);
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      const operation = this.editingId
        ? this.typeService.update(this.editingId, this.validateForm.value)
        : this.typeService.create(this.validateForm.value);

      operation.subscribe({
        next: () => {
          this.message.success('Leave Type saved');
          this.isModalVisible.set(false);
          this.loadLeaveTypes();
        },
        error: () => this.message.error('Failed to save leave type')
      });
    }
  }
}
