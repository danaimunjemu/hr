import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { AuthService } from '../../../authentication/services/auth';
import { OffboardingCreateRequest, OffboardingType } from '../../models/offboarding.model';
import { OffboardingService } from '../../services/offboarding.service';

@Component({
  selector: 'app-offboarding-create-page',
  standalone: false,
  templateUrl: './offboarding-create-page.component.html',
  styleUrl: './offboarding-create-page.component.scss'
})
export class OffboardingCreatePageComponent implements OnInit {
  saving = false;
  form: FormGroup;
  loggedInUserName = 'Current User';
  readonly offboardingTypes: OffboardingType[] = [
    'RESIGNATION',
    'TERMINATION',
    'RETIREMENT',
  ];

  constructor(
    private fb: FormBuilder,
    private offboardingService: OffboardingService,
    private authService: AuthService,
    private message: NzMessageService,
    private router: Router
  ) {
    this.form = this.fb.group({
      offboardingType: ['RESIGNATION', Validators.required],
      exitDate: [null, Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]],
      comments: ['']
    });
  }

  ngOnInit(): void {
    this.resolveLoggedInUser();
  }

  create(): void {
    if (this.saving || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.message.error('You must be logged in to submit an offboarding request.');
      return;
    }

    const value = this.form.value;
    const payload: OffboardingCreateRequest = {
      offboardingType: value.offboardingType as OffboardingType,
      exitDate: this.toIsoDate(value.exitDate),
      reason: String(value.reason || '').trim(),
      comments: String(value.comments || '').trim()
    };

    this.saving = true;
    this.offboardingService
      .create(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: record => {
          this.message.success('Offboarding record created.');
          this.router.navigate(['/app/offboarding', record.id]);
        },
        error: (error: Error) => {
          this.message.error(error.message || 'Failed to create offboarding record.');
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/app/offboarding']);
  }

  private resolveLoggedInUser(): void {
    const user = (this.authService.currentUser() || this.readStoredUser()) as Record<string, unknown> | null;
    const fullName = [user?.['firstName'], user?.['lastName']]
      .filter(Boolean)
      .map(value => String(value))
      .join(' ')
      .trim();
    this.loggedInUserName =
      fullName || String(user?.['username'] || '') || String(user?.['email'] || '') || 'Current User';
  }

  private readStoredUser(): Record<string, unknown> | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }

  private toIsoDate(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    if (typeof value === 'string' && value.length >= 10) {
      return value.slice(0, 10);
    }
    return '';
  }
}
