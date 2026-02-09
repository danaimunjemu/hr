import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { OrganizationalUnit, OrganizationalUnitsService } from '../../services/organizational-units.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-organizational-units',
  standalone: false,
  templateUrl: './all-organizational-units.html',
  styleUrl: './all-organizational-units.scss'
})
export class AllOrganizationalUnits implements OnInit {
  items: WritableSignal<OrganizationalUnit[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(private service: OrganizationalUnitsService) {}

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
