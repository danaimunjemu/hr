import { Component, inject, computed, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShiftDefinitionService } from '../../../services/shift-definition.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap, startWith, catchError, of } from 'rxjs';
import { ShiftDefinition } from '../../../models/shift-definition.model';

@Component({
  selector: 'app-shift-definition-view',
  standalone: false,
  templateUrl: './shift-definition-view.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class ShiftDefinitionViewComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ShiftDefinitionService);
  private message = inject(NzMessageService);

  private state = toSignal(
    this.route.params.pipe(
      map(p => p['id']),
      filter(id => !!id),
      switchMap(id => this.service.getById(+id).pipe(
        map(data => ({ loading: false, data, error: null })),
        startWith({ loading: true, data: null as ShiftDefinition | null, error: null }),
        catchError(err => {
          this.message.error('Failed to load shift details');
          return of({ loading: false, data: null, error: err });
        })
      ))
    ),
    { initialValue: { loading: true, data: null as ShiftDefinition | null, error: null } }
  );

  shift = computed(() => this.state().data);
  loading = computed(() => this.state().loading);

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}