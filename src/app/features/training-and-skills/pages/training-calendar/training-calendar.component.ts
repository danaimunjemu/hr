import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../../services/training.service';
import { TrainingSession } from '../../models/training.model';

@Component({
  selector: 'app-training-calendar',
  standalone: false,
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">Training Calendar</h1>
      
      <nz-calendar [(ngModel)]="date">
        <ul *nzDateCell="let date" class="events">
          <ng-container *ngFor="let item of getSessionsForDate(date)">
            <li (click)="onEventClick(item)">
              <nz-badge [nzStatus]="getStatus(item.status)" [nzText]="item.programName"></nz-badge>
            </li>
          </ng-container>
        </ul>
      </nz-calendar>

      <!-- Event Details Modal -->
      <nz-modal [(nzVisible)]="isVisible" nzTitle="Session Details" (nzOnCancel)="handleCancel()" (nzOnOk)="handleCancel()">
        <ng-container *nzModalContent>
          <div *ngIf="selectedSession">
            <p><strong>Program:</strong> {{ selectedSession.programName }}</p>
            <p><strong>Trainer:</strong> {{ selectedSession.trainer }}</p>
            <p><strong>Time:</strong> {{ selectedSession.startTime }} - {{ selectedSession.endTime }}</p>
            <p><strong>Location:</strong> {{ selectedSession.location }}</p>
            <p><strong>Enrolled:</strong> {{ selectedSession.enrolledCount }} / {{ selectedSession.capacity }}</p>
            <p><strong>Status:</strong> <nz-tag [nzColor]="getStatusColor(selectedSession.status)">{{ selectedSession.status }}</nz-tag></p>
          </div>
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [`
    .events {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .events li {
      cursor: pointer;
    }
    .events .ant-badge-status {
      width: 100%;
      overflow: hidden;
      font-size: 12px;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  `]
})
export class TrainingCalendarComponent implements OnInit {
  date = new Date();
  sessions: TrainingSession[] = [];
  isVisible = false;
  selectedSession: TrainingSession | null = null;

  constructor(private trainingService: TrainingService) {}

  ngOnInit() {
    this.trainingService.getSessions().subscribe(data => this.sessions = data);
  }

  getSessionsForDate(date: Date): TrainingSession[] {
    const dStr = date.toISOString().split('T')[0];
    return this.sessions.filter(s => s.date === dStr);
  }

  getStatus(status: string): string {
    return status === 'COMPLETED' ? 'success' : 'processing';
  }

  getStatusColor(status: string): string {
    return status === 'COMPLETED' ? 'green' : 'blue';
  }

  onEventClick(session: TrainingSession) {
    this.selectedSession = session;
    this.isVisible = true;
  }

  handleCancel() {
    this.isVisible = false;
  }
}
