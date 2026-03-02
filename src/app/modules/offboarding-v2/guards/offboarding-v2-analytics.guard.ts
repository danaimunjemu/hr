import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { map, take } from 'rxjs';
import { UserContextService } from '../services/user-context.service';

export const offboardingV2AnalyticsGuard: CanActivateFn = () => {
  const userContext = inject(UserContextService);
  const router = inject(Router);
  const message = inject(NzMessageService);

  return userContext.isHR$.pipe(
    take(1),
    map((isHR) => {
      if (isHR) {
        return true;
      }
      message.warning("You don't have access.");
      return router.parseUrl('/app/offboarding-v2');
    })
  );
};
