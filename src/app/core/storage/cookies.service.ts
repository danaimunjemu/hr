import { Injectable } from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {EncryptionService} from "./encryption.service";

@Injectable({
  providedIn: 'root'
})
export class CookiesService {

  constructor(
    private cookieService: CookieService,
    private encryptionService: EncryptionService
  ) { }

  addCookie(code: string, value: any) {
    this.cookieService.set(code, this.encryptionService.encrypt(value));
  }

  getCookie(code: string) {
    if (this.encryptionService.decrypt(this.cookieService.get(code))) {
      return JSON.parse(this.encryptionService.decrypt(this.cookieService.get(code)));
    }
    return;
  }

  deleteCookies() {
    let cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }



}
