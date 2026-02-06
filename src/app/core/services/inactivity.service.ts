import { Injectable, NgZone } from '@angular/core';
// import { AuthService } from '../../features/authentication/services/auth.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InactivityService {
  // config (adjust for production)
  private warningDelayMs = 10 * 60 * 1000;   // show modal after 1 minute (test)
  private countdownInitial = 60;            // show 60s countdown (test)

  // timers
  private inactivityTimer: any = null;
  private countdownTimer: any = null;

  // public observables for App to subscribe to
  public showWarning$ = new BehaviorSubject<boolean>(false);
  public countdown$ = new BehaviorSubject<number>(0);

  // internal
  private running = false;
  private boundActivityHandler = (e?: Event) => this.onActivity(e);

  constructor(
    private ngZone: NgZone,
    // private auth: AuthService
  ) {}

  // start listening (call when user logs in)
  start() {
    if (this.running) {
      // console.log('[Inactivity] start() already running');
      return;
    }
    this.running = true;
    // console.log('[Inactivity] start() — installing listeners and scheduling warning');
    this.addActivityListeners();
    this.resetInactivityTimer();
  }

  // stop everything (call when user logs out)
  stop() {
    // console.log('[Inactivity] stop() — clearing timers & removing listeners');
    this.running = false;
    this.clearInactivityTimer();
    this.clearCountdownTimer();
    this.removeActivityListeners();
    this.showWarning$.next(false);
    this.countdown$.next(0);
  }

  // attach listeners
  private addActivityListeners() {
    ['click','mousemove','keydown','scroll','touchstart']
      .forEach(ev => window.addEventListener(ev, this.boundActivityHandler, { passive: true }));
    // console.log('[Inactivity] activity listeners added');
  }

  private removeActivityListeners() {
    ['click','mousemove','keydown','scroll','touchstart']
      .forEach(ev => window.removeEventListener(ev, this.boundActivityHandler));
    // console.log('[Inactivity] activity listeners removed');
  }

  // activity handler
  private onActivity(evt?: Event) {
    if (!this.running) return;
    // console.log('[Inactivity] activity detected', evt?.type ?? 'manual');
    // If warning modal is open, close it and reset timers
    if (this.showWarning$.value) {
      // console.log('[Inactivity] activity while modal open — closing modal and resetting timers');
      this.closeModal();
    } else {
      // just reset inactivity timer
      this.resetInactivityTimer();
    }
  }

  // schedule modal warning
  private resetInactivityTimer() {
    if (!this.running) {
      // console.log('[Inactivity] resetInactivityTimer() called but not running — ignored');
      return;
    }

    this.clearInactivityTimer();
    // console.log('[Inactivity] scheduling warning in', this.warningDelayMs, 'ms');

    this.ngZone.runOutsideAngular(() => {
      this.inactivityTimer = setTimeout(() => {
        // re-enter zone to update subjects (ensures CD)
        this.ngZone.run(() => {
          // console.log('[Inactivity] inactivityTimer fired -> opening modal');
          this.openModal();
        });
      }, this.warningDelayMs);
    });
  }

  private clearInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
      // console.log('[Inactivity] cleared inactivityTimer');
    }
  }

  // open modal (expose via subject)
  private openModal() {
    if (!this.running) {
      // console.log('[Inactivity] openModal() called but service not running — abort');
      return;
    }

    // console.log('[Inactivity] openModal(): setting showWarning=true and starting countdown');
    this.showWarning$.next(true);
    this.countdown$.next(this.countdownInitial);
    this.startCountdown();
  }

  // close modal (user stayed active)
  public closeModal() {
    // console.log('[Inactivity] closeModal() called — hiding modal and resetting inactivity timer');
    this.clearCountdownTimer();
    this.showWarning$.next(false);
    this.countdown$.next(0);
    // reset the inactivity timer so user gets a fresh period
    this.resetInactivityTimer();
  }

  // countdown logic
  private startCountdown() {
    this.clearCountdownTimer();

    // console.log('[Inactivity] startCountdown() starting interval');
    this.ngZone.runOutsideAngular(() => {
      this.countdownTimer = setInterval(() => {
        this.ngZone.run(() => {
          const next = Math.max(0, this.countdown$.value - 1);
          this.countdown$.next(next);
          // console.log('[Inactivity] countdown tick ->', next);
          if (next <= 0) {
            // console.log('[Inactivity] countdown reached 0 -> calling logout()');
            this.logout();
          }
        });
      }, 1000);
    });
  }

  private clearCountdownTimer() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
      // console.log('[Inactivity] cleared countdownTimer');
    }
  }

  // perform logout
  public async logout() {
    // console.log('[Inactivity] logout() -> performing auth logout');
    this.clearCountdownTimer();
    this.clearInactivityTimer();
    this.showWarning$.next(false);
    this.countdown$.next(0);

    try {
      // await this.auth.logout();
    } catch (err) {
      // console.error('[Inactivity] logout error', err);
    } finally {
      this.stop();
    }
  }

  // helper for template to format seconds -> m:ss
  public formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' + s : s}`;
  }
}
