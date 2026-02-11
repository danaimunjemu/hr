import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { WorkScheduleRulesService } from '../../services/work-schedule-rules.service';

@Component({
  selector: 'app-create-work-schedule-rule',
  standalone: false,
  templateUrl: './create-work-schedule-rule.html',
  styleUrl: './create-work-schedule-rule.scss'
})
export class CreateWorkScheduleRule {
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);

  constructor(fb: FormBuilder, private service: WorkScheduleRulesService, private router: Router, private msg: NzMessageService) {
    this.form = fb.group({ name: ['', [Validators.required]] });
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      this.service.create(this.form.value).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: () => { this.msg.success('Created successfully'); this.router.navigate(['/app/settings/work-schedule-rules']); },
        error: () => this.msg.error('Failed to create')
      });
    }
  }
}
