import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PayslipService } from '../../services/payslip.service';
import { SessionService } from '../../../../core/services/session.service';
import { PayrollPayslip } from '../../models/payroll-payslip.model';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-my-payslip',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzDividerModule
  ],
  template: `
      <div class="p-6 min-h-screen bg-gray-50 flex flex-col items-center">
      <!-- Toolbar -->
      <div class="w-full max-w-4xl flex justify-between items-center mb-6 no-print">
        <h1 class="text-2xl font-bold text-gray-800">Payslip View</h1>
        <div class="space-x-2">
          <button nz-button nzType="default" (click)="printPayslip()" [disabled]="loading() || !payslip()">
            <span nz-icon nzType="printer"></span> Print Preview
          </button>
          <button nz-button nzType="primary" (click)="downloadPdf()" [nzLoading]="exporting()" [disabled]="loading() || !payslip()">
            <span nz-icon nzType="file-pdf"></span> Download Payslip
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="h-64 flex items-center justify-center">
        <nz-spin nzTip="Loading payslip..."></nz-spin>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading() && !payslip()" class="h-64 flex flex-col items-center justify-center text-gray-400">
        <nz-icon nzType="file-search" style="font-size: 48px" class="mb-4"></nz-icon>
        <p>No payslip found for the specified period.</p>
      </div>

      <!-- Payslip Container -->
      <div *ngIf="payslip() as p" class="payslip-wrapper w-full max-w-4xl">
        <div class="payslip-card p-bg-white relative overflow-hidden" id="payslip-print-area">
          <!-- Watermark -->
          <div class="watermark p-text-gray-100 select-none">OFFICIAL DOCUMENT</div>
          <div class="watermark-sub p-text-gray-100 select-none">NERDSMART PAYROLL</div>

          <!-- Header -->
          <div class="p-10 p-border-b-2 p-border-primary p-bg-white relative z-10">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-3xl font-black p-text-primary mb-1 uppercase tracking-tighter">Payslip</h2>
                <div class="flex flex-col text-[10px] p-text-gray-400 font-mono mt-2">
                  <span>DOCUMENT ID: {{ p.id }}</span>
                  <span>SYSTEM STATUS: FINALIZED</span>
                </div>
              </div>
              <div class="text-right">
                <h3 class="text-xl font-bold p-text-gray-800">{{ p.companyName || 'Nerdma Tech (Pty) Ltd' }}</h3>
                <p class="text-sm p-text-gray-500 max-w-xs ml-auto">{{ p.companyAddress || '123 Smart Way, Innovation Hub, Pretoria' }}</p>
              </div>
            </div>
          </div>

          <div class="p-10 relative z-10 p-bg-white">
            <!-- Info Grid -->
            <div class="grid grid-cols-2 gap-12 mb-10 pb-10 p-border-b p-border-gray-100">
              <div>
                <div class="text-xs font-bold p-text-gray-400 uppercase tracking-widest mb-3">Employee Details</div>
                <div class="space-y-1">
                  <p class="text-lg font-bold p-text-gray-800">{{ p.employeeName || 'Employee' }}</p>
                  <p class="text-sm p-text-gray-600"><span class="font-semibold">Number:</span> {{ p.employeeNumber }}</p>
                  <p class="text-sm p-text-gray-600" *ngIf="p.department"><span class="font-semibold">Department:</span> {{ p.department }}</p>
                  <p class="text-sm p-text-gray-600" *ngIf="p.designation"><span class="font-semibold">Designation:</span> {{ p.designation }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs font-bold p-text-gray-400 uppercase tracking-widest mb-3">General Information</div>
                <div class="space-y-1">
                  <p class="text-sm p-text-gray-600"><span class="font-semibold">Period:</span> <span class="p-text-primary font-bold">{{ p.period }}</span></p>
                  <p class="text-sm p-text-gray-600"><span class="font-semibold">Date of Issue:</span> {{ (p.generatedAt || today) | date:'dd MMM yyyy' }}</p>
                  <p class="text-sm p-text-gray-600"><span class="font-semibold">Generated By:</span> {{ getCurrentUserFullName() }}</p>
                </div>
              </div>
            </div>

            <!-- Financial Tables -->
            <div class="grid grid-cols-2 gap-x-12">
              <!-- Incomes -->
              <div>
                <h4 class="text-sm font-bold p-text-gray-800 p-border-b-2 p-border-gray-800 pb-2 mb-4 uppercase tracking-widest">Incomes</h4>
                <table class="w-full text-sm">
                  <tbody>
                    <tr *ngFor="let item of getEarnings(p)" class="p-border-b p-border-gray-50">
                      <td class="py-2 p-text-gray-600">{{ item.componentName }}</td>
                      <td class="py-2 text-right font-medium p-text-gray-800">{{ formatCurrency(item.amount) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="font-bold">
                    <tr>
                      <td class="py-4 p-text-gray-800 uppercase text-xs tracking-wider">Gross Pay</td>
                      <td class="py-4 text-right p-text-gray-800 p-border-t-2 p-border-gray-100">{{ formatCurrency(p.grossAmount) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Deductions -->
              <div>
                <h4 class="text-sm font-bold p-text-gray-800 p-border-b-2 p-border-gray-800 pb-2 mb-4 uppercase tracking-widest">Deductions</h4>
                <table class="w-full text-sm">
                  <tbody>
                    <tr *ngFor="let item of getDeductions(p)" class="p-border-b p-border-gray-50">
                      <td class="py-2 p-text-gray-600">{{ item.componentName }}</td>
                      <td class="py-2 text-right font-medium" [style.color]="item.amount > 0 ? '#dc2626' : '#1f2937'">
                        {{ formatCurrency(item.amount) }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="font-bold">
                    <tr>
                      <td class="py-4 p-text-gray-800 uppercase text-xs tracking-wider">Total Deductions</td>
                      <td class="py-4 text-right p-text-red-600 p-border-t-2 p-border-gray-100">{{ formatCurrency(p.deductionsAmount) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Leave Balance Block -->
            <div class="mt-10 p-6 p-bg-gray-50 rounded-xl p-border p-border-gray-100">
              <h4 class="text-xs font-bold p-text-gray-400 uppercase tracking-widest mb-4">Leave Balance Summary (Days)</h4>
              <div class="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div class="text-[10px] p-text-gray-500 uppercase mb-1">Opening</div>
                  <div class="text-lg font-bold p-text-gray-700">{{ p.leaveBalanceInfo.openingBalanceDays | number:'1.2-2' }}</div>
                </div>
                <div>
                  <div class="text-[10px] p-text-gray-500 uppercase mb-1">Accrued</div>
                  <div class="text-lg font-bold p-text-green-600">+{{ p.leaveBalanceInfo.accruedDays | number:'1.2-2' }}</div>
                </div>
                <div>
                  <div class="text-[10px] p-text-gray-500 uppercase mb-1">Taken</div>
                  <div class="text-lg font-bold p-text-red-500">-{{ p.leaveBalanceInfo.takenDays | number:'1.2-2' }}</div>
                </div>
                <div>
                  <div class="text-[10px] font-bold p-text-primary uppercase mb-1">Closing</div>
                  <div class="text-lg font-black p-text-primary">{{ p.leaveBalanceInfo.closingBalanceDays | number:'1.2-2' }}</div>
                </div>
              </div>
            </div>

            <!-- Net Pay Block -->
            <div class="mt-10 p-bg-primary p-8 rounded-xl flex justify-between items-center p-text-white shadow-lg overflow-hidden relative">
              <div class="absolute inset-0 p-bg-white opacity-5 mix-blend-overlay -rotate-12 translate-x-1/2"></div>
              <div class="flex flex-col relative z-10">
                <span class="uppercase tracking-widest font-black text-xs opacity-80">NET PAYABLE AMOUNT</span>
                <span class="text-[10px] font-medium mt-1">Beneficiary: {{ p.employeeName || 'the Employee' }}</span>
              </div>
              <div class="text-4xl font-black relative z-10">{{ formatCurrency(p.netAmount) }}</div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-10 p-bg-gray-50 p-border-t p-border-gray-100 flex justify-between items-end text-[10px] p-text-gray-400 italic">
            <div class="space-y-1">
              <div>© {{ currentYear }} NerdSmart Payroll Solutions. Protected Document.</div>
              <div>This is a computer generated document and does not require a signature.</div>
            </div>
            <div class="text-right">
              <div>Generated: {{ today | date:'dd/MM/yyyy HH:mm:ss' }}</div>
              <div class="font-bold p-text-primary">NerdSmart Official Payroll System v2.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Pure HEX/RGB definitions for all color aspects to avoid oklch parsing errors in html2canvas */
    .p-bg-white { background-color: #ffffff !important; }
    .p-bg-gray-50 { background-color: #f9fafb !important; }
    .p-bg-primary { background-color: #1677ff !important; }
    
    .p-text-white { color: #ffffff !important; }
    .p-text-primary { color: #1677ff !important; }
    .p-text-gray-800 { color: #1f2937 !important; }
    .p-text-gray-700 { color: #374151 !important; }
    .p-text-gray-600 { color: #4b5563 !important; }
    .p-text-gray-500 { color: #6b7280 !important; }
    .p-text-gray-400 { color: #9ca3af !important; }
    .p-text-gray-100 { color: #f3f4f6 !important; }
    .p-text-red-500 { color: #ef4444 !important; }
    .p-text-red-600 { color: #dc2626 !important; }
    .p-text-green-600 { color: #16a34a !important; }

    .p-border-primary { border-color: #1677ff !important; }
    .p-border-gray-100 { border-color: #f3f4f6 !important; }
    .p-border-gray-50 { border-color: #f9fafb !important; }
    .p-border-gray-800 { border-color: #1f2937 !important; }
    .p-border-t { border-top-width: 1px !important; border-top-style: solid !important; }
    .p-border-b { border-bottom-width: 1px !important; border-bottom-style: solid !important; }
    .p-border-b-2 { border-bottom-width: 2px !important; border-bottom-style: solid !important; }
    .p-border-t-2 { border-top-width: 2px !important; border-top-style: solid !important; }
    .p-border { border-width: 1px !important; border-style: solid !important; }

    .payslip-card {
      min-height: 1000px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: #ffffff;
    }

    .watermark {
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 6rem;
      font-weight: 900;
      opacity: 0.04;
      pointer-events: none;
      white-space: nowrap;
      z-index: 1;
    }

    .watermark-sub {
      position: absolute;
      top: 55%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 4rem;
      font-weight: 700;
      opacity: 0.03;
      pointer-events: none;
      white-space: nowrap;
      z-index: 1;
    }

    @media print {
      .no-print { display: none !important; }
      .p-6 { padding: 0 !important; }
      .payslip-wrapper {
        max-width: 100% !important;
        padding: 0 !important;
      }
      .payslip-card {
        box-shadow: none !important;
        max-width: 100% !important;
        margin: 0 !important;
        border: none !important;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }
      .watermark { opacity: 0.08 !important; }
    }
  `]
})
export class MyPayslipPage implements OnInit {
  payslip = signal<PayrollPayslip | null>(null);
  loading = signal<boolean>(false);
  exporting = signal<boolean>(false);

