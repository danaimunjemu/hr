import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { EmployeeSubGroup, EmployeeSubGroupsService } from '../../services/employee-sub-groups.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-employee-sub-groups',
  standalone: false,
  templateUrl: './all-employee-sub-groups.html',
  styleUrl: './all-employee-sub-groups.scss'
})
export class AllEmployeeSubGroups implements OnInit {
  employeeSubGroups: WritableSignal<EmployeeSubGroup[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(private employeeSubGroupsService: EmployeeSubGroupsService) {}

  ngOnInit(): void {
    this.fetchEmployeeSubGroups();
  }

  fetchEmployeeSubGroups(): void {
    this.loading.set(true);
    this.error.set(null);
    this.employeeSubGroupsService.getEmployeeSubGroups()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.employeeSubGroups.set(data),
        error: (err) => this.error.set(err.message)
      });
  }
}
