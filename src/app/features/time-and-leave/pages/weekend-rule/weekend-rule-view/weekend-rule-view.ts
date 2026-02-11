import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WeekendRuleService } from '../../../services/weekend-rule.service';
import { WeekendRule } from '../../../models/weekend-rule.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-weekend-rule-view',
  standalone: false,
  templateUrl: './weekend-rule-view.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
    .detail-item {
      margin-bottom: 16px;
    }
  `]
})
export class WeekendRuleViewComponent implements OnInit {
  rule: WritableSignal<WeekendRule | null> = signal(null);
  loading: WritableSignal<boolean> = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private weekendRuleService: WeekendRuleService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadRule(id);
      } else {
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  loadRule(id: number): void {
    this.loading.set(true);
    this.weekendRuleService.getById(id).subscribe({
      next: (data) => {
        this.rule.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.message.error('Failed to load weekend rule details');
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}