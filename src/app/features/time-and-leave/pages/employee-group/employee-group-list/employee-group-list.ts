import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { EmployeeGroup } from '../../../models/employee-group.model';
import { EmployeeGroupService } from '../../../services/employee-group.service';

@Component({
  selector: 'app-employee-group-list',
  standalone: false,
  templateUrl: './employee-group-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class EmployeeGroupListComponent implements OnInit {
  loading: WritableSignal<boolean> = signal(true);
  groups: WritableSignal<EmployeeGroup[]> = signal([]);

  constructor(private employeeGroupService: EmployeeGroupService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.employeeGroupService.getAll().subscribe({
      next: (data) => {
        this.groups.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load employee groups', err);
        this.loading.set(false);
      }
    });
  }
}