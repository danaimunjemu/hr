import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { OffboardingRecord, OffboardingUpsertRequest } from '../../models/offboarding.model';
import { OffboardingService } from '../../services/offboarding.service';

@Component({
  selector: 'app-offboarding-edit-page',
  standalone: false,
  templateUrl: './offboarding-edit-page.component.html',
  styleUrl: './offboarding-edit-page.component.scss'
})
export class OffboardingEditPageComponent implements OnInit {
  record: OffboardingRecord | null = null;
  loading = false;
  saving = false;
  private id = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offboardingService: OffboardingService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.id) {
      this.router.navigate(['/app/offboarding']);
      return;
    }

    this.load();
  }

  update(payload: OffboardingUpsertRequest): void {
    if (this.saving || !this.id) {
      return;
    }

    this.saving = true;
    this.offboardingService
      .update(this.id, payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: updated => {
          this.message.success('Offboarding record updated.');
          this.router.navigate(['/app/offboarding', updated.id]);
        },
        error: (error: Error) => {
          this.message.error(error.message || 'Failed to update offboarding record.');
        }
      });
  }

  cancel(): void {
    if (this.id) {
      this.router.navigate(['/app/offboarding', this.id]);
      return;
    }
    this.router.navigate(['/app/offboarding']);
  }

  private load(): void {
    this.loading = true;
    this.offboardingService
      .getById(this.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: record => {
          this.record = record;
        },
        error: (error: Error) => {
          this.message.error(error.message || 'Failed to load offboarding record.');
          this.router.navigate(['/app/offboarding']);
        }
      });
  }
}
