import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-onboarding-page',
  standalone: false,
  templateUrl: './onboarding-page.component.html',
  styleUrl: './onboarding-page.component.scss'
})
export class OnboardingPageComponent implements OnInit {
  loading = false;
  error: string | null = null;
  
  // Sample Data
  onboardingList = [
    {
      name: 'Michael Scott',
      position: 'Regional Manager',
      department: 'Sales',
      startDate: '2026-03-01',
      progress: 25
    },
    {
      name: 'Jim Halpert',
      position: 'Sales Representative',
      department: 'Sales',
      startDate: '2026-02-15',
      progress: 60
    },
    {
      name: 'Pam Beesly',
      position: 'Receptionist',
      department: 'Admin',
      startDate: '2026-02-10',
      progress: 90
    }
  ];

  constructor(private msg: NzMessageService) {}

  ngOnInit(): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  completeTask(): void {
    this.msg.success('Task marked as complete');
  }
}
