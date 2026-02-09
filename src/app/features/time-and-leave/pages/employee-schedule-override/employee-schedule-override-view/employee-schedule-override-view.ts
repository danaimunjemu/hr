import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeScheduleOverrideService } from '../../../services/employee-schedule-override.service';
import { EmployeeScheduleOverride } from '../../../models/employee-schedule-override.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-employee-schedule-override-view',
  standalone: false,
  templateUrl: './employee-schedule-override-view.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class EmployeeScheduleOverrideViewComponent implements OnInit {
  override: EmployeeScheduleOverride | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private overrideService: EmployeeScheduleOverrideService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadOverride(id);
      } else {
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  loadOverride(id: number): void {
    this.loading = true;
    this.overrideService.getById(id).subscribe({
      next: (data) => {
        this.override = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error('Failed to load override details');
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
