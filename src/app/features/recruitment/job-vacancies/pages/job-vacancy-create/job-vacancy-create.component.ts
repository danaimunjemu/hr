import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
    selector: 'app-job-vacancy-create',
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
        NzSpaceModule,
        NzGridModule
    ],
    templateUrl: './job-vacancy-create.component.html',
    styleUrls: ['./job-vacancy-create.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobVacancyCreateComponent implements OnInit {
    vacancyForm: FormGroup;
    submitting = signal<boolean>(false);

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
        private router: Router
    ) {
        this.vacancyForm = this.fb.group({
            positionId: [null, [Validators.required]],
            organisationalUnitId: [null, [Validators.required]],
            companyId: [null, [Validators.required]],
            hiringManagerId: [null, [Validators.required]],
            headOfDepartmentId: [null, [Validators.required]],
            hrManagerId: [null, [Validators.required]],
            jobPostingType: [JobPostingType.NEW_POSITION, [Validators.required]],
            numberOfPositions: [1, [Validators.required, Validators.min(1)]],
            motivation: ['', [Validators.required, Validators.maxLength(1000)]],
            requestedDate: [new Date(), [Validators.required]],
            startDate: [null, [Validators.required]],
            targetStartDate: [null, [Validators.required]],
            internalOpportunity: [true]
        });
    }

    ngOnInit(): void {
        this.loadDropdownData();
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

    submitForm(): void {
        if (this.vacancyForm.valid) {
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

            // Remove the ID properties if the backend doesn't expect them alongside the objects
            delete payload.positionId;
            delete payload.organisationalUnitId;
            delete payload.companyId;
            delete payload.hiringManagerId;
            delete payload.headOfDepartmentId;
            delete payload.hrManagerId;

            this.jobVacancyService.create(payload)
                .pipe(finalize(() => this.submitting.set(false)))
                .subscribe({
                    next: () => {
                        this.message.success('Job vacancy created successfully');
                        this.router.navigate(['/app/recruitment/job-vacancies']);
                    },
                    error: () => this.message.error('Failed to create job vacancy')
                });
        } else {
            Object.values(this.vacancyForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
        }
    }
}
