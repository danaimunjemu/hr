import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService} from '../../services/auth';


@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.scss', '../auth.scss'],
})
export class Login {
  isLoading = false;
  errorMessage: string | null = null;

  form: { form: FormGroup };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = {
      form: this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
      }),
    };
  }

  submit(): void {
    if (this.form.form.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { username, password } = this.form.form.value;

    this.authService.login(username, password).subscribe({
      next: (response: any) => {
        console.log(response);
        this.isLoading = false;
        this.router.navigate(['/app']); // or dashboard route
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage =
          error?.error?.message || 'Invalid username or password';
      },
    });
  }
}
