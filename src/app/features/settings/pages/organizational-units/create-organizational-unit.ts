import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { OrganizationalUnitsService } from '../../services/organizational-units.service';

@Component({
  selector: 'app-create-organizational-unit',
  standalone: false,
  templateUrl: './create-organizational-unit.html',
  styleUrl: './create-organizational-unit.scss'
})
export class CreateOrganizationalUnit {
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);

  constructor(fb: FormBuilder, private service: OrganizationalUnitsService, private router: Router, private msg: NzMessageService) {
    this.form = fb.group({ name: ['', [Validators.required]] });
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      this.service.create(this.form.value).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: () => { this.msg.success('Created successfully'); this.router.navigate(['/app/settings/organizational-units']); },
        error: () => this.msg.error('Failed to create')
      });
    }
  }
}
