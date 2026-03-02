import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Payslip } from '../../models/payslip.model';

@Component({
    selector: 'app-payslip-template',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="payslip-container p-8 bg-white border rounded shadow-lg max-w-2xl mx-auto" id="payslip-content">
      <div class="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold uppercase tracking-wider">Payslip</h2>
          <p class="text-gray-500">Period: {{ payslip?.period }}</p>
        </div>
        <div class="text-right">
          <p class="font-semibold text-lg">Nerdma Tech Ltd</p>
          <p class="text-sm text-gray-500">Johannesburg, South Africa</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h4 class="text-xs uppercase font-bold text-gray-400 mb-2">Employee Details</h4>
          <p class="font-semibold text-lg">{{ employeeName }}</p>
          <p class="text-sm text-gray-500">Employee ID: {{ payslip?.employeeId }}</p>
        </div>
        <div class="text-right">
          <h4 class="text-xs uppercase font-bold text-gray-400 mb-2">Payment Details</h4>
          <p class="text-sm">Generated At: {{ payslip?.generatedAt | date:'medium' }}</p>
          <p class="text-sm">Template: {{ payslip?.templateVersion }}</p>
        </div>
      </div>

      <div class="border rounded overflow-hidden mb-8">
        <table class="w-full text-left">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-2 text-xs font-bold uppercase text-gray-500">Description</th>
              <th class="px-4 py-2 text-xs font-bold uppercase text-gray-500 text-right">Amount (R)</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr>
              <td class="px-4 py-3">Gross Basic Pay</td>
              <td class="px-4 py-3 text-right">{{ payslip?.grossBasic | number:'1.2-2' }}</td>
            </tr>
            <tr>
              <td class="px-4 py-3">Overtime Allowance</td>
              <td class="px-4 py-3 text-right">{{ payslip?.grossOvertime | number:'1.2-2' }}</td>
            </tr>
            <tr>
              <td class="px-4 py-3">Leave Payable Amount</td>
              <td class="px-4 py-3 text-right">{{ payslip?.leavePayableAmount | number:'1.2-2' }}</td>
            </tr>
            <tr class="bg-red-50">
              <td class="px-4 py-3 text-red-600 font-semibold">PAYE Deduction</td>
              <td class="px-4 py-3 text-right text-red-600 font-semibold">-{{ payslip?.paye | number:'1.2-2' }}</td>
            </tr>
          </tbody>
          <tfoot class="bg-blue-600 text-white font-bold">
            <tr>
              <td class="px-4 py-4 text-lg">NET TAKE HOME</td>
              <td class="px-4 py-4 text-right text-lg">R {{ payslip?.netPay | number:'1.2-2' }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="text-center text-xs text-gray-400 italic">
        This is a computer-generated document and does not require a physical signature.
      </div>
    </div>
  `,
    styles: [`
    .payslip-container { font-family: 'Inter', sans-serif; }
  `]
})
export class PayslipTemplateComponent {
    @Input() payslip: Payslip | null = null;
    @Input() employeeName: string = '';
}
