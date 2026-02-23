import { ChangeDetectorRef, Component } from '@angular/core';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BatchService } from '../../services/bulk-onboarding';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bulk-onboarding',
  standalone: false,
  templateUrl: './bulk-onboarding.html',
  styleUrl: './bulk-onboarding.scss'
})
export class BulkOnboarding {
  fileList: NzUploadFile[] = [];
  private rawFile: File | null = null;
  submitting = false;
downloadSampleTemplate(): void {
  // Replace with your real URL or API call
  const url = '/assets/templates/bulk-onboarding-sample.xlsx';
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bulk-onboarding-sample.xlsx';
  a.click();
}

  constructor(
    private batchService: BatchService,
    private message: NzMessageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  beforeUpload = (file: NzUploadFile | any): boolean => {
    this.rawFile = file as File;
    this.fileList = [file as NzUploadFile];
    return false;
  };

  handleChange(info: NzUploadChangeParam): void {
    if (info.file.status === 'error') {
      this.message.error('File upload failed.');
    }
  }

  submit(): void {
    if (!this.rawFile || this.submitting) return;

    const formData = new FormData();
    formData.append('file', this.rawFile);

    this.submitting = true;
    this.batchService.upload(formData).subscribe({
      next: batch => {
        this.submitting = false;
        this.message.success('Bulk onboarding batch created.');
        this.cdr.detectChanges();
        this.router.navigate(['/app/onboarding/batches', batch.id]);
      },
      error: err => {
        this.submitting = false;
        const msg = err?.error?.message || 'Failed to create bulk onboarding batch.';
        this.message.error(msg);
        this.cdr.detectChanges();
      }
    });
  }

  goToBatches(): void {
    this.router.navigate(['/app/onboarding/batches']);
  }

  back(): void {
    this.goToBatches();
  }
}
