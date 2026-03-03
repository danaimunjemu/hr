import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../authentication/services/auth';

interface ProfileSection {
  id: string;
  title: string;
  icon: string;
}

@Component({
  selector: 'app-profile-user',
  standalone: false,
  templateUrl: './profile-user.component.html',
  styleUrl: './profile-user.component.scss'
})
export class ProfileUserComponent implements OnInit {
  activeSection = 'identity';
  user: any = null;
  employee: any = null;

  readonly sections: ProfileSection[] = [
    { id: 'identity', title: 'Identity', icon: 'idcard' },
    { id: 'contacts', title: 'Contacts', icon: 'phone' },
    { id: 'employment', title: 'Employment', icon: 'solution' },
    { id: 'reporting', title: 'Reporting', icon: 'team' },
    { id: 'organization', title: 'Organization', icon: 'bank' },
    { id: 'work', title: 'Work Rule', icon: 'clock-circle' },
    { id: 'security', title: 'Security', icon: 'safety-certificate' }
  ];

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    const authUser = this.resolveUser(this.authService.currentUser());
    const storedUser = this.resolveStoredUser();
    this.user = authUser || storedUser;
    this.employee = this.user?.employee || null;
  }

  selectSection(id: string): void {
    this.activeSection = id;
  }

  fullName(): string {
    const first = this.valueOrDash(this.employee?.firstName, '');
    const last = this.valueOrDash(this.employee?.lastName, '');
    const full = `${first} ${last}`.trim();
    return full || this.valueOrDash(this.user?.username);
  }

  initials(): string {
    const first = String(this.employee?.firstName || '').trim().charAt(0);
    const last = String(this.employee?.lastName || '').trim().charAt(0);
    const initials = `${first}${last}`.toUpperCase();
    return initials || 'NA';
  }

  valueOrDash(value: unknown, fallback = '-'): string {
    const text = String(value ?? '').trim();
    return text || fallback;
  }

  dateOrDash(value: unknown): string {
    const text = String(value ?? '').trim();
    if (!text) {
      return '-';
    }
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? text : date.toLocaleDateString();
  }

  private resolveStoredUser(): any {
    const raw = localStorage.getItem('user');
    if (!raw) {
      return null;
    }
    try {
      return this.resolveUser(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  private resolveUser(payload: any): any {
    if (!payload) {
      return null;
    }
    if (payload.user) {
      return payload.user;
    }
    return payload;
  }
}

