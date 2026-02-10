import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ErPartyService } from '../../services/er-party.service';
import { ErCaseService } from '../../../cases/services/er-case.service';
import { EmployeesService, Employee } from '../../../../employees/services/employees.service';
import { ErCase } from '../../../cases/models/er-case.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-party-create',
  standalone: false,
  templateUrl: './party-create.component.html'
})
export class PartyCreateComponent implements OnInit {
  form: FormGroup;
  loading = false;
  employees: Employee[] = [];
  cases: ErCase[] = [];

  constructor(
    private fb: FormBuilder,
    private partyService: ErPartyService,
    private caseService: ErCaseService,
    private employeeService: EmployeesService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      erCase: [null, [Validators.required]],
      role: [null, [Validators.required]],
      personType: ['EMPLOYEE', [Validators.required]],
      employee: [null],
      externalName: [null],
      notes: [null]
    });
  }

  ngOnInit(): void {
    this.loadMetadata();
    
    // Conditional validation based on personType
    this.form.get('personType')?.valueChanges.subscribe(val => {
      if (val === 'EMPLOYEE') {
        this.form.get('employee')?.setValidators([Validators.required]);
        this.form.get('externalName')?.clearValidators();
      } else {
        this.form.get('employee')?.clearValidators();
        this.form.get('externalName')?.setValidators([Validators.required]);
      }
      this.form.get('employee')?.updateValueAndValidity();
      this.form.get('externalName')?.updateValueAndValidity();
    });
  }

  loadMetadata(): void {
    this.employeeService.getAll().subscribe(data => this.employees = data);
    this.caseService.getCases().subscribe(data => this.cases = data);
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;
      const val = this.form.value;
      
      const payload = {
        erCase: { id: val.erCase },
        role: val.role,
        personType: val.personType,
        employee: val.personType === 'EMPLOYEE' ? { id: val.employee } : null,
        externalName: val.personType === 'EXTERNAL' ? val.externalName : null,
        notes: val.notes
      };

      this.partyService.createParty(payload).subscribe({
        next: () => {
          this.message.success('Party added successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to add party');
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
