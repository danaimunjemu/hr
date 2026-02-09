import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { EthnicGroup, EthnicGroupsService } from '../../services/ethnic-groups.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-ethnic-groups',
  standalone: false,
  templateUrl: './all-ethnic-groups.html',
  styleUrl: './all-ethnic-groups.scss'
})
export class AllEthnicGroups implements OnInit {
  items: WritableSignal<EthnicGroup[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(private service: EthnicGroupsService) {}

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
