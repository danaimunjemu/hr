import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LeaveService } from '../../../services/leave.service';
import { LeaveType } from '../../../models/leave-type.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-leave-type-view',
  standalone: false,
  templateUrl: './leave-type-view.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class LeaveTypeViewComponent implements OnInit {
  type: WritableSignal<LeaveType | null> = signal(null);
  loading: WritableSignal<boolean> = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leaveService: LeaveService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadType(id);
      } else {
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  loadType(id: number): void {
    this.loading.set(true);
    this.leaveService.getTypeById(id).subscribe({
      next: (data) => {
        this.type.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.message.error('Failed to load leave type details');
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}