import { Component, OnInit } from '@angular/core';
import { WeekendRule } from '../../../models/weekend-rule.model';
import { WeekendRuleService } from '../../../services/weekend-rule.service';

@Component({
  selector: 'app-weekend-rule-list',
  standalone: false,
  templateUrl: './weekend-rule-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class WeekendRuleListComponent implements OnInit {
  loading = true;
  rules: WeekendRule[] = [];

  constructor(private weekendRuleService: WeekendRuleService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.weekendRuleService.getAll().subscribe({
      next: (data) => {
        this.rules = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load weekend rules', err);
        this.loading = false;
      }
    });
  }
}
