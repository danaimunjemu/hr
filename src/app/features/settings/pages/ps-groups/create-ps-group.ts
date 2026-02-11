import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { PsGroupsService } from '../../services/ps-groups.service';

@Component({
  selector: 'app-create-ps-group',
  standalone: false,
  templateUrl: './create-ps-group.html',
  styleUrl: './create-ps-group.scss'
})
export class CreatePsGroup {
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);

  constructor(fb: FormBuilder, private service: PsGroupsService, private router: Router, private msg: NzMessageService) {
    this.form = fb.group({ name: ['', [Validators.required]] });
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      this.service.create(this.form.value).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: () => { this.msg.success('Created successfully'); this.router.navigate(['/app/settings/ps-groups']); },
        error: () => this.msg.error('Failed to create')
      });
    }
  }
}
