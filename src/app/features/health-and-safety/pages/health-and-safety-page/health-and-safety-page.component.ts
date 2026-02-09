import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-health-and-safety-page',
  standalone: false,
  templateUrl: './health-and-safety-page.component.html',
  styleUrl: './health-and-safety-page.component.scss'
})
export class HealthAndSafetyPageComponent implements OnInit {
  loading = false;
  error: string | null = null;
  
  // Sample Data
  incidents = [
    {
      date: '2026-02-04',
      type: 'Near Miss',
      location: 'Warehouse B',
      reporter: 'Alex Brown',
      severity: 'Low',
      status: 'Investigating'
    },
    {
      date: '2026-01-20',
      type: 'Injury',
      location: 'Production Line',
      reporter: 'Sarah Connor',
      severity: 'Medium',
      status: 'Resolved'
    }
  ];

  ngOnInit(): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 800);
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'High': return 'red';
      case 'Medium': return 'orange';
      case 'Low': return 'green';
      default: return 'default';
    }
  }
}
