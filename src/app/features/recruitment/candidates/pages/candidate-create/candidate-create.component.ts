import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AntDesignModules } from '../../../../../core/modules/antdesign.module';
import { CandidateService } from '../../services/candidate.service';
import { JobVacancyService } from '../../../job-vacancies/services/job-vacancy.service';
import { EmployeesService } from '../../../../../features/employees/services/employees.service';
import { JobVacancy } from '../../../job-vacancies/models/job-vacancy.model';
import { Employee } from '../../../../../features/employees/models/employee.model';
import { finalize, forkJoin } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
    selector: 'app-candidate-create',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, AntDesignModules],
    templateUrl: './candidate-create.component.html',
    styleUrls: ['./candidate-create.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateCreateComponent implements OnInit {
    form!: FormGroup;
    loading = signal<boolean>(false);
    submitting = signal<boolean>(false);
    isEdit = signal<boolean>(false);
    candidateId = signal<string | null>(null);

    vacancies = signal<JobVacancy[]>([]);
    employees = signal<Employee[]>([]);
    isInternal = signal<boolean>(false);

    constructor(
        private fb: FormBuilder,
        private candidateService: CandidateService,
        private jobVacancyService: JobVacancyService,
        private employeesService: EmployeesService,
        public message: NzMessageService,
        public route: ActivatedRoute,
        public router: Router
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.loadInitialData();
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEdit.set(true);
                this.candidateId.set(params['id']);
                this.loadCandidate(params['id']);
            }
        });

        this.route.queryParams.subscribe(params => {
            if (params['vacancyId']) {
                this.form.patchValue({ jobVacancyId: params['vacancyId'] });
            }
            if (params['type'] === 'internal') {
                this.isInternal.set(true);
            }
        });
    }

    private initForm(): void {
        this.form = this.fb.group({
            firstName: ['', [Validators.required]],
            middleName: [''],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            phone: [''],
            nationalId: [''],
            linkedInProfile: [''],
            currentAddress: [''],
            currentEmployer: [''],
            currentJobTitle: [''],
            jobVacancyId: [null, [Validators.required]],
            employeeId: [null],
            source: ['Direct'],
            expectedSalary: [null],
            availableFrom: [null],
            noticePeriodDays: [null],
            willingToRelocate: [false],
            skills: [''],
            qualifications: [''],
            yearsOfExperience: [null],
            notes: ['']
        });

        // Toggle fields based on internal/external
        this.form.get('employeeId')?.valueChanges.subscribe(val => {
            if (val) {
                const emp = this.employees().find(e => e.id.toString() === val);
                if (emp) {
                    this.form.patchValue({
                        firstName: emp.firstName,
                        lastName: emp.lastName,
                        email: (emp as any).email
                    }, { emitEvent: false });
                }
            }
        });
    }

    private loadInitialData(): void {
        this.loading.set(true);
        forkJoin({
            vacancies: this.jobVacancyService.getAll(),
            employees: this.employeesService.getEmployees()
        }).pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (res) => {
                    this.vacancies.set(res.vacancies);
                    this.employees.set(res.employees);
                },
                error: () => this.message.error('Failed to load form data')
            });
    }

    private loadCandidate(id: string): void {
        this.loading.set(true);
        this.candidateService.getById(id)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (data) => {
                    this.form.patchValue({
                        ...data,
                        jobVacancyId: data.jobVacancy.id,
                        employeeId: data.employee?.id
                    });
                    if (data.employee) {
                        this.isInternal.set(true);
                    }
                },
                error: () => this.message.error('Failed to load candidate details')
            });
    }

    submit(): void {
        if (this.submitting() || this.form.invalid) {
            if (this.form.invalid) {
                Object.values(this.form.controls).forEach(control => {
                    if (control.invalid) {
                        control.markAsDirty();
                        control.updateValueAndValidity({ onlySelf: true });
                    }
                });
            }
            return;
        }

        this.submitting.set(true);
        const val = this.form.value;

        // Transform to nested structure and ensure mandatory fields are present
        const payload = {
            ...val,
            status: val.status || 'New',
            applicationDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            availableFrom: val.availableFrom ? new Date(val.availableFrom).toISOString().split('T')[0] : null,
            jobVacancy: { id: val.jobVacancyId },
            employee: val.employeeId ? { id: val.employeeId } : null
        };

        // Remove helper form values that shouldn't be in the payload
        delete (payload as any).jobVacancyId;
        delete (payload as any).employeeId;

        console.log('Submitting Candidate Payload:', payload);

        const action = this.isEdit()
            ? this.candidateService.update(this.candidateId()!, payload)
            : this.isInternal()
                ? this.candidateService.internalEmployeeApply(payload)
                : this.candidateService.create(payload);

        action.pipe(finalize(() => this.submitting.set(false)))
            .subscribe({
                next: () => {
                    this.message.success(`Candidate ${this.isEdit() ? 'updated' : 'applied'} successfully`);
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: () => this.message.error(`Failed to ${this.isEdit() ? 'update' : 'apply'} candidate`)
            });
    }
}
