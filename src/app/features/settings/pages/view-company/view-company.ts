import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Company, CompaniesService } from '../../services/companies.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-view-company',
  standalone: false,
  templateUrl: './view-company.html',
  styleUrl: './view-company.scss'
})
export class ViewCompany implements OnInit {
  company: WritableSignal<Company | null> = signal(null);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companiesService: CompaniesService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchCompany(+id);
    } else {
      this.error.set('Invalid company ID');
    }
  }

  fetchCompany(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.companiesService.getCompany(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.company.set(data),
        error: (err) => this.error.set(err.message)
      });
  }

  cancel(): void {
    this.router.navigate(['/app/settings/companies']);
  }

}
