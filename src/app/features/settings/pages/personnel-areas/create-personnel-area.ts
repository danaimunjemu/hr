import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { PersonnelAreasService } from '../../services/personnel-areas.service';

@Component({
  selector: 'app-create-personnel-area',
  standalone: false,
  templateUrl: './create-personnel-area.html',
  styleUrl: './create-personnel-area.scss'
})
export class CreatePersonnelArea {
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);

  constructor(fb: FormBuilder, private service: PersonnelAreasService, private router: Router, private msg: NzMessageService) {
    this.form = fb.group({ name: ['', [Validators.required]] });
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      this.service.create(this.form.value).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: () => { this.msg.success('Created successfully'); this.router.navigate(['/settings/personnel-areas']); },
        error: () => this.msg.error('Failed to create')
      });
    }
  }
}
