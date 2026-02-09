import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { JobDescriptionsService } from '../../services/job-descriptions.service';

@Component({
  selector: 'app-create-job-description',
  standalone: false,
  templateUrl: './create-job-description.html',
  styleUrl: './create-job-description.scss'
})
export class CreateJobDescription {
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);

  constructor(fb: FormBuilder, private service: JobDescriptionsService, private router: Router, private msg: NzMessageService) {
    this.form = fb.group({ name: ['', [Validators.required]] });
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      this.service.create(this.form.value).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: () => { this.msg.success('Created successfully'); this.router.navigate(['/settings/job-descriptions']); },
        error: () => this.msg.error('Failed to create')
      });
    }
  }
}
