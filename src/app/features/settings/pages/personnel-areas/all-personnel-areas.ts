import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { PersonnelArea, PersonnelAreasService } from '../../services/personnel-areas.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-personnel-areas',
  standalone: false,
  templateUrl: './all-personnel-areas.html',
  styleUrl: './all-personnel-areas.scss'
})
export class AllPersonnelAreas implements OnInit {
  items: WritableSignal<PersonnelArea[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(private service: PersonnelAreasService) {}

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
