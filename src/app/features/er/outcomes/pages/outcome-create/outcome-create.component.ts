import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ErOutcomeService } from '../../services/er-outcome.service';
import { ErCaseService } from '../../../cases/services/er-case.service';
import { EmployeesService, Employee } from '../../../../employees/services/employees.service';
import { ErCase } from '../../../cases/models/er-case.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-outcome-create',
  standalone: false,
  templateUrl: './outcome-create.component.html'
})
export class OutcomeCreateComponent implements OnInit {
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);
  employees: WritableSignal<Employee[]> = signal([]);
  cases: WritableSignal<ErCase[]> = signal([]);

  constructor(
    private fb: FormBuilder,
    private outcomeService: ErOutcomeService,
    private caseService: ErCaseService,
    private employeeService: EmployeesService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      erCase: [null, [Validators.required]],
      outcomeType: [null, [Validators.required]],
      decisionSummary: [null, [Validators.required]],
      actionTaken: [null, [Validators.required]],
      decisionAt: [new Date(), [Validators.required]],
      decidedBy: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadMetadata();
    this.setCaseFromRoute();
  }

  loadMetadata(): void {
    this.employeeService.getAll().subscribe(data => this.employees.set(data));
    this.caseService.getCases().subscribe(data => this.cases.set(data));
  }

  private setCaseFromRoute(): void {
    const caseId = this.route.parent?.parent?.snapshot.params['id'];
    if (caseId) {
      this.form.get('erCase')?.setValue(Number(caseId));
    }
  }

  submit(): void {
    if (this.form.valid) {
      this.loading.set(true);
      const val = this.form.value;
      
      const payload = {
        erCase: { id: val.erCase },
        outcomeType: val.outcomeType,
        decisionSummary: val.decisionSummary,
        actionTaken: val.actionTaken,
        decisionAt: val.decisionAt.toISOString(),
        decidedBy: { id: val.decidedBy }
      };

      this.outcomeService.createOutcome(payload).subscribe({
        next: () => {
          this.message.success('Outcome recorded successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to record outcome');
          this.loading.set(false);
        }
      });
    } else {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
