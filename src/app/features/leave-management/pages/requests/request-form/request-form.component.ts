import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeaveManagementRequestService } from '../../../services/leave-request.service';
import { LeaveManagementTypeService } from '../../../services/leave-type.service';
import { LeaveType } from '../../../models/leave-type.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../authentication/services/auth';

@Component({
    selector: 'app-request-form',
    templateUrl: './request-form.component.html',
    styleUrls: ['./request-form.component.scss'],
    standalone: false
})
export class RequestFormComponent implements OnInit {
    validateForm!: FormGroup;
    leaveTypes = signal<LeaveType[]>([]);
    loading = signal<boolean>(false);
    submitting = signal<boolean>(false);
    user = signal<any | null>(null);
    requestId: number | null = null;
    isEditMode = signal<boolean>(false);

    constructor(
        private fb: FormBuilder,
        private requestService: LeaveManagementRequestService,
        private typeService: LeaveManagementTypeService,
        private route: ActivatedRoute,
        private router: Router,
        private message: NzMessageService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.requestId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
        this.isEditMode.set(!!this.requestId);

        const userStr = localStorage.getItem('user');
        this.user.set(userStr ? JSON.parse(userStr) : null);
        console.log("This user: ", this.user());

        this.validateForm = this.fb.group({
            employee: [this.user()?.employee, [Validators.required]],
            leaveType: [null, [Validators.required]],
            startDate: [null, [Validators.required]],
            endDate: [null, [Validators.required]],
            startDayPortion: ['FULL_DAY', [Validators.required]],
            endDayPortion: ['FULL_DAY', [Validators.required]],
            reason: [null, [Validators.required]]
        });

        this.loadLeaveTypes();
        if (this.isEditMode()) {
            this.loadRequest();
        }
    }

    loadLeaveTypes(): void {
        this.typeService.getAll().subscribe({
            next: (types) => this.leaveTypes.set(types),
            error: () => this.message.error('Failed to load leave types')
        });
    }



    loadRequest(): void {
        if (!this.requestId) return;
        this.loading.set(true);
        this.requestService.getById(this.requestId)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (req) => {
                    this.validateForm.patchValue({
                        leaveType: req.leaveType,
                        startDate: new Date(req.startDate),
                        endDate: new Date(req.endDate),
                        startDayPortion: req.startDayPortion,
                        endDayPortion: req.endDayPortion,
                        reason: req.anomalyIndicators
                    });
                },
                error: () => this.message.error('Failed to load request details')
            });
    }

    submitForm(): void {
        if (this.validateForm.valid) {
            this.submitting.set(true);
            const payload = {
                ...this.validateForm.value,
                startDate: new Date(this.validateForm.value.startDate).toISOString(),
                endDate: new Date(this.validateForm.value.endDate).toISOString()
            };

            this.requestService.create(payload)
                .pipe(finalize(() => this.submitting.set(false)))
                .subscribe({
                    next: () => {
                        this.message.success('Leave request saved successfully');
                        this.router.navigate(['/app/time-and-leave-user/leave-management/requests']);
                    },
                    error: (err: any) => {
                        this.message.error(err.error?.message || 'Failed to save leave request');
                    }
                });
        } else {
            Object.values(this.validateForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
        }
    }
}
