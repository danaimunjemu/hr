import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CostCenter, CostCentersService } from '../../services/cost-centers.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-view-cost-center',
  standalone: false,
  templateUrl: './view-cost-center.html',
  styleUrl: './view-cost-center.scss'
})
export class ViewCostCenter implements OnInit {
  costCenter: WritableSignal<CostCenter | null> = signal(null);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(
    private route: ActivatedRoute,
    private costCentersService: CostCentersService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchCostCenter(+id);
    } else {
      this.error.set('Invalid cost center ID');
    }
  }

  fetchCostCenter(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.costCentersService.getCostCenter(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.costCenter.set(data),
        error: (err) => this.error.set(err.message)
      });
  }
}
