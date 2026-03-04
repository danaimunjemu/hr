import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { LeaveManagementTypeService } from '../../../services/leave-type.service';
import { LeaveType } from '../../../models/leave-type.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-leave-type-config',
  templateUrl: './leave-type-config.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzInputNumberModule,
    NzCheckboxModule,
    NzGridModule
  ]
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
