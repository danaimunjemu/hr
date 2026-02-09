import { Component, OnInit } from '@angular/core';
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
  loading = true;
  groups: EmployeeGroup[] = [];

  constructor(private employeeGroupService: EmployeeGroupService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.employeeGroupService.getAll().subscribe({
      next: (data) => {
        this.groups = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load employee groups', err);
        this.loading = false;
      }
    });
  }
}
