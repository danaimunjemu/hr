import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { finalize } from 'rxjs';
import { PerformanceCycle } from '../../../models/performance-cycle.model';
import { PerformanceCycleService } from '../../../services/performance-cycle.service';

@Component({
  selector: 'app-performance-cycle-list',
  standalone: false,
  templateUrl: './performance-cycle-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class PerformanceCycleListComponent implements OnInit {
  loading: WritableSignal<boolean> = signal(true);
  cycles: WritableSignal<PerformanceCycle[]> = signal([]);

  constructor(private performanceCycleService: PerformanceCycleService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.performanceCycleService.getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.cycles.set(data),
        error: (err: any) => console.error('Failed to load performance cycles', err)
      });
  }
}
