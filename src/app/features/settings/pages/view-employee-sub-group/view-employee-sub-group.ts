import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeSubGroup, EmployeeSubGroupsService } from '../../services/employee-sub-groups.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-view-employee-sub-group',
  standalone: false,
  templateUrl: './view-employee-sub-group.html',
  styleUrl: './view-employee-sub-group.scss'
})
export class ViewEmployeeSubGroup implements OnInit {
  employeeSubGroup: WritableSignal<EmployeeSubGroup | null> = signal(null);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(
    private route: ActivatedRoute,
    private employeeSubGroupsService: EmployeeSubGroupsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchEmployeeSubGroup(+id);
    } else {
      this.error.set('Invalid employee sub group ID');
    }
  }

  fetchEmployeeSubGroup(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.employeeSubGroupsService.getEmployeeSubGroup(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.employeeSubGroup.set(data),
        error: (err) => this.error.set(err.message)
      });
  }
}
