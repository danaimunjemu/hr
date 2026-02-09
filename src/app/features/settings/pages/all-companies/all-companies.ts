import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { Company, CompaniesService } from '../../services/companies.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-companies',
  standalone: false,
  templateUrl: './all-companies.html',
  styleUrl: './all-companies.scss'
})
export class AllCompanies implements OnInit {
  companies: WritableSignal<Company[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(private companiesService: CompaniesService) {}

  ngOnInit(): void {
    this.fetchCompanies();
  }

  fetchCompanies(): void {
    this.loading.set(true);
    this.error.set(null);
    this.companiesService.getCompanies()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.companies.set(data),
        error: (err) => this.error.set(err.message)
      });
  }
}
