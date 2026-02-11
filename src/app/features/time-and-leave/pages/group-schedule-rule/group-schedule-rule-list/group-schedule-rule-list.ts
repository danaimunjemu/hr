import { Component, OnInit, signal, WritableSignal } from '@angular/core';
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
  loading: WritableSignal<boolean> = signal(true);
  rules: WritableSignal<GroupScheduleRule[]> = signal([]);

  constructor(private groupScheduleRuleService: GroupScheduleRuleService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.groupScheduleRuleService.getAll().subscribe({
      next: (data) => {
        this.rules.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load group schedule rules', err);
        this.loading.set(false);
      }
    });
  }
}