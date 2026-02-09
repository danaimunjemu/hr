import { Component, OnInit } from '@angular/core';
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
  rule: GroupScheduleRule | null = null;
  loading = true;

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
    this.loading = true;
    this.groupScheduleRuleService.getById(id).subscribe({
      next: (data) => {
        this.rule = data;
        this.loading = false;
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
