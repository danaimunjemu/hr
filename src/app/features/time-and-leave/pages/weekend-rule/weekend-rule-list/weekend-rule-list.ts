import { Component, inject, computed, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
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
export class WeekendRuleListComponent {
  private service = inject(WeekendRuleService);

  private state = toSignal(
    this.service.getAll().pipe(
      map(data => ({ loading: false, data, error: null })),
      startWith({ loading: true, data: [] as WeekendRule[], error: null }),
      catchError(err => {
        console.error('Failed to load weekend rules', err);
        return of({ loading: false, data: [] as WeekendRule[], error: err });
      })
    ),
    { initialValue: { loading: true, data: [] as WeekendRule[], error: null } }
  );

  rules = computed(() => this.state().data);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
}