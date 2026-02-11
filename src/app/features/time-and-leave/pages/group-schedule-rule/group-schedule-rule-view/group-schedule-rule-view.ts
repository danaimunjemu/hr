import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupScheduleRuleService } from '../../../services/group-schedule-rule.service';
import { GroupScheduleRule } from '../../../models/group-schedule-rule.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-group-schedule-rule-view',
  standalone: false,
  templateUrl: './group-schedule-rule-view.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class GroupScheduleRuleViewComponent implements OnInit {
  rule: WritableSignal<GroupScheduleRule | null> = signal(null);
  loading: WritableSignal<boolean> = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupScheduleRuleService: GroupScheduleRuleService,
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
    this.groupScheduleRuleService.getById(id).subscribe({
      next: (data) => {
        this.rule.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.message.error('Failed to load rule details');
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}