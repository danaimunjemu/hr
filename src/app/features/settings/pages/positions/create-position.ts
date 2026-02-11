import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { PositionsService } from '../../services/positions.service';

@Component({
  selector: 'app-create-position',
  standalone: false,
  templateUrl: './create-position.html',
  styleUrl: './create-position.scss'
})
export class CreatePosition {
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);

  constructor(fb: FormBuilder, private service: PositionsService, private router: Router, private msg: NzMessageService) {
    this.form = fb.group({
      name: ['', [Validators.required]]
    });
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      this.service.create(this.form.value).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: () => { this.msg.success('Created successfully'); this.router.navigate(['/app/settings/positions']); },
        error: () => this.msg.error('Failed to create')
      });
    }
  }
}
