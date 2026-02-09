import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { WorkScheduleRule, WorkScheduleRulesService } from '../../services/work-schedule-rules.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-work-schedule-rules',
  standalone: false,
  templateUrl: './all-work-schedule-rules.html',
  styleUrl: './all-work-schedule-rules.scss'
})
export class AllWorkScheduleRules implements OnInit {
  items: WritableSignal<WorkScheduleRule[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(private service: WorkScheduleRulesService) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loading.set(true);
    this.service.getAll().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: data => this.items.set(data),
      error: err => this.error.set(err.message)
    });
  }
}
