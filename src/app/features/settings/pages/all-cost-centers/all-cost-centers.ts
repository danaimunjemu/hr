import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CostCenter, CostCentersService } from '../../services/cost-centers.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-cost-centers',
  standalone: false,
  templateUrl: './all-cost-centers.html',
  styleUrl: './all-cost-centers.scss'
})
export class AllCostCenters implements OnInit {
  costCenters: WritableSignal<CostCenter[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(private costCentersService: CostCentersService) {}

  ngOnInit(): void {
    this.fetchCostCenters();
  }

  fetchCostCenters(): void {
    this.loading.set(true);
    this.error.set(null);
    this.costCentersService.getCostCenters()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.costCenters.set(data),
        error: (err) => this.error.set(err.message)
      });
  }
}
