import { Component, ElementRef, HostListener, OnInit, signal, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import Fuse from 'fuse.js';
import { AppSearchItem, APP_SEARCH_ITEMS } from '../../../../../core/constants/app-search.constants';
import { AuthService } from '../../../../../features/authentication/services/auth';
import { toTitleCase } from '../../../../../core/utils/to-title-case.util';
import { CookiesService } from '../../../../../core/storage/cookies.service';
import { getGreeting } from '../../../../../core/utils/greeting.util';
import { PortalService } from '../../../../services/portal';
import { ModeToggleService } from '../../../../../core/modules/mode/mode-toggle.service';
import { Mode } from '../../../../../core/modules/mode/mode-toggle.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'nerd-top-nav',
  standalone: false,
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.scss',
})
export class TopNav implements OnInit {
  isLoading = signal(true);
  user?: any;
  username!: any | null;

  searchTerm = '';
  searchResults: AppSearchItem[] = [];
  activeIndex = -1;
  isVisible = false;

  appSearch = APP_SEARCH_ITEMS;

  selectedPortal?: { value: string; label: string } | null;
  selectedPortalValue?: string;

  portals = [
    { value: 'HR', label: 'HR Portal' },
    { value: 'ADMINISTRATION', label: 'Administration Portal' },
    { value: 'ASSESSMENT', label: 'Assessment Portal' },
  ];

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  private fuse = new Fuse(this.appSearch, {
    keys: ['name', 'path', 'description', 'keywords'],
    threshold: 0.35,
    includeScore: true,
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private cookiesService: CookiesService,
    private portalService: PortalService,
    private modeToggleService: ModeToggleService
  ) {
    this.user = this.authService.currentUser;
    this.selectedPortal = this.portalService.getPortal();
    this.selectedPortalValue = this.portalService.getPortal()?.value;
    this.modeToggleService.modeChanged$.subscribe((mode: Mode) => {
      this.selectedMode = mode;
    });
  }

  ngOnInit(): void {
    void this.cookiesService;
    const userStr = localStorage.getItem('user');
    this.username = userStr ? JSON.parse(userStr) : null;

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateMenu(event.urlAfterRedirects);
      });

    // Initial check for current route on page load
    this.updateMenu(this.router.url);
  }

  menuItems: { label: string; link: string }[] = [];
  pageTitle: string = '';

  private menuMapping: { [key: string]: { title: string; items: { label: string; link: string }[] } } = {
    'dashboard': {
      title: 'Dashboard',
      items: [{ label: 'Main', link: '/app/dashboard/dashboard' }]
    },
    'employees': {
      title: 'Employees',
      items: [
        { label: 'All Employees', link: '/app/employees' },
        { label: 'New Employee', link: '/app/employees/new' }
      ]
    },
    'time-and-leave': {
      title: 'Time and Leave Setup',
      items: [
        { label: 'Work Contract', link: '/app/time-and-leave/work-contract' },
        { label: 'Schedule Rule', link: '/app/time-and-leave/work-schedule-rule' },
        { label: 'Shift Definition', link: '/app/time-and-leave/shift-definition' },
        { label: 'Shift Assignment', link: '/app/time-and-leave/shift-assignment' },
        { label: 'Overtime Rule', link: '/app/time-and-leave/overtime-rule' },
        { label: 'Holiday Calendar', link: '/app/time-and-leave/holiday-calendar' }
      ]
    },
    'performance': {
      title: 'Performance',
      items: [
        { label: 'Cycle', link: '/app/performance/performance-cycle' },
        { label: 'Goal Template', link: '/app/performance/goal-template' },
        { label: 'Goal Settings', link: '/app/performance/goal-settings' },
        { label: 'Review 360', link: '/app/performance/review-360-setup' }
      ]
    },
    'settings': {
      title: 'Settings',
      items: [
        { label: 'Companies', link: '/app/settings/companies' },
        { label: 'Cost Centers', link: '/app/settings/cost-centers' },
        { label: 'Employee Groups', link: '/app/settings/employee-groups' },
        { label: 'Sub Groups', link: '/app/settings/employee-sub-groups' },
        { label: 'Ethnic Groups', link: '/app/settings/ethnic-groups' },
        { label: 'Grades', link: '/app/settings/grades' }
      ]
    },
    'onboarding': {
      title: 'Onboarding',
      items: [{ label: 'Onboarding', link: '/app/onboarding' }]
    },
    'recruitment': {
      title: 'Recruitment',
      items: [{ label: 'Recruitment', link: '/app/recruitment' }]
    },
    'reports': {
      title: 'Reports',
      items: [{ label: 'Reports', link: '/app/reports' }]
    },
    'time-and-leave-user': {
      title: 'Time and Leave',
      items: [
        { label: 'Timesheet', link: '/app/time-and-leave-user/timesheet-submission' },
        { label: 'Leave Requests', link: '/app/time-and-leave-user/leave-requests' },
        { label: 'Reports', link: '/app/time-and-leave-user/reports' }
      ]
    }
  };

  updateMenu(url: string) {
    const segments = url.split('/').filter(s => s);
    const parentSegment = segments[0] === 'app' ? segments[1] : segments[0];

    const mapping = this.menuMapping[parentSegment] || { title: 'Home', items: [] };
    this.pageTitle = mapping.title;
    this.menuItems = mapping.items.slice(0, 6);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    const isOpenSearchShortcut =
      (event.ctrlKey || event.metaKey) &&
      ['f', 'k'].includes(event.key.toLowerCase());

    if (isOpenSearchShortcut) {
      event.preventDefault();
      if (!this.isVisible) {
        this.showModal();
      }
      return;
    }

    if (!this.isVisible) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.handleCancel();
      return;
    }

    if (!this.searchResults.length) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = (this.activeIndex + 1) % this.searchResults.length;
        this.scrollToActive();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = (this.activeIndex - 1 + this.searchResults.length) % this.searchResults.length;
        this.scrollToActive();
        break;
      case 'Enter':
        if (this.activeIndex >= 0) {
          event.preventDefault();
          const selected = this.searchResults[this.activeIndex];
          if (selected) {
            this.navigate(selected.path);
          }
        }
        break;
      default:
        break;
    }
  }

  onPortalChangeByValue(value: string): void {
    const portal = this.portals.find((p) => p.value === value);
    if (portal) {
      this.portalService.setPortal(portal);
    }
  }

  terms(): void {
    this.router.navigateByUrl('/terms');
  }

  privacyPolicy(): void {
    this.router.navigateByUrl('/privacy');
  }

  showModal(): void {
    this.isVisible = true;
    setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
  }

  handleCancel(): void {
    this.isVisible = false;
    this.searchTerm = '';
    this.searchResults = [];
    this.activeIndex = -1;
  }

  partOptions = [
    { value: 'light', icon: 'sun' },
    { value: 'dark', icon: 'moon' }
  ];

  selectedMode?: any;


  selectMode(mode: any) {
    console.log("selected mode", mode)
    this.modeToggleService.changeMode(mode);
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.activeIndex = -1;

    if (!term.trim()) {
      this.searchResults = [];
      return;
    }

    this.searchResults = this.fuse.search(term).map((result) => result.item);
  }

  navigate(path: string): void {
    this.router.navigateByUrl(path);
    this.handleCancel();
  }

  private scrollToActive(): void {
    const activeEl = document.querySelector('.search-results li.active');
    activeEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }

  protected readonly toTitleCase = toTitleCase;
  protected readonly getGreeting = getGreeting;
}
