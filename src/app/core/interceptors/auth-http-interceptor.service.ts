// import { inject } from '@angular/core';
// import {
//   HttpInterceptorFn,
//   HttpRequest,
//   HttpHandlerFn,
//   HttpErrorResponse,
// } from '@angular/common/http';
// // import { AuthService } from '../../features/authentication/services/auth.service';
// import { Router } from '@angular/router';
// import { catchError, switchMap, throwError, from, map } from 'rxjs';
//
// /**
//  * Functional interceptor that attaches the Bearer token to every request
//  */
// export const AuthHttpInterceptor: HttpInterceptorFn = (req, next) => {
//   // const authService = inject(AuthService);
//   const router = inject(Router);
//
//   return from(createAuthEvent(req, authService)).pipe(
//     switchMap((newReq) =>
//       next(newReq).pipe(
//         map((res) => res),
//         catchError((error: HttpErrorResponse) => {
//           let errorMsg = '';
//
//           if (error.error instanceof ErrorEvent) {
//             errorMsg = `Client side Error: ${error.error.message}`;
//           } else {
//             errorMsg = `API Error Code: ${error.status}, Message: ${error.message}`;
//
//             // Redirect to login if unauthorized or forbidden
//             if (error.status === 401 || error.status === 403) {
//               router.navigateByUrl('/auth');
//             }
//           }
//
//           console.error(errorMsg);
//           return throwError(() => error);
//         })
//       )
//     )
//   );
// };
//
// /**
//  * Adds authentication headers to outgoing requests
//  */
// async function createAuthEvent(
//   request: HttpRequest<any>,
//   authService: AuthService
// ): Promise<HttpRequest<any>> {
//   const user = authService.user?.value;
//   const token = authService.token?.value;
//   const userId = user?.id;
//
//   // Skip if user not logged in or request is for auth endpoints
//   if (!userId || request.url.includes('auth/')) {
//     return request;
//   }
//
//   // ✅ Clone the request with headers
//   return request.clone({
//     setHeaders: {
//       userId: `${userId}`,
//       email: `${user?.person.email}`,
//       clientId: `${user?.clientId}`,
//       Authorization: `Bearer ${token}`,
//     },
//   });
// }
