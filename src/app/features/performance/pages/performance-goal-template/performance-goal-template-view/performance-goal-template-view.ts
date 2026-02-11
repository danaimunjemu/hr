import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PerformanceGoalTemplateService } from '../../../services/performance-goal-template.service';
import { PerformanceGoalTemplate } from '../../../models/performance-goal-template.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-performance-goal-template-view',
  standalone: false,
  templateUrl: './performance-goal-template-view.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class PerformanceGoalTemplateViewComponent implements OnInit {
  template: WritableSignal<PerformanceGoalTemplate | null> = signal(null);
  loading: WritableSignal<boolean> = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private performanceGoalTemplateService: PerformanceGoalTemplateService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadTemplate(id);
      } else {
        this.router.navigate(['/app/performance/goal-template']);
      }
    });
  }

  loadTemplate(id: number): void {
    this.loading.set(true);
    this.performanceGoalTemplateService.getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          const found = data.find(t => t.id === id) || null;
          if (!found) {
            this.message.error('Goal template not found');
            this.router.navigate(['/app/performance/goal-template']);
            return;
          }
          this.template.set(found);
        },
        error: (err: any) => {
          this.message.error('Failed to load performance goal template details');
          this.router.navigate(['/app/performance/goal-template']);
        }
      });
  }

  onBack(): void {
    this.router.navigate(['/app/performance/goal-template']);
  }
}
