import { Component, OnInit } from '@angular/core';
import { LeaveType } from '../../../models/leave-type.model';
import { LeaveService } from '../../../services/leave.service';

@Component({
  selector: 'app-leave-type-list',
  standalone: false,
  templateUrl: './leave-type-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class LeaveTypeListComponent implements OnInit {
  loading = true;
  types: LeaveType[] = [];

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.leaveService.getAllTypes().subscribe({
      next: (data) => {
        this.types = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load leave types', err);
        this.loading = false;
      }
    });
  }
}
