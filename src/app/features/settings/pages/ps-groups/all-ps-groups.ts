import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { PsGroup, PsGroupsService } from '../../services/ps-groups.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-ps-groups',
  standalone: false,
  templateUrl: './all-ps-groups.html',
  styleUrl: './all-ps-groups.scss'
})
export class AllPsGroups implements OnInit {
  items: WritableSignal<PsGroup[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(private service: PsGroupsService) {}

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
