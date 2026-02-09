import { Component, OnInit } from '@angular/core';
import { WorkScheduleRule } from '../../../models/work-schedule-rule.model';
import { WorkScheduleRuleService } from '../../../services/work-schedule-rule.service';

@Component({
  selector: 'app-work-schedule-rule-list',
  standalone: false,
  templateUrl: './work-schedule-rule-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class WorkScheduleRuleListComponent implements OnInit {
  loading = true;
  rules: WorkScheduleRule[] = [];

  constructor(private workScheduleRuleService: WorkScheduleRuleService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.workScheduleRuleService.getAll().subscribe({
      next: (data) => {
        this.rules = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load work schedule rules', err);
        this.loading = false;
      }
    });
  }
}
