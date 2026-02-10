import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ErIntakeService } from '../../services/er-intake.service';
import { ErCaseService } from '../../../cases/services/er-case.service';
import { EmployeesService, Employee } from '../../../../employees/services/employees.service';
import { ErCase } from '../../../cases/models/er-case.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-intake-create',
  standalone: false,
  templateUrl: './intake-create.component.html'
})
export class IntakeCreateComponent implements OnInit {
  form: FormGroup;
  loading = false;
  employees: Employee[] = [];
  cases: ErCase[] = [];

  constructor(
    private fb: FormBuilder,
    private intakeService: ErIntakeService,
    private caseService: ErCaseService,
    private employeeService: EmployeesService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      erCase: [null, [Validators.required]],
      incidentDateFrom: [null, [Validators.required]],
      incidentDateTo: [null],
      incidentLocation: [null, [Validators.required]],
      detailedDescription: [null, [Validators.required]],
      loggedBy: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadMetadata();
  }

  loadMetadata(): void {
    this.employeeService.getAll().subscribe(data => this.employees = data);
    this.caseService.getCases().subscribe((data: any) => this.cases = data);
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;
      const val = this.form.value;
      
      const payload = {
        erCase: { id: val.erCase },
        incidentDateFrom: val.incidentDateFrom.toISOString(),
        incidentDateTo: val.incidentDateTo ? val.incidentDateTo.toISOString() : null,
        incidentLocation: val.incidentLocation,
        detailedDescription: val.detailedDescription,
        loggedBy: { id: val.loggedBy }
      };

      this.intakeService.createIntake(payload).subscribe({
        next: () => {
          this.message.success('Intake created successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to create intake');
          this.loading = false;
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
