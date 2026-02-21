import {Injectable, OnDestroy} from '@angular/core';
import { Router, NavigationEnd, Navigation } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NavigationService implements OnDestroy{
  private lastUrl: string = '/';
  private subscription: Subscription;

  constructor(private router: Router) {
    this.subscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd) // Type guard for NavigationEnd
    ).subscribe((event: NavigationEnd) => {
      this.lastUrl = event.urlAfterRedirects;
    });

  }

  getLastUrl(): string {
    return this.lastUrl;
  }

  // Clean up the subscription if needed
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

