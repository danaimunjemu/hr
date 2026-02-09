import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { WorkContract, WorkContractsService } from '../../services/work-contracts.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-work-contracts',
  standalone: false,
  templateUrl: './all-work-contracts.html',
  styleUrl: './all-work-contracts.scss'
})
export class AllWorkContracts implements OnInit {
  items: WritableSignal<WorkContract[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(private service: WorkContractsService) {}

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
