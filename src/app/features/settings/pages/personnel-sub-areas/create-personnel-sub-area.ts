import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { PersonnelSubAreasService } from '../../services/personnel-sub-areas.service';

@Component({
  selector: 'app-create-personnel-sub-area',
  standalone: false,
  templateUrl: './create-personnel-sub-area.html',
  styleUrl: './create-personnel-sub-area.scss'
})
export class CreatePersonnelSubArea {
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);

  constructor(fb: FormBuilder, private service: PersonnelSubAreasService, private router: Router, private msg: NzMessageService) {
    this.form = fb.group({ name: ['', [Validators.required]] });
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      this.service.create(this.form.value).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: () => { this.msg.success('Created successfully'); this.router.navigate(['/settings/personnel-sub-areas']); },
        error: () => this.msg.error('Failed to create')
      });
    }
  }
}
