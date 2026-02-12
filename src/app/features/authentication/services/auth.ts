import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {CookiesService} from '../../../core/storage/cookies.service';
import {Router} from '@angular/router';
import { SessionService } from '../../../core/services/session.service';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `http://localhost:8090/api/auth`;
  
  // Expose current user as a signal
  currentUser = signal<any>(null);

  constructor(
    private http: HttpClient,
    private cookiesService: CookiesService,
    private router: Router,
    private sessionService: SessionService
  ) {
    // Initialize signal from local storage if available
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    this.cookiesService.deleteCookies();
    const body: LoginRequest = {
      username,
      password,
    };

    return this.http
      .post<LoginResponse>(`${this.API_URL}/login`, body)
      .pipe(
        tap((response) => {
          console.log(response);
          // Store token(s) securely
          this.cookiesService.addCookie('token', response.accessToken);
          this.cookiesService.addCookie('refresh_token', response.refreshToken);
          
          // Store user in localStorage to avoid cookie size limits
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Update signal
          this.currentUser.set(response.user);

          this.cookiesService.addCookie('portal', {
            value: 'ASSESSMENT',
            label: 'Assessment Portal'
          });
        })
      );
  }

  logout() {
    this.cookiesService.deleteCookies();
    localStorage.clear();
    this.currentUser.set(null); // Clear signal
    this.router.navigateByUrl('auth').then();
  }

  isAuthenticated(): boolean {
    // Check for cookie token presence (cookiesService encrypts, so direct check might be tricky if we don't use the service)
    // But simplistic check for now:
    return !!this.cookiesService.getCookie('token'); 
  }

  activateAccount(otp: string, payload: { username: string; password: string }): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/password-reset/${otp}`, payload);
  }
}
