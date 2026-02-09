import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { EmployeeGroup, EmployeeGroupsService } from '../../services/employee-groups.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-employee-groups',
  standalone: false,
  templateUrl: './all-employee-groups.html',
  styleUrl: './all-employee-groups.scss'
})
export class AllEmployeeGroups implements OnInit {
  employeeGroups: WritableSignal<EmployeeGroup[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(private employeeGroupsService: EmployeeGroupsService) {}

  ngOnInit(): void {
    this.fetchEmployeeGroups();
  }

  fetchEmployeeGroups(): void {
    this.loading.set(true);
    this.error.set(null);
    this.employeeGroupsService.getEmployeeGroups()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.employeeGroups.set(data),
        error: (err) => this.error.set(err.message)
      });
  }
}
