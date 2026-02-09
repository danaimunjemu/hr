import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-recruitment-page',
  standalone: false,
  templateUrl: './recruitment-page.component.html',
  styleUrl: './recruitment-page.component.scss'
})
export class RecruitmentPageComponent implements OnInit {
  loading = false;
  error: string | null = null;
  
  // Sample Data
  jobs = [
    {
      id: 1,
      title: 'Senior Frontend Engineer',
      location: 'Remote',
      type: 'Full-time',
      applicants: 45,
      interviews: 8
    },
    {
      id: 2,
      title: 'Product Designer',
      location: 'New York',
      type: 'Contract',
      applicants: 28,
      interviews: 4
    },
    {
      id: 3,
      title: 'Marketing Manager',
      location: 'London',
      type: 'Full-time',
      applicants: 62,
      interviews: 12
    }
  ];

  candidates = [
    {
      name: 'Alice Cooper',
      position: 'Senior Frontend Engineer',
      status: 'Interview',
      appliedDate: '2 hours ago',
      avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
    },
    {
      name: 'Bob Marley',
      position: 'Product Designer',
      status: 'Review',
      appliedDate: '5 hours ago',
      avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
    }
  ];

  ngOnInit(): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  viewApplicants(id: number): void {
    console.log('View applicants for job', id);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'New': return 'blue';
      case 'Review': return 'orange';
      case 'Interview': return 'purple';
      case 'Offer': return 'green';
      case 'Rejected': return 'red';
      default: return 'default';
    }
  }
}
