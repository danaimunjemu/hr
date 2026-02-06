// import {CanActivateFn, Router} from '@angular/router';
// import lo from 'localforage';
// import {User} from '../models/users/user.model';
// import {inject} from '@angular/core';
// import {NzNotificationService} from 'ng-zorro-antd/notification';
// import {AuthService} from '../../features/authentication/services/auth.service';
//
//
// const nerdscoreAuthLo = lo.createInstance({
//   name: 'nerdScoreAuth'
// });
//
//
// export const authGuard: CanActivateFn = async (route, state) => {
//   const router = inject(Router);
//   const notificationService = inject(NzNotificationService);
//   const authService = inject(AuthService);
//   const user = await nerdscoreAuthLo.getItem<User>('esg_user');
//   const token = await nerdscoreAuthLo.getItem<string>('esg_token');
//
//
//   // if user object does not exist  → redirect to login page
//   if (!user || !token) {
//     notificationService.create(
//       'error',
//       'Unauthenticated',
//       'You are not authorised to access ' + state.url
//     );
//     // await authService.logout();
//     await router.navigate(['/auth'], {queryParams: {returnUrl: state.url}});
//     return false;
//   }
//
//   // if the token has expired  → redirect to login page
//   const tokenExpired = false;
//   // const tokenExpired = await authService.isTokenExpired();
//   if(tokenExpired){
//     try {
//       const payload = token.split('.')[1]; // JWT payload is the 2nd part
//       const decoded = atob(payload);      // base64 decode
//     } catch (error) {
//       console.error('Invalid JWT token', error);
//     }
//     notificationService.create(
//       'warning',
//       'Session Expired',
//       'You are now being redirected'
//     )
//     // await authService.logout();
//     return false;
//   }
//
//
//   return true;
// };
