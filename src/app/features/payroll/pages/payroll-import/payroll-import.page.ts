import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PayrollDataService } from '../../services/payroll-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompaniesService, Company } from '../../../settings/services/companies.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-payroll-import',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NzPageHeaderModule,
    NzCardModule,
    NzIconModule,
    NzButtonModule,
    NzFormModule,
    NzSelectModule,
    NzInputNumberModule,
    NzGridModule
  ],
  template: `
    <div class="p-6">
      <nz-page-header nzTitle="Payroll Data Upload" (nzBack)="goBack()" nzBackIcon>
        <nz-page-header-subtitle>Upload Excel/CSV file to staged area</nz-page-header-subtitle>
      </nz-page-header>

      <nz-card>
        <form nz-form [formGroup]="uploadForm" (ngSubmit)="submitUpload()" nzLayout="vertical">
          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="8">
              <nz-form-item>
                <nz-form-label nzRequired>Company</nz-form-label>
                <nz-form-control nzErrorTip="Please select a company">
                  <nz-select formControlName="companyId" nzPlaceHolder="Select company">
                    <nz-option *ngFor="let c of companies()" [nzValue]="c.id" [nzLabel]="c.name"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="8">
              <nz-form-item>
                <nz-form-label nzRequired>Year</nz-form-label>
                <nz-form-control nzErrorTip="Please enter year">
                  <nz-input-number formControlName="year" [nzMin]="2020" [nzMax]="2100" class="w-full"></nz-input-number>
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="8">
              <nz-form-item>
                <nz-form-label nzRequired>Month</nz-form-label>
                <nz-form-control nzErrorTip="Please select month">
                  <nz-select formControlName="month">
                    <nz-option *ngFor="let m of months" [nzValue]="m.value" [nzLabel]="m.label"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div class="mt-4 flex flex-col items-center p-12 border-2 border-dashed border-gray-300 rounded bg-gray-50">
            <nz-icon nzType="file-excel" style="font-size: 48px" class="text-green-600 mb-4"></nz-icon>
            <p class="text-gray-500 mb-6" *ngIf="!selectedFile">Select Excel or CSV file to stage rows</p>
            <p class="text-blue-600 font-bold mb-6" *ngIf="selectedFile">{{ selectedFile.name }}</p>
            
            <input type="file" #fileInput (change)="onFileSelected($event)" accept=".csv,.xlsx,.xls" class="hidden">
            <button nz-button type="button" (click)="fileInput.click()">
              {{ selectedFile ? 'Change File' : 'Select File' }}
            </button>
          </div>

          <div class="flex justify-end mt-8">
            <button nz-button nzType="primary" [nzLoading]="uploading()" [disabled]="!uploadForm.valid || !selectedFile">
              Upload and Stage Data
            </button>
          </div>
        </form>
      </nz-card>
    </div>
  `
})
export class PayrollImportPage {
  uploadForm: FormGroup;
  companies = signal<Company[]>([]);
  uploading = signal<boolean>(false);
  selectedFile: File | null = null;

  months = [
    { label: 'January', value: 1 }, { label: 'February', value: 2 }, { label: 'March', value: 3 },
    { label: 'April', value: 4 }, { label: 'May', value: 5 }, { label: 'June', value: 6 },
    { label: 'July', value: 7 }, { label: 'August', value: 8 }, { label: 'September', value: 9 },
    { label: 'October', value: 10 }, { label: 'November', value: 11 }, { label: 'December', value: 12 }
  ];

  constructor(
    private fb: FormBuilder,
    private payrollDataService: PayrollDataService,
    private companiesService: CompaniesService,
    private message: NzMessageService,
    private router: Router
  ) {
    const now = new Date();
    this.uploadForm = this.fb.group({
      companyId: [null, [Validators.required]],
      year: [now.getFullYear(), [Validators.required]],
      month: [now.getMonth() + 1, [Validators.required]]
    });
    this.loadCompanies();
  }

  loadCompanies() {
    this.companiesService.getCompanies().subscribe(res => this.companies.set(res));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  submitUpload() {
    if (this.uploadForm.valid && this.selectedFile) {
      this.uploading.set(true);
      const { companyId, year, month } = this.uploadForm.value;

      this.payrollDataService.upload(this.selectedFile, companyId, year, month)
        .pipe(finalize(() => this.uploading.set(false)))
        .subscribe({
          next: (res) => {
            this.message.success('Payroll data uploaded and staged successfully.');
            this.router.navigate(['/app/payroll/batch', res.id]);
          },
          error: () => this.message.error('Failed to upload payroll data.')
        });
    }
  }

  goBack() {
    window.history.back();
  }
}
