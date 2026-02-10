import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { finalize } from 'rxjs';
import { GoalSetting } from '../../../models/goal-setting.model';
import { GoalSettingService } from '../../../services/goal-setting.service';

@Component({
  selector: 'app-goal-settings-list',
  standalone: false,
  templateUrl: './goal-settings-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class GoalSettingsListComponent implements OnInit {
  loading: WritableSignal<boolean> = signal(true);
  goalSettings: WritableSignal<GoalSetting[]> = signal([]);
  isGoalsModalVisible: WritableSignal<boolean> = signal(false);
  selectedGoalSetting: WritableSignal<GoalSetting | null> = signal(null);

  constructor(private goalSettingService: GoalSettingService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.goalSettingService.getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.goalSettings.set(data),
        error: (err: any) => console.error('Failed to load goal settings', err)
      });
  }

  openGoalsModal(goalSetting: GoalSetting): void {
    this.selectedGoalSetting.set(goalSetting);
    this.isGoalsModalVisible.set(true);
  }

  closeGoalsModal(): void {
    this.isGoalsModalVisible.set(false);
  }
}
