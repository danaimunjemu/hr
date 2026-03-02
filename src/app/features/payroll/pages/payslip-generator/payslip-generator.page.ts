import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService } from '../../services/payroll.service';
import { PayrollRecord } from '../../models/payroll-record.model';
import { Payslip } from '../../models/payslip.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PayslipTemplateComponent } from '../../components/payslip-template/payslip-template.component';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-payslip-generator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PayslipTemplateComponent,
    NzPageHeaderModule,
    NzSelectModule,
    NzButtonModule,
    NzCardModule,
    NzListModule,
    NzGridModule,
    NzIconModule
  ],
  template: `
    <div class="p-6">
      <nz-page-header nzTitle="Payslip Generation">
        <nz-page-header-extra>
          <div class="flex gap-4">
            <nz-select [(ngModel)]="selectedPeriod" (ngModelChange)="loadRecords()" style="width: 150px">
              <nz-option nzValue="2026-02" nzLabel="February 2026"></nz-option>
              <nz-option nzValue="2026-01" nzLabel="January 2026"></nz-option>
            </nz-select>
            <button nz-button nzType="primary" (click)="generateAll()" [nzLoading]="generating">
              Generate All for {{ selectedPeriod }}
            </button>
          </div>
        </nz-page-header-extra>
      </nz-page-header>

      <div nz-row [nzGutter]="24">
        <div nz-col [nzSpan]="8">
          <nz-card nzTitle="Payroll Records">
            <nz-list [nzDataSource]="records" [nzRenderItem]="item" [nzLoading]="loading">
              <ng-template #item let-record>
                <nz-list-item [nzActions]="[generateAction]">
                  <nz-list-item-meta
                    [nzTitle]="record.employeeName"
                    [nzDescription]="record.role">
                  </nz-list-item-meta>
                  <ng-template #generateAction>
                    <a (click)="preview(record)">Preview</a>
                  </ng-template>
                </nz-list-item>
              </ng-template>
            </nz-list>
          </nz-card>
        </div>

        <div nz-col [nzSpan]="16">
          <div *ngIf="previewRecord" class="bg-gray-100 p-8 rounded border">
            <app-payslip-template 
              [payslip]="previewPayslip" 
              [employeeName]="previewRecord.employeeName">
            </app-payslip-template>
            <div class="flex justify-center mt-6">
              <button nz-button nzType="primary" (click)="saveGeneratedPayslip()">Save & Finalize</button>
            </div>
          </div>
          <div *ngIf="!previewRecord" class="flex flex-col items-center justify-center h-full text-gray-400 p-24">
             <nz-icon nzType="file-text" style="font-size: 64px" class="mb-4"></nz-icon>
             <p>Select an employee record to preview and generate payslip.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PayslipGeneratorPage implements OnInit {
  selectedPeriod: string = '2026-02';
  records: PayrollRecord[] = [];
  loading = false;
  generating = false;

  previewRecord: PayrollRecord | null = null;
  previewPayslip: Payslip | null = null;

  constructor(
    private payrollService: PayrollService,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords() {
    this.loading = true;
    this.payrollService.getRecordsByPeriod(this.selectedPeriod).subscribe(data => {
      this.records = data;
      this.loading = false;
    });
  }

  preview(record: PayrollRecord) {
    this.previewRecord = record;
    // Generate transient payslip for preview
    const netPay = record.grossBasic + record.grossOvertime - record.paye + record.leavePayableAmount;
    this.previewPayslip = {
      id: 'preview',
      employeeId: record.employeeId,
      period: record.period,
      generatedAt: new Date().toISOString(),
      templateVersion: '1.0.0',
      grossBasic: record.grossBasic,
      grossOvertime: record.grossOvertime,
      paye: record.paye,
      leavePayableAmount: record.leavePayableAmount,
      netPay
    };
  }

  generateAll() {
    this.generating = true;
    let count = 0;
    this.records.forEach(r => {
      this.payrollService.generatePayslip(r).subscribe(() => {
        count++;
        if (count === this.records.length) {
          this.generating = false;
          this.message.success(`Generated ${count} payslips successfully.`);
        }
      });
    });
  }

  saveGeneratedPayslip() {
    if (this.previewRecord) {
      this.payrollService.generatePayslip(this.previewRecord).subscribe(() => {
        this.message.success('Payslip generated and stored in database.');
        this.previewRecord = null;
        this.previewPayslip = null;
      });
    }
  }
}
