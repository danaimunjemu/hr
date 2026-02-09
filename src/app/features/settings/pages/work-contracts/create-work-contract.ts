import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { WorkContractsService } from '../../services/work-contracts.service';

@Component({
  selector: 'app-create-work-contract',
  standalone: false,
  templateUrl: './create-work-contract.html',
  styleUrl: './create-work-contract.scss'
})
export class CreateWorkContract {
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);

  constructor(fb: FormBuilder, private service: WorkContractsService, private router: Router, private msg: NzMessageService) {
    this.form = fb.group({ name: ['', [Validators.required]] });
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      this.service.create(this.form.value).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: () => { this.msg.success('Created successfully'); this.router.navigate(['/settings/work-contracts']); },
        error: () => this.msg.error('Failed to create')
      });
    }
  }
}
