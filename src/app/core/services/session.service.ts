import { Injectable } from '@angular/core';
import {Router} from "@angular/router";
import {JwtDecoderService} from "./jwt-decoder.service";
import { CookiesService } from '../storage/cookies.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(
    private router: Router,
    private cookiesService: CookiesService,
    private jwtDecoder: JwtDecoderService
  ) {}

  /** Check if the token is expired */
  isTokenExpired(): boolean {
    const token = this.cookiesService.getCookie('token');
    if (!token) return true;

    const exp = this.jwtDecoder.getExpiration(token);
    if (!exp) return true;

    const now = Math.floor(Date.now() / 1000); // current time in seconds
    return now >= exp;
  }

  logout() {
    this.cookiesService.deleteCookies();
    this.router.navigateByUrl('auth').then();
  }

  /** Call this on app start or route change */
  checkSession() {
    if (this.isTokenExpired()) {
      this.logout();
    }
  }

}
