import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { Grade, GradesService } from '../../services/grades.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-grades',
  standalone: false,
  templateUrl: './all-grades.html',
  styleUrl: './all-grades.scss'
})
export class AllGrades implements OnInit {
  items: WritableSignal<Grade[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(private service: GradesService) {}

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