  today = new Date();
  currentYear = new Date().getFullYear();

  constructor(
    private route: ActivatedRoute,
    private payslipService: PayslipService,
    private sessionService: SessionService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const runId = params['runId'];
      const employeeId = params['employeeId'];

      if (runId && employeeId) {
        this.loadPayslipByRun(Number(runId), Number(employeeId));
      } else {
        this.loadCurrentPayslip();
      }
    });
  }

  loadCurrentPayslip(): void {
    const employeeId = this.sessionService.getCurrentEmployeeId();
    if (!employeeId) {
      this.message.error('Session error: Could not identify employee.');
      return;
    }

    this.loading.set(true);
    this.payslipService.getCurrentPayslipByEmployee(employeeId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (p) => this.payslip.set(p),
        error: (err) => {
          console.error('Error fetching payslip:', err);
          if (err.status !== 404) {
            this.message.error('Failed to load current payslip.');
          }
        }
      });
  }

  loadPayslipByRun(runId: number, employeeId: number): void {
    this.loading.set(true);
    this.payslipService.getPayslipByRunAndEmployee(runId, employeeId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (p) => this.payslip.set(p),
        error: (err) => {
          console.error('Error fetching payslip for run:', err);
          this.message.error('Failed to load payslip for the specified run.');
        }
      });
  }

  formatCurrency(value: number): string {
    if (value === undefined || value === null) return 'R 0.00';

    const absoluteValue = Math.abs(value);
    const formatted = new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(absoluteValue);

    if (value < 0) {
      return `(${formatted})`;
    }
    return formatted;
  }

  getEarnings(p: PayrollPayslip) {
    return (p.lineItems || []).filter(i => i.componentType === 'EARNING');
  }

  getDeductions(p: PayrollPayslip) {
    return (p.lineItems || []).filter(i => i.componentType === 'DEDUCTION');
  }

  getEmployerContributions(p: PayrollPayslip) {
    return (p.lineItems || []).filter(i => i.componentType === 'EMPLOYER_CONTRIBUTION');
  }

  getCurrentUserFullName(): string {
    return this.sessionService.currentUser()?.fullName || 'System User';
  }

  async downloadPdf() {
    const data = document.getElementById('payslip-print-area');
    if (!data) return;

    this.exporting.set(true);
    try {
      // Create canvas from the element
      const canvas = await html2canvas(data, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const contentDataURL = canvas.toDataURL('image/png');

      // Add image to PDF
      pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);

      const fileName = `Payslip_${this.payslip()?.employeeNumber}_${this.payslip()?.period || 'Official'}.pdf`;
      pdf.save(fileName);
      this.message.success('Official Payslip downloaded successfully.');
    } catch (error) {
      console.error('PDF Export Error:', error);
      this.message.error('Failed to generate official PDF.');
    } finally {
      this.exporting.set(false);
    }
  }

  printPayslip(): void {
    window.print();
  }
}
