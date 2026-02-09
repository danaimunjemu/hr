import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {CookiesService} from '../../../core/storage/cookies.service';
import {Router} from '@angular/router';
import { PortalService } from '../../../shared/services/portal';

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

  constructor(
    private http: HttpClient,
    private cookiesService: CookiesService,
    private router: Router,
    private portalService: PortalService
  ) {}

  login(username: string, password: string): Observable<LoginResponse> {
    const body: LoginRequest = {
      username,
      password,
    };

    return this.http
      .post<LoginResponse>(`${this.API_URL}/login`, body)
      .pipe(
        tap((response) => {
          // Store token(s) securely
          this.cookiesService.addCookie('token', response.accessToken);
          this.cookiesService.addCookie('refresh_token', response.refreshToken);
          this.cookiesService.addCookie('user', response.user);
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
    this.router.navigateByUrl('auth').then();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}
