import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-activate-account',
  standalone: false,
  templateUrl: './activate-account.html',
  styleUrls: ['./activate-account.scss']
})
export class ActivateAccount {
  form: FormGroup;
  isLoading: WritableSignal<boolean> = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private msg: NzMessageService
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      otp: ['', [Validators.required]],
      password: ['', [Validators.required, this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const noWhitespace = !/\s/.test(value);
    const validLength = value.length >= 10;

    const valid = hasUpperCase && hasLowerCase && hasNumeric && noWhitespace && validLength;

    if (!valid) {
      return {
        strongPassword: {
          hasUpperCase, hasLowerCase, hasNumeric, noWhitespace, validLength
        }
      };
    }
    return null;
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  submit() {
    if (this.form.invalid) {
      this.updateValidity(this.form);
      return;
    }

    this.isLoading.set(true);
    const { username, otp, password } = this.form.value;

    this.authService.activateAccount(otp, { username, password })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.msg.success('Account activated successfully! Please login.');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          console.error(err);
          this.msg.error('Failed to activate account. Invalid OTP or server error.');
        }
      });
  }

  private updateValidity(form: FormGroup): void {
    Object.values(form.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }
}
