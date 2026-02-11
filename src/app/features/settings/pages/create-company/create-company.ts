import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { CompaniesService } from '../../services/companies.service';

@Component({
  selector: 'app-create-company',
  standalone: false,
  templateUrl: './create-company.html',
  styleUrl: './create-company.scss'
})
export class CreateCompany {
  createForm: FormGroup;
  loading: WritableSignal<boolean> = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private companiesService: CompaniesService,
    private message: NzMessageService
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required]],
      workLocation: ['', [Validators.required]]
    });
  }

  submitForm(): void {
    if (this.createForm.valid) {
      this.loading.set(true);
      this.companiesService.createCompany(this.createForm.value)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: () => {
            this.message.success('Company created successfully');
            this.router.navigate(['/app/settings/companies']);
          },
          error: (err) => {
            this.message.error(err.message || 'Failed to create company');
          }
        });
    } else {
      Object.values(this.createForm.controls).forEach(control => {
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
