import { Component, inject, computed, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkContractService } from '../../../services/work-contract.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap, startWith, catchError, of } from 'rxjs';
import { WorkContract } from '../../../models/work-contract.model';

@Component({
  selector: 'app-work-contract-view',
  standalone: false,
  templateUrl: './work-contract-view.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
    .detail-item {
      margin-bottom: 16px;
    }
    .detail-label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }
    .detail-value {
      color: rgba(0, 0, 0, 0.65);
    }
  `]
})
export class WorkContractViewComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(WorkContractService);
  private message = inject(NzMessageService);

  private state = toSignal(
    this.route.params.pipe(
      map(p => p['id']),
      filter(id => !!id),
      switchMap(id => this.service.getById(+id).pipe(
        map(data => ({ loading: false, data, error: null })),
        startWith({ loading: true, data: null as WorkContract | null, error: null }),
        catchError(err => {
          this.message.error('Failed to load contract details');
          return of({ loading: false, data: null, error: err });
        })
      ))
    ),
    { initialValue: { loading: true, data: null as WorkContract | null, error: null } }
  );

  contract = computed(() => this.state().data);
  loading = computed(() => this.state().loading);

  onBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}