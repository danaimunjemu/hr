import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-employee-relations-page',
  standalone: false,
  templateUrl: './employee-relations-page.component.html',
  styleUrl: './employee-relations-page.component.scss'
})
export class EmployeeRelationsPageComponent implements OnInit {
  loading = false;
  error: string | null = null;
  
  // Sample Data - Replace with API call
  listOfData = [
    {
      id: 'ER-2026-001',
      employee: 'John Doe',
      issue: 'Grievance',
      status: 'In Progress',
      date: '2026-02-01'
    },
    {
      id: 'ER-2026-002',
      employee: 'Jane Smith',
      issue: 'Disciplinary',
      status: 'Closed',
      date: '2026-01-28'
    },
    {
      id: 'ER-2026-003',
      employee: 'Mike Johnson',
      issue: 'Performance',
      status: 'Pending',
      date: '2026-02-05'
    }
  ];

  ngOnInit(): void {
    // Simulate API call
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Closed': return 'success';
      case 'In Progress': return 'processing';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  }
}
