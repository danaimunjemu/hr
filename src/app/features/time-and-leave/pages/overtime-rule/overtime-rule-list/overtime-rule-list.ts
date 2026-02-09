import { Component, OnInit } from '@angular/core';
import { OvertimeRule } from '../../../models/overtime-rule.model';
import { OvertimeRuleService } from '../../../services/overtime-rule.service';

@Component({
  selector: 'app-overtime-rule-list',
  standalone: false,
  templateUrl: './overtime-rule-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class OvertimeRuleListComponent implements OnInit {
  loading = true;
  rules: OvertimeRule[] = [];

  constructor(private ruleService: OvertimeRuleService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.ruleService.getAll().subscribe({
      next: (data) => {
        this.rules = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load overtime rules', err);
        this.loading = false;
      }
    });
  }
}
