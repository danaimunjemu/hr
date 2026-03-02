import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayrollService } from '../../services/payroll.service';
import { Payslip } from '../../models/payslip.model';
import jsPDF from 'jspdf';
import { PayslipTemplateComponent } from '../../components/payslip-template/payslip-template.component';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-employee-payslips',
  standalone: true,
  imports: [
    CommonModule,
    PayslipTemplateComponent,
    NzPageHeaderModule,
    NzAlertModule,
    NzTableModule,
    NzModalModule,
    NzButtonModule
  ],
  template: `
    <div class="p-6">
      <nz-page-header nzTitle="My Payslips">
        <nz-page-header-subtitle>View and download your monthly payslips</nz-page-header-subtitle>
      </nz-page-header>

      <nz-alert
        nzType="info"
        nzMessage="Simulated Session"
        nzDescription="You are currently viewing payslips for Employee ID: 101 (John Doe)"
        nzShowIcon
        class="mb-6"
      ></nz-alert>

      <nz-table #pTable [nzData]="payslips" [nzLoading]="loading">
        <thead>
          <tr>
            <th>Period</th>
            <th>Net Pay (R)</th>
            <th>Generated On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let payslip of pTable.data">
            <td>{{ payslip.period }}</td>
            <td><strong>{{ payslip.netPay | number:'1.2-2' }}</strong></td>
            <td>{{ payslip.generatedAt | date:'mediumDate' }}</td>
            <td>
              <div class="flex gap-2">
                <button nz-button (click)="viewPayslip(payslip)">View</button>
                <button nz-button nzType="primary" (click)="downloadPdf(payslip)">Download PDF</button>
              </div>
            </td>
          </tr>
        </tbody>
      </nz-table>

      <nz-modal
        [(nzVisible)]="isModalVisible"
        nzTitle="Payslip Detail"
        [nzFooter]="null"
        (nzOnCancel)="isModalVisible = false"
        [nzWidth]="800"
      >
        <ng-container *nzModalContent>
          <div class="bg-gray-100 p-8">
            <app-payslip-template [payslip]="selectedPayslip" employeeName="John Doe"></app-payslip-template>
          </div>
          <div class="flex justify-center mt-6">
             <button nz-button nzType="primary" (click)="downloadPdf(selectedPayslip!)">Download as PDF</button>
          </div>
        </ng-container>
      </nz-modal>
    </div>
  `
})
export class EmployeePayslipsPage implements OnInit {
  currentEmployeeId = 101; // Simulated for demo
  payslips: Payslip[] = [];
  loading = false;
  isModalVisible = false;
  selectedPayslip: Payslip | null = null;

  constructor(private payrollService: PayrollService) { }

  ngOnInit() {
    this.loadPayslips();
  }

  loadPayslips() {
    this.loading = true;
    this.payrollService.getPayslipsByEmployee(this.currentEmployeeId).subscribe(data => {
      this.payslips = data.sort((a, b) => b.period.localeCompare(a.period));
      this.loading = false;
    });
  }

  viewPayslip(payslip: Payslip) {
    this.selectedPayslip = payslip;
    this.isModalVisible = true;
  }

  async downloadPdf(payslip: Payslip) {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text('PAYSLIP - NERDMA TECH', 20, 20);
    doc.setFontSize(12);
    doc.text(`Employee: John Doe (ID: ${payslip.employeeId})`, 20, 30);
    doc.text(`Period: ${payslip.period}`, 20, 31);
    doc.text(`Generated At: ${new Date(payslip.generatedAt).toLocaleString()}`, 20, 42);

    doc.line(20, 45, 190, 45);

    doc.text('Description', 20, 55);
    doc.text('Amount (R)', 150, 55);

    doc.text('Gross Basic Pay', 20, 65);
    doc.text(payslip.grossBasic.toFixed(2), 150, 65);

    doc.text('Overtime Allowance', 20, 75);
    doc.text(payslip.grossOvertime.toFixed(2), 150, 75);

    doc.text('Leave Payable', 20, 85);
    doc.text(payslip.leavePayableAmount.toFixed(2), 150, 85);

    doc.text('PAYE Deduction', 20, 95);
    doc.text(`-${payslip.paye.toFixed(2)}`, 150, 95);

    doc.line(20, 100, 190, 100);
    doc.setFont('helvetica', 'bold');
    doc.text('NET TAKE HOME', 20, 110);
    doc.text(`R ${payslip.netPay.toFixed(2)}`, 150, 110);

    doc.save(`Payslip_${payslip.employeeId}_${payslip.period}.pdf`);
  }
}
