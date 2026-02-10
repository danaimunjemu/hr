import {Component, ElementRef, HostListener, OnInit, signal, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {APP_SEARCH_ITEMS} from '../../../../../core/constants/app-search.constants';
import Fuse from 'fuse.js';
import {AuthService} from '../../../../../features/authentication/services/auth';
import {toTitleCase} from '../../../../../core/utils/to-title-case.util';
import { CookiesService } from '../../../../../core/storage/cookies.service';
import { getGreeting } from '../../../../../core/utils/greeting.util';
import { PortalService } from '../../../../services/portal';

@Component({
  selector: 'nerd-top-nav',
  standalone: false,
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.scss',
})
export class TopNav implements OnInit{

  user!: any | null;
  isLoading = signal(true);




  constructor(
    private router: Router,
    private authService: AuthService,
    private cookiesService: CookiesService,
    private portalService: PortalService
  ) {
    this.selectedPortal = this.portalService.getPortal();
    this.selectedPortalValue = this.portalService.getPortal()?.value;
    console.log("This selected portal: ", this.selectedPortal);
   }

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    this.user = userStr ? JSON.parse(userStr) : null;
    console.log("This user: ", this.user);
  }

  onPortalChangeByValue(value: string) {
    console.log("This value: ", value);
    const portal = this.portals.find(p => p.value === value);
    if (portal) this.portalService.setPortal(portal);
  }

  terms() {
    this.router.navigateByUrl('/terms');
  }
  privacyPolicy() {
    this.router.navigateByUrl('/privacy');
  }

  searchTerm = '';
  searchResults: any[] = [];
  activeIndex = -1; // currently highlighted item

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;


  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    // 🔍 Detect Ctrl + F — open the search modal
    if (event.ctrlKey && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      console.log('Pressed');
      if (!this.isVisible) {
        this.showModal();
      }
      return; // ✅ stop further key handling when opening search
    }

    // ⬇️⬆️ Handle navigation only if search results are shown
    if (!this.searchResults.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = (this.activeIndex + 1) % this.searchResults.length;
        this.scrollToActive();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex =
          (this.activeIndex - 1 + this.searchResults.length) %
          this.searchResults.length;
        this.scrollToActive();
        break;

      case 'Enter':
        if (this.activeIndex >= 0) {
          event.preventDefault();
          const selected = this.searchResults[this.activeIndex];
          if (selected) this.navigate(selected.path);
        }
        break;
    }
  }

  appSearch = APP_SEARCH_ITEMS; //


  private scrollToActive(): void {
    const activeEl = document.querySelector('.search-results li.active');
    activeEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  formatPathToTitle(path: string): string {
    if (!path) return '';

    return path
      .split('/')                  // split into parts
      .filter(Boolean)             // remove empty ones
      .map(p => p.toUpperCase())   // make each uppercase
      .join(' › ');                // join with arrow
  }



  isVisible = false;

  showModal(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    this.searchTerm = '';
    this.searchResults = [];
  }

  private fuse = new Fuse(this.appSearch, {
    keys: ['name'],
    threshold: 0.4, // lower = more strict, higher = more fuzzy
    includeScore: true
  });

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.activeIndex = -1; // reset selection

    if (!term.trim()) {
      this.searchResults = [];
      return;
    }

    const results = this.fuse.search(term);
    this.searchResults = results.map(r => r.item);
  }

  navigate(path: string): void {
    this.router.navigateByUrl(path);
    this.searchResults = [];
    this.searchTerm = '';
    this.activeIndex = -1;
  }

  async logout() {
    await this.authService.logout();
  }

  protected readonly toTitleCase = toTitleCase;

  protected readonly getGreeting = getGreeting;

  selectedPortal?: { value: string; label: string } | null;
  selectedPortalValue?: string;

  portals = [
    { value: 'HR', label: 'HR Portal' },
    { value: 'ADMINISTRATION', label: 'Administration Portal' },
    { value: 'ASSESSMENT', label: 'Assessment Portal' },
  ];


}
