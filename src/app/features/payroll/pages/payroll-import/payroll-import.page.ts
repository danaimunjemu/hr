import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayrollService } from '../../services/payroll.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PayrollRecord } from '../../models/payroll-record.model';
import { v4 as uuidv4 } from 'uuid';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-payroll-import',
  standalone: true,
  imports: [CommonModule, NzPageHeaderModule, NzCardModule, NzIconModule, NzButtonModule, NzTableModule],
  template: `
    <div class="p-6">
      <nz-page-header nzTitle="Payroll File Import">
        <nz-page-header-subtitle>Upload CSV file from payroll system</nz-page-header-subtitle>
      </nz-page-header>

      <nz-card>
        <div class="flex flex-col items-center p-12 border-2 border-dashed border-gray-300 rounded">
          <nz-icon nzType="cloud-upload" style="font-size: 48px" class="text-blue-500 mb-4"></nz-icon>
          <p class="text-gray-500 mb-6">Required Columns: employeeId, employeeName, company, department, role, grossBasic, overtimeHours, grossOvertime, paye, leaveDaysTaken, leavePayableAmount, period</p>
          
          <input type="file" #fileInput (change)="onFileSelected($event)" accept=".csv" class="hidden">
          <button nz-button nzType="primary" (click)="fileInput.click()" [nzLoading]="importing">
            Select CSV File to Import
          </button>
        </div>
      </nz-card>

      <div *ngIf="importedRecords.length > 0" class="mt-6">
        <nz-table #importTable [nzData]="importedRecords" nzTitle="Preview Imported Records">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Company</th>
              <th>Gross Basic</th>
              <th>Period</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let data of importTable.data">
              <td>{{ data.employeeId }}</td>
              <td>{{ data.employeeName }}</td>
              <td>{{ data.company }}</td>
              <td>{{ data.grossBasic | number:'1.2-2' }}</td>
              <td>{{ data.period }}</td>
            </tr>
          </tbody>
        </nz-table>
        <div class="flex justify-end mt-4">
          <button nz-button nzType="primary" (click)="confirmImport()">Confirm & Store in DB</button>
        </div>
      </div>
    </div>
  `
})
export class PayrollImportPage {
  importing = false;
  importedRecords: PayrollRecord[] = [];

  constructor(
    private payrollService: PayrollService,
    private message: NzMessageService
  ) { }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.importing = true;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const text = e.target.result;
        this.parseCsv(text);
      };
      reader.readAsText(file);
    }
  }

  private parseCsv(text: string) {
    const lines = text.split('\n');
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());

    // Simple validation
    const required = ['employeeid', 'employeename', 'company', 'department', 'role', 'grossbasic', 'overtimehours', 'grossovertime', 'paye', 'leavedaystaken', 'leavepayableamount', 'period'];
    const missing = required.filter(r => !header.includes(r));

    if (missing.length > 0) {
      this.message.error(`Missing columns: ${missing.join(', ')}`);
      this.importing = false;
      return;
    }

    const records: PayrollRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map(v => v.trim());
      const record: any = { id: uuidv4() };

      header.forEach((h, index) => {
        const val = values[index];
        if (['employeeid', 'grossbasic', 'overtimehours', 'grossovertime', 'paye', 'leavedaystaken', 'leavepayableamount'].includes(h)) {
          record[this.mapHeaderToKey(h)] = Number(val);
        } else {
          record[this.mapHeaderToKey(h)] = val;
        }
      });
      records.push(record as PayrollRecord);
    }

    this.importedRecords = records;
    this.importing = false;
    this.message.info(`Parsed ${records.length} records.`);
  }

  private mapHeaderToKey(header: string): string {
    const mapping: any = {
      'employeeid': 'employeeId',
      'employeename': 'employeeName',
      'company': 'company',
      'department': 'department',
      'role': 'role',
      'grossbasic': 'grossBasic',
      'overtimehours': 'overtimeHours',
      'grossovertime': 'grossOvertime',
      'paye': 'paye',
      'leavedaystaken': 'leaveDaysTaken',
      'leavepayableamount': 'leavePayableAmount',
      'period': 'period'
    };
    return mapping[header];
  }

  confirmImport() {
    this.payrollService.importRecords(this.importedRecords).subscribe(() => {
      this.message.success('Successfully imported and saved to browser database.');
      this.importedRecords = [];
    });
  }
}
