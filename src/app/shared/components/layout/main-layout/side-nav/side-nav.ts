import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {filter, Subscription} from 'rxjs';
import {NavigationEnd, Router} from '@angular/router';
import {ModeToggleService} from '../../../../../core/modules/mode/mode-toggle.service';
import {AuthService} from '../../../../../features/authentication/services/auth';
import {Mode} from '../../../../../core/modules/mode/mode-toggle.model';
import {CookiesService} from '../../../../../core/storage/cookies.service';

@Component({
  selector: 'nerd-side-nav',
  standalone: false,
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.scss',
})
export class SideNav implements OnInit, OnDestroy {

  isCollapsed = false;
  private manualOverride: boolean | null = null;
  private subs = new Subscription();
  user!: any | null;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modeToggleService: ModeToggleService,
    private authService: AuthService,
    private cookiesService: CookiesService,
  ) {
    this.modeToggleService.modeChanged$.subscribe((mode: Mode) => {
      this.selectedMode = mode;
    });
  }

  ngOnInit(): void {
    this.user = this.cookiesService.getCookie('user');
    console.log("This user: ", this.user);
    // this.initializeMode();
    // Reapply user override on navigation
    const navSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        // Only reapply if user has overridden breakpoint collapse
        if (this.manualOverride !== null) {
          setTimeout(() => {
            this.isCollapsed = this.manualOverride!;
            this.cdr.detectChanges();
          }, 40);
        }
      });

    this.subs.add(navSub);
  }

  async logout() {
    await this.authService.logout();
  }

  initializeMode(){
    this.selectedMode = this.modeToggleService.getMode();
  }

  navigate(page: string) {
    this.router.navigateByUrl(page)
  }

  /**
   * Triggered whenever nzCollapsed changes (either from breakpoint or manual)
   */
  onCollapsedChange(value: boolean) {
    // Detect whether this change came from user action or breakpoint
    const width = window.innerWidth;
    const breakpoint = 992; // 'lg' = 992px in Ant Design

    if (width < breakpoint) {
      // If below breakpoint, assume user clicked the toggle manually
      this.manualOverride = value;
    } else {
      // Above breakpoint, reset manual override
      this.manualOverride = null;
    }

    this.isCollapsed = value;
  }

  /**
   * Reset manual override if window resizes beyond breakpoint
   */
  @HostListener('window:resize')
  onResize() {
    const width = window.innerWidth;
    const breakpoint = 992;

    // If user goes back above breakpoint, forget the override
    if (width >= breakpoint && this.manualOverride !== null) {
      this.manualOverride = null;
    }
  }

  fullOptions = [
    { label: 'Light', value: 'light', icon: 'sun' },
    { label: 'Dark', value: 'dark', icon: 'moon' }
  ];

  partOptions = [
    { value: 'light', icon: 'sun' },
    { value: 'dark', icon: 'moon' }
  ];

  selectedMode?: any;


  selectMode(mode: any) {
    console.log("selected mode", mode)
    this.modeToggleService.changeMode(mode);
  }


  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}

