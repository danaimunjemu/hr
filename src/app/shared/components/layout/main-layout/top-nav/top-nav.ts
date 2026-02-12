import { Component, ElementRef, HostListener, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import Fuse from 'fuse.js';
import { AppSearchItem, APP_SEARCH_ITEMS } from '../../../../../core/constants/app-search.constants';
import { AuthService } from '../../../../../features/authentication/services/auth';
import { toTitleCase } from '../../../../../core/utils/to-title-case.util';
import { CookiesService } from '../../../../../core/storage/cookies.service';
import { getGreeting } from '../../../../../core/utils/greeting.util';
import { PortalService } from '../../../../services/portal';

@Component({
  selector: 'nerd-top-nav',
  standalone: false,
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.scss',
})
export class TopNav implements OnInit {
  isLoading = signal(true);
  user?: any;

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
    private portalService: PortalService
  ) {
    this.user = this.authService.currentUser;
    this.selectedPortal = this.portalService.getPortal();
    this.selectedPortalValue = this.portalService.getPortal()?.value;
  }

  ngOnInit(): void {
    void this.cookiesService;
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
