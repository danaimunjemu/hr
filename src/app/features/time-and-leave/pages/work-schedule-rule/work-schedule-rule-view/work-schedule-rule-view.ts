import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkScheduleRuleService } from '../../../services/work-schedule-rule.service';
import { WorkScheduleRule } from '../../../models/work-schedule-rule.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-work-schedule-rule-view',
  standalone: false,
  templateUrl: './work-schedule-rule-view.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class WorkScheduleRuleViewComponent implements OnInit {
  rule: WritableSignal<WorkScheduleRule | null> = signal(null);
  loading: WritableSignal<boolean> = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workScheduleRuleService: WorkScheduleRuleService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadRule(id);
      } else {
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  loadRule(id: number): void {
    this.loading.set(true);
    this.workScheduleRuleService.getById(id).subscribe({
      next: (data) => {
        this.rule.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.message.error('Failed to load schedule rule details');
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}