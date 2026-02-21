import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { JobVacancyService } from '../../services/job-vacancy.service';
import { PositionsService } from '../../../../settings/services/positions.service';
import { OrganizationalUnitsService } from '../../../../settings/services/organizational-units.service';
import { EmployeesService } from '../../../../employees/services/employees.service';
import { CompaniesService } from '../../../../settings/services/companies.service';
import { JobPostingType } from '../../models/job-vacancy.model';
import { finalize, forkJoin } from 'rxjs';

@Component({
    selector: 'app-job-vacancy-edit',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        NzFormModule,
        NzInputModule,
        NzSelectModule,
        NzButtonModule,
        NzDatePickerModule,
        NzSwitchModule,
        NzCardModule,
        NzIconModule,
        NzSpinModule,
        NzSpaceModule,
        NzGridModule
    ],
    templateUrl: './job-vacancy-edit.component.html',
    styleUrls: ['./job-vacancy-edit.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobVacancyEditComponent implements OnInit {
    vacancyForm: FormGroup;
    loading = signal<boolean>(true);
    submitting = signal<boolean>(false);
    vacancyId: string | null = null;

    // Data for dropdowns
    positions = signal<any[]>([]);
    units = signal<any[]>([]);
    companies = signal<any[]>([]);
    employees = signal<any[]>([]);

    postingTypes = Object.values(JobPostingType);

    constructor(
        private fb: FormBuilder,
        private jobVacancyService: JobVacancyService,
        private positionsService: PositionsService,
        private unitsService: OrganizationalUnitsService,
        private companiesService: CompaniesService,
        private employeesService: EmployeesService,
        private message: NzMessageService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.vacancyForm = this.fb.group({
            positionId: [null, [Validators.required]],
            organisationalUnitId: [null, [Validators.required]],
            companyId: ['C001'],
            hiringManagerId: [null, [Validators.required]],
            headOfDepartmentId: [null, [Validators.required]],
            hrManagerId: [null, [Validators.required]],
            jobPostingType: [JobPostingType.NEW_POSITION, [Validators.required]],
            numberOfPositions: [1, [Validators.required, Validators.min(1)]],
            motivation: ['', [Validators.required]],
            requestedDate: [null, [Validators.required]],
            startDate: [null, [Validators.required]],
            targetStartDate: [null, [Validators.required]],
            internalOpportunity: [true]
        });
    }

    ngOnInit(): void {
        this.loadDropdownData();
        this.vacancyId = this.route.snapshot.paramMap.get('id');
        if (this.vacancyId) {
            this.loadVacancy(this.vacancyId);
        }
    }

    loadDropdownData(): void {
        forkJoin({
            positions: this.positionsService.getAll(),
            units: this.unitsService.getAll(),
            companies: this.companiesService.getCompanies(),
            employees: this.employeesService.getAll()
        }).subscribe({
            next: (data) => {
                this.positions.set(data.positions.map(p => ({
                    id: String(p.id),
                    name: p.name
                })));
                this.units.set(data.units.map(u => ({
                    id: String(u.id),
                    name: u.name
                })));
                this.companies.set(data.companies.map(c => ({
                    id: String(c.id),
                    name: c.name
                })));
                this.employees.set(data.employees.map(e => ({
                    id: String(e.id),
                    name: `${e.firstName} ${e.lastName}`
                })));
            },
            error: () => this.message.error('Failed to load form data')
        });
    }

    loadVacancy(id: string): void {
        this.loading.set(true);
        this.jobVacancyService.getById(id)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (data) => {
                    this.vacancyForm.patchValue({
                        positionId: String(data.position.id),
                        organisationalUnitId: String(data.organisationalUnit.id),
                        companyId: String(data.company.id),
                        hiringManagerId: String(data.hiringManager.id),
                        headOfDepartmentId: String(data.headOfDepartment.id),
                        hrManagerId: String(data.hrManager.id),
                        jobPostingType: data.jobPostingType,
                        numberOfPositions: data.numberOfPositions,
                        motivation: data.motivation,
                        requestedDate: new Date(data.requestedDate),
                        startDate: new Date(data.startDate),
                        targetStartDate: new Date(data.targetStartDate),
                        internalOpportunity: data.internalOpportunity
                    });
                },
                error: () => this.message.error('Failed to load job vacancy details')
            });
    }

    submitForm(): void {
        if (this.vacancyForm.valid && this.vacancyId) {
            this.submitting.set(true);

            const formValue = this.vacancyForm.value;
            const payload = {
                ...formValue,
                position: { id: formValue.positionId },
                organisationalUnit: { id: formValue.organisationalUnitId },
                company: { id: formValue.companyId },
                hiringManager: { id: formValue.hiringManagerId },
                headOfDepartment: { id: formValue.headOfDepartmentId },
                hrManager: { id: formValue.hrManagerId }
            };

            delete payload.positionId;
            delete payload.organisationalUnitId;
            delete payload.companyId;
            delete payload.hiringManagerId;
            delete payload.headOfDepartmentId;
            delete payload.hrManagerId;

            this.jobVacancyService.update(this.vacancyId, payload)
                .pipe(finalize(() => this.submitting.set(false)))
                .subscribe({
                    next: () => {
                        this.message.success('Job vacancy updated successfully');
                        this.router.navigate(['/app/recruitment/job-vacancies']);
                    },
                    error: () => this.message.error('Failed to update job vacancy')
                });
        }
    }
}
