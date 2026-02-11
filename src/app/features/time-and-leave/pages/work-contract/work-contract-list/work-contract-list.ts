import { Component, inject, computed, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { WorkContract } from '../../../models/work-contract.model';
import { WorkContractService } from '../../../services/work-contract.service';

@Component({
  selector: 'app-work-contract-list',
  standalone: false,
  templateUrl: './work-contract-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class WorkContractListComponent {
  private service = inject(WorkContractService);

  // Reactive state using toSignal
  private state = toSignal(
    this.service.getAll().pipe(
      map(data => ({ loading: false, data, error: null })),
      startWith({ loading: true, data: [] as WorkContract[], error: null }),
      catchError(err => {
        console.error('Failed to load work contracts', err);
        return of({ loading: false, data: [] as WorkContract[], error: err });
      })
    ),
    { initialValue: { loading: true, data: [] as WorkContract[], error: null } }
  );

  // Computed signals for template binding
  contracts = computed(() => this.state().data);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
}