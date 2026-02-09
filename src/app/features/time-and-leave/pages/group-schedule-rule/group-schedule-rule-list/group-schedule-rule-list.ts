import { Component, OnInit } from '@angular/core';
import { GroupScheduleRule } from '../../../models/group-schedule-rule.model';
import { GroupScheduleRuleService } from '../../../services/group-schedule-rule.service';

@Component({
  selector: 'app-group-schedule-rule-list',
  standalone: false,
  templateUrl: './group-schedule-rule-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class GroupScheduleRuleListComponent implements OnInit {
  loading = true;
  rules: GroupScheduleRule[] = [];

  constructor(private groupScheduleRuleService: GroupScheduleRuleService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.groupScheduleRuleService.getAll().subscribe({
      next: (data) => {
        this.rules = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load group schedule rules', err);
        this.loading = false;
      }
    });
  }
}
