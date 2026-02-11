import { Component, OnInit, signal, WritableSignal } from '@angular/core';
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
  loading: WritableSignal<boolean> = signal(true);
  rules: WritableSignal<OvertimeRule[]> = signal([]);

  constructor(private ruleService: OvertimeRuleService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.ruleService.getAll().subscribe({
      next: (data) => {
        this.rules.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load overtime rules', err);
        this.loading.set(false);
      }
    });
  }
}