import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkContractService } from '../../../services/work-contract.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WorkContract } from '../../../models/work-contract.model';

@Component({
  selector: 'app-work-contract-form',
  standalone: false,
  templateUrl: './work-contract-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class WorkContractFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  contractId: number | null = null;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private workContractService: WorkContractService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      normalHoursPerDay: [8, [Validators.required, Validators.min(0)]],
      normalHoursPerWeek: [40, [Validators.required, Validators.min(0)]],
      overtimePolicy: ['DAILY', [Validators.required]],
      overtimeDailyThreshold: [0, [Validators.required, Validators.min(0)]],
      overtimeWeeklyThreshold: [0, [Validators.required, Validators.min(0)]],
      roundingMinutes: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.contractId = +params['id'];
        this.loadContract(this.contractId);
      }
    });
  }

  loadContract(id: number): void {
    this.loading = true;
    this.workContractService.getById(id).subscribe({
      next: (contract) => {
        this.form.patchValue(contract);
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error('Failed to load contract details');
        this.loading = false;
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.submitting = true;
    const contractData: WorkContract = this.form.value;

    if (this.isEditMode && this.contractId) {
      this.workContractService.update(this.contractId, contractData).subscribe({
        next: () => {
          this.message.success('Work contract updated successfully');
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update work contract');
          this.submitting = false;
        }
      });
    } else {
      this.workContractService.create(contractData).subscribe({
        next: () => {
          this.message.success('Work contract created successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to create work contract');
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
