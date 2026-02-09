import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeGroup, EmployeeGroupsService } from '../../services/employee-groups.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-view-employee-group',
  standalone: false,
  templateUrl: './view-employee-group.html',
  styleUrl: './view-employee-group.scss'
})
export class ViewEmployeeGroup implements OnInit {
  employeeGroup: WritableSignal<EmployeeGroup | null> = signal(null);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(
    private route: ActivatedRoute,
    private employeeGroupsService: EmployeeGroupsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchEmployeeGroup(+id);
    } else {
      this.error.set('Invalid employee group ID');
    }
  }

  fetchEmployeeGroup(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.employeeGroupsService.getEmployeeGroup(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.employeeGroup.set(data),
        error: (err) => this.error.set(err.message)
      });
  }
}
