import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { finalize } from 'rxjs';
import { Appraisal } from '../../models/appraisal.model';
import { AppraisalService } from '../../services/appraisal.service';

@Component({
  selector: 'app-team-appraisal-list',
  standalone: false,
  templateUrl: './team-appraisal-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class TeamAppraisalListComponent implements OnInit {
  loading: WritableSignal<boolean> = signal(true);
  appraisals: WritableSignal<Appraisal[]> = signal([]);

  constructor(private appraisalService: AppraisalService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.appraisalService.getMyTeamAppraisals()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.appraisals.set(data),
        error: (err: any) => console.error('Failed to load team appraisals', err)
      });
  }

  getEmployeeName(appraisal: Appraisal): string {
    if (appraisal.employee?.firstName && appraisal.employee?.lastName) {
      return `${appraisal.employee.firstName} ${appraisal.employee.lastName}`;
    }
    return appraisal.employee?.employeeNumber || '-';
  }

  getManagerName(appraisal: Appraisal): string {
    if (appraisal.manager?.firstName && appraisal.manager?.lastName) {
      return `${appraisal.manager.firstName} ${appraisal.manager.lastName}`;
    }
    return appraisal.manager?.employeeNumber || '-';
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'DRAFT': 'default',
      'SUBMITTED': 'blue',
      'COMPLETED': 'green'
    };
    return statusColors[status] || 'default';
  }
}
