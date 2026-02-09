import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { JobDescription, JobDescriptionsService } from '../../services/job-descriptions.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-job-descriptions',
  standalone: false,
  templateUrl: './all-job-descriptions.html',
  styleUrl: './all-job-descriptions.scss'
})
export class AllJobDescriptions implements OnInit {
  items: WritableSignal<JobDescription[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(private service: JobDescriptionsService) {}

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
