import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PerformanceGoalTemplate } from '../../../models/performance-goal-template.model';
import { PerformanceGoalTemplateService } from '../../../services/performance-goal-template.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-performance-goal-template-list',
  standalone: false,
  templateUrl: './performance-goal-template-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class PerformanceGoalTemplateListComponent implements OnInit {
  loading: WritableSignal<boolean> = signal(true);
  templates: WritableSignal<PerformanceGoalTemplate[]> = signal([]);

  constructor(
    private performanceGoalTemplateService: PerformanceGoalTemplateService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.performanceGoalTemplateService.getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.templates.set(data),
        error: (err: any) => console.error('Failed to load performance goal templates', err)
      });
  }

  goToItems(template: PerformanceGoalTemplate): void {
    if (template.locked) {
      this.message.error('Goal template locked');
      return;
    }
    this.router.navigate(['/app/performance/goal-template-items', template.id]);
  }
}
