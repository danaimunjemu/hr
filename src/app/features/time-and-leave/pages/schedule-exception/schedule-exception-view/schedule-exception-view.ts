import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleExceptionService } from '../../../services/schedule-exception.service';
import { ScheduleException } from '../../../models/schedule-exception.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-schedule-exception-view',
  standalone: false,
  templateUrl: './schedule-exception-view.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class ScheduleExceptionViewComponent implements OnInit {
  exception: ScheduleException | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exceptionService: ScheduleExceptionService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadException(id);
      } else {
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  loadException(id: number): void {
    this.loading = true;
    this.exceptionService.getById(id).subscribe({
      next: (data) => {
        this.exception = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error('Failed to load exception details');
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
