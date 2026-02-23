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
  searchTerm: WritableSignal<string> = signal('');

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

  onSearch(term: string): void {
    this.searchTerm.set(term.trim().toLowerCase());
  }

  filteredCompanies(): Company[] {
    const query = this.searchTerm();
    if (!query) {
      return this.companies();
    }

    return this.companies().filter((company) => {
      const id = String(company.id ?? '').toLowerCase();
      const name = String(company.name ?? '').toLowerCase();
      const location = String(company.workLocation ?? '').toLowerCase();
      return id.includes(query) || name.includes(query) || location.includes(query);
    });
  }

  idFilterFn = (values: string[], item: Company): boolean => {
    if (!values?.length) {
      return true;
    }
    return values.includes(String(item.id));
  };

  nameFilterFn = (values: string[], item: Company): boolean => {
    if (!values?.length) {
      return true;
    }
    return values.some((value) => item.name?.toLowerCase().includes(value.toLowerCase()) ?? false);
  };

  locationFilterFn = (values: string[], item: Company): boolean => {
    if (!values?.length) {
      return true;
    }
    return values.some((value) => item.workLocation?.toLowerCase().includes(value.toLowerCase()) ?? false);
  };

  idFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.companies().map((company) => String(company.id)))].map((id) => ({
      text: id,
      value: id
    }));
  }

  nameFilters(): Array<{ text: string; value: string }> {
    const uniqueNames = [...new Set(
      this.companies()
        .map((company) => company.name)
        .filter((name): name is string => !!name)
    )];
    return uniqueNames.map((name) => ({
      text: name,
      value: name
    }));
  }

  locationFilters(): Array<{ text: string; value: string }> {
    const uniqueLocations = [...new Set(
      this.companies()
        .map((company) => company.workLocation)
        .filter((location): location is string => !!location)
    )];
    return uniqueLocations.map((location) => ({
      text: location,
      value: location
    }));
  }

  resetTableFilters(table: { reset?: () => void }): void {
    table.reset?.();
    this.searchTerm.set('');
  }
}
