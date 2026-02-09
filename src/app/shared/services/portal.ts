import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { EncryptionService } from '../../core/storage/encryption.service';
import { CookiesService } from '../../core/storage/cookies.service';

export interface Portal {
  value: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class PortalService {

  private portalSubject = new BehaviorSubject<Portal | null>(null);
  portal$ = this.portalSubject.asObservable();

  constructor(
    private cookieService: CookieService,
    private encryptionService: EncryptionService,
    private cookiesService: CookiesService
  ) {
    const savedPortal = this.getPortal();
    if (savedPortal) {
      this.portalSubject.next(savedPortal);
    }
  }

  setPortal(portal: Portal) {
    this.cookiesService.addCookie('portal', portal);
    this.portalSubject.next(portal);
  }

  getPortal(): Portal | null {
    return this.cookiesService.getCookie('portal');
  }

  clearPortal() {
    this.cookieService.delete('portal');
    this.portalSubject.next(null);
  }
}
