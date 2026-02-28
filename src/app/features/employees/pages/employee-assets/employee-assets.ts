import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import {
  CreateEmployeeAssetRequest,
  EmployeeAssetNote,
  EmployeesService
} from '../../services/employees.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-employee-assets',
  standalone: false,
  templateUrl: './employee-assets.html',
  styleUrl: './employee-assets.scss'
})
export class EmployeeAssets implements OnInit {
  employeeId: WritableSignal<number | null> = signal(null);
  assets: WritableSignal<EmployeeAssetNote[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  saving: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);
  showAddAssetsForm: WritableSignal<boolean> = signal(false);

  readonly assetTypeOptions: string[] = [
    'Vehicle',
    'Fuel Card',
    'Credit Card',
    'Laptop',
    'Mobile Phone',
    'Access Card',
    'Tools & Equipment',
    'PPE',
    'Other'
  ];

  assetBatchForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeesService: EmployeesService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.assetBatchForm = this.fb.group({
      assets: this.fb.array([this.createAssetFormGroup()])
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || Number.isNaN(id)) {
      this.error.set('Invalid employee ID.');
      return;
    }

    this.employeeId.set(id);
    this.loadAssets(id);
  }

  back(): void {
    this.router.navigate(['/app/employees/all']);
  }

  get assetRows(): FormArray {
    return this.assetBatchForm.get('assets') as FormArray;
  }

  createAssetFormGroup(): FormGroup {
    return this.fb.group({
      assetType: [null, [Validators.required]],
      description: [null, [Validators.required]],
      serialNumber: [null, [Validators.required]],
      issueDate: [null, [Validators.required]]
    });
  }

  openAddAssetsForm(): void {
    this.showAddAssetsForm.set(true);
  }

  cancelAddAssets(): void {
    this.showAddAssetsForm.set(false);
    this.assetBatchForm.setControl('assets', this.fb.array([this.createAssetFormGroup()]));
  }

  addAssetRow(): void {
    this.assetRows.push(this.createAssetFormGroup());
  }

  removeAssetRow(index: number): void {
    if (this.assetRows.length === 1) {
      return;
    }
    this.assetRows.removeAt(index);
  }

  loadAssets(employeeId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.employeesService
      .getUnreturnedEmployeeAssets(employeeId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (assets) => this.assets.set(assets ?? []),
        error: (err) => this.error.set(err.message ?? 'Failed to fetch employee assets.')
      });
  }

  submitAssets(): void {
    if (this.saving()) {
      return;
    }

    const rows = this.assetRows.controls;
    const nonEmptyRows = rows.filter((row) => !this.isRowEmpty(row as FormGroup));

    if (!nonEmptyRows.length) {
      this.message.warning('Add at least one asset before saving.');
      return;
    }

    const hasIncompleteRow = nonEmptyRows.some((row) => (row as FormGroup).invalid);
    if (hasIncompleteRow) {
      this.assetBatchForm.markAllAsTouched();
      this.message.error('Complete all required fields for each asset row.');
      return;
    }

    const employeeId = this.employeeId();
    if (!employeeId) {
      this.message.error('Employee ID is missing.');
      return;
    }

    const payload: CreateEmployeeAssetRequest[] = nonEmptyRows.map((row) => ({
      assetType: String(row.get('assetType')?.value),
      description: String(row.get('description')?.value),
      serialNumber: String(row.get('serialNumber')?.value),
      issueDate: String(row.get('issueDate')?.value)
    }));

    this.saving.set(true);
    this.error.set(null);
    this.employeesService
      .addEmployeeAssets(employeeId, payload)
      .pipe(timeout(30000))
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Assets added successfully.');
          this.cancelAddAssets();
          this.loadAssets(employeeId);
        },
        error: (err) => {
          const message = err?.message ?? 'Failed to add assets.';
          this.error.set(message);
          this.message.error(message);
        }
      });
  }

  private isRowEmpty(row: FormGroup): boolean {
    const values = row.value as Record<string, unknown>;
    return Object.values(values).every((value) => String(value ?? '').trim() === '');
  }
}
