import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { Position, PositionsService } from '../../services/positions.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-positions',
  standalone: false,
  templateUrl: './all-positions.html',
  styleUrl: './all-positions.scss'
})
export class AllPositions implements OnInit {
  items: WritableSignal<Position[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(private service: PositionsService) {}

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
