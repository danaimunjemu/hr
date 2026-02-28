import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookiesService } from '../storage/cookies.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {

  constructor(private cookiesService: CookiesService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let req = request;

    // Rewrite requests targeting the old hardcoded localhost URL to use the environment API URL
    if (req.url.startsWith('http://localhost:8090/api')) {
      req = req.clone({
        url: req.url.replace('http://localhost:8090/api', environment.apiUrl)
      });
    }

    const token = this.cookiesService.getCookie('token');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}
