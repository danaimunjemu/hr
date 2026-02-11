import { Component, inject, computed, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { ShiftDefinition } from '../../../models/shift-definition.model';
import { ShiftDefinitionService } from '../../../services/shift-definition.service';

@Component({
  selector: 'app-shift-definition-list',
  standalone: false,
  templateUrl: './shift-definition-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class ShiftDefinitionListComponent {
  private service = inject(ShiftDefinitionService);

  private state = toSignal(
    this.service.getAll().pipe(
      map(data => ({ loading: false, data, error: null })),
      startWith({ loading: true, data: [] as ShiftDefinition[], error: null }),
      catchError(err => {
        console.error('Failed to load shift definitions', err);
        return of({ loading: false, data: [] as ShiftDefinition[], error: err });
      })
    ),
    { initialValue: { loading: true, data: [] as ShiftDefinition[], error: null } }
  );

  shifts = computed(() => this.state().data);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
}