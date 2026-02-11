import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { Company, CompaniesService } from '../../services/companies.service';

@Component({
  selector: 'app-edit-company',
  standalone: false,
  templateUrl: './edit-company.html',
  styleUrl: './edit-company.scss'
})
export class EditCompany implements OnInit {
  editForm!: FormGroup;
  companyId!: number;
  loading: WritableSignal<boolean> = signal(false);
  saving: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private companiesService: CompaniesService,
    private message: NzMessageService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.companyId = +id;
      this.fetchCompany(this.companyId);
    } else {
      this.error.set('Invalid company ID');
    }
  }

  createForm(): void {
    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      workLocation: ['', [Validators.required]]
    });
  }

  fetchCompany(id: number): void {
    this.loading.set(true);
    this.companiesService.getCompany(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.editForm.patchValue({
            name: data.name,
            workLocation: data.workLocation
          });
        },
        error: (err) => this.error.set(err.message)
      });
  }

  submitForm(): void {
    if (this.editForm.valid) {
      this.saving.set(true);
      const payload = { ...this.editForm.value, id: this.companyId };
      
      this.companiesService.updateCompany(this.companyId, payload)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => {
            this.message.success('Company updated successfully');
            this.router.navigate(['/app/settings/companies']);
          },
          error: (err) => {
            this.message.error(err.message || 'Failed to update company');
          }
        });
    } else {
      Object.values(this.editForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/app/settings/companies']);
  }
}
