import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ErCaseService } from '../../services/er-case.service';
import { EmployeesService, Employee } from '../../../../employees/services/employees.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-case-create',
  standalone: false,
  templateUrl: './case-create.component.html'
})
export class CaseCreateComponent implements OnInit {
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);
  employees: WritableSignal<Employee[]> = signal([]);

  constructor(
    private fb: FormBuilder,
    private caseService: ErCaseService,
    private employeeService: EmployeesService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      title: [null, [Validators.required]],
      caseType: [null, [Validators.required]],
      priority: ['MEDIUM', [Validators.required]],
      confidentiality: ['NORMAL', [Validators.required]],
      reporterType: ['MANAGER', [Validators.required]],
      subjectEmployee: [null, [Validators.required]],
      reporterEmployee: [null, [Validators.required]],
      summary: [null, [Validators.required]],
      company: [1] // Default or select
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe(data => this.employees.set(data));
  }

  submit(): void {
    if (this.form.valid) {
      this.loading.set(true);
      const val = this.form.value;
      const payload = {
        ...val,
        subjectEmployee: { id: val.subjectEmployee },
        reporterEmployee: { id: val.reporterEmployee },
        company: { id: val.company }
      };

      this.caseService.createCase(payload).subscribe({
        next: () => {
          this.message.success('Case created successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to create case');
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
