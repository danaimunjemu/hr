import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../../services/training.service';
import { EmployeeSkill } from '../../models/training.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-skills-matrix',
  standalone: false,
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Employee Skills Matrix</h1>
        <button nz-button nzType="primary" (click)="addSkill()">
          <span nz-icon nzType="plus"></span> Add Skill Assessment
        </button>
      </div>

      <div class="mb-4">
        <input nz-input placeholder="Search by Employee or Skill..." style="width: 300px;" (keyup)="filter($event)" />
      </div>

      <nz-table #basicTable [nzData]="filteredSkills" [nzLoading]="loading">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Skill</th>
            <th>Level</th>
            <th>Last Assessed</th>
            <th>Certification Expiry</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data">
            <td>{{ data.employeeName }}</td>
            <td>{{ data.skillName }}</td>
            <td>
              <nz-tag [nzColor]="getLevelColor(data.level)">{{ data.level }}</nz-tag>
            </td>
            <td>{{ data.lastAssessed | date }}</td>
            <td>
              <span [class.text-red-500]="isExpiring(data.certificationExpiry)">
                {{ data.certificationExpiry ? (data.certificationExpiry | date) : 'N/A' }}
              </span>
            </td>
            <td>
              <nz-badge [nzStatus]="getExpiryStatus(data.certificationExpiry)" [nzText]="getExpiryText(data.certificationExpiry)"></nz-badge>
            </td>
            <td>
              <a (click)="editSkill(data)">Update</a>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </div>
  `
})
export class SkillsMatrixComponent implements OnInit {
  skills: EmployeeSkill[] = [];
  filteredSkills: EmployeeSkill[] = [];
  loading = false;

  constructor(
    private trainingService: TrainingService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.trainingService.getSkills().subscribe(data => {
      this.skills = data;
      this.filteredSkills = data;
      this.loading = false;
    });
  }

  filter(event: any) {
    const val = event.target.value.toLowerCase();
    this.filteredSkills = this.skills.filter(s => 
      s.employeeName.toLowerCase().includes(val) || 
      s.skillName.toLowerCase().includes(val)
    );
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'EXPERT': return 'purple';
      case 'ADVANCED': return 'green';
      case 'INTERMEDIATE': return 'blue';
      default: return 'default';
    }
  }

  isExpiring(dateStr?: string): boolean {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const now = new Date();
    const warningDate = new Date();
    warningDate.setDate(now.getDate() + 30);
    return expiry > now && expiry <= warningDate;
  }

  getExpiryStatus(dateStr?: string): string {
    if (!dateStr) return 'default';
    const expiry = new Date(dateStr);
    const now = new Date();
    if (expiry < now) return 'error'; // Expired
    if (this.isExpiring(dateStr)) return 'warning'; // Expiring soon
    return 'success'; // Valid
  }

  getExpiryText(dateStr?: string): string {
    if (!dateStr) return 'No Cert';
    const status = this.getExpiryStatus(dateStr);
    if (status === 'error') return 'Expired';
    if (status === 'warning') return 'Expiring Soon';
    return 'Valid';
  }

  addSkill() {
    this.message.info('Add Skill modal to be implemented');
  }

  editSkill(skill: EmployeeSkill) {
    this.message.info(`Editing skill for ${skill.employeeName}`);
  }
}
