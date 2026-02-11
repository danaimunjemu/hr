import { Component, OnInit, signal, WritableSignal } from '@angular/core';
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
  loading: WritableSignal<boolean> = signal(true);
  types: WritableSignal<LeaveType[]> = signal([]);

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.leaveService.getAllTypes().subscribe({
      next: (data) => {
        this.types.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load leave types', err);
        this.loading.set(false);
      }
    });
  }
}