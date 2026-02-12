// import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
// import {Injectable} from "@angular/core";
// import {Observable} from "rxjs";
// import {NzNotificationService} from "ng-zorro-antd/notification";
// import { CookiesService } from "../storage/cookies.service";
// import { RoutingService } from "../services/routing.service";
// import {SessionService} from "../services/session.service";

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard implements CanActivate{
//   constructor(
//     private cookiesService: CookiesService,
//     private router: Router,
//     private notificationService: NzNotificationService,
//     private routingService: RoutingService,
//     private session: SessionService
//     ) {}

//   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
//     if (this.cookiesService.getCookie('token')) {
//       if (this.session.isTokenExpired()) {
//         let token = this.cookiesService.getCookie('token');
//         try {
//           const payload = token.split('.')[1]; // JWT payload is the 2nd part
//           const decoded = atob(payload);      // base64 decode
//           console.log(JSON.parse(decoded));         // parse to JSON
//         } catch (error) {
//           console.error('Invalid JWT token', error);
//         }
//         this.notificationService.create(
//           'info',
//           'Session Expired',
//           'You are now being redirected'
//         )
//         this.session.logout();
//         return false;
//       }
//       return true;
//     } else {
//       this.session.logout();
//       this.notificationService.create(
//         'error',
//         'Unauthenticated',
//         'You are not authorised to access ' + state.url,
//         {nzDuration: 15000}
//       );
//       this.routingService.navigateByUrl('/');
//       return false
//     }
//   }
// }