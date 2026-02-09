import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { WorkScheduleRulesService } from '../../services/work-schedule-rules.service';

@Component({
  selector: 'app-edit-work-schedule-rule',
  standalone: false,
  templateUrl: './edit-work-schedule-rule.html',
  styleUrl: './edit-work-schedule-rule.scss'
})
export class EditWorkScheduleRule implements OnInit {
  form: FormGroup;
  id!: number;
  loading: WritableSignal<boolean> = signal(false);

  constructor(fb: FormBuilder, private service: WorkScheduleRulesService, private route: ActivatedRoute, private router: Router, private msg: NzMessageService) {
    this.form = fb.group({ name: ['', [Validators.required]] });
  }

  ngOnInit() {
    this.id = +this.route.snapshot.params['id'];
    this.service.getById(this.id).subscribe(data => this.form.patchValue(data));
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      this.service.update(this.id, this.form.value).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: () => { this.msg.success('Updated successfully'); this.router.navigate(['/settings/work-schedule-rules']); },
        error: () => this.msg.error('Failed to update')
      });
    }
  }
}
