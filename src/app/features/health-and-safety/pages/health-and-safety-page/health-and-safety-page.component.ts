import { Component, OnInit } from '@angular/core';
import { OhsService } from '../../services/ohs.service';
import { SafetyIncident } from '../../models/ohs.model';

@Component({
  selector: 'app-health-and-safety-page',
  standalone: false,
  templateUrl: './health-and-safety-page.component.html',
  styleUrl: './health-and-safety-page.component.scss'
})
export class HealthAndSafetyPageComponent implements OnInit {
  loading = false;
  error: string | null = null;
  incidents: SafetyIncident[] = [];

  constructor(private ohsService: OhsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.ohsService.getSafetyIncidents().subscribe({
      next: (data) => {
        this.incidents = data.slice(0, 5); // Show last 5
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'gold';
      default: return 'green';
    }
  }
}
