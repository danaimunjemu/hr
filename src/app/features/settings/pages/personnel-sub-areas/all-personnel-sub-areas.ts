import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { PersonnelSubArea, PersonnelSubAreasService } from '../../services/personnel-sub-areas.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-personnel-sub-areas',
  standalone: false,
  templateUrl: './all-personnel-sub-areas.html',
  styleUrl: './all-personnel-sub-areas.scss'
})
export class AllPersonnelSubAreas implements OnInit {
  items: WritableSignal<PersonnelSubArea[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(private service: PersonnelSubAreasService) {}

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
