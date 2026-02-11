import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { PositionsService } from '../../services/positions.service';

@Component({
  selector: 'app-edit-position',
  standalone: false,
  templateUrl: './edit-position.html',
  styleUrl: './edit-position.scss'
})
export class EditPosition implements OnInit {
  form: FormGroup;
  id!: number;
  loading: WritableSignal<boolean> = signal(false);

  constructor(fb: FormBuilder, private service: PositionsService, private route: ActivatedRoute, private router: Router, private msg: NzMessageService) {
    this.form = fb.group({
      name: ['', [Validators.required]],
      superior: [''],
      secondSuperior: fb.group({
        name: ['']
      }),
      subordinates: [[]]
    });
  }

  ngOnInit() {
    this.id = +this.route.snapshot.params['id'];
    this.service.getById(this.id).subscribe(data => {
      this.form.patchValue(data);
      // Handle nested form group patch if needed specifically, but patchValue usually handles it
    });
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      this.service.update(this.id, this.form.value).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: () => { this.msg.success('Updated successfully'); this.router.navigate(['/app/settings/positions']); },
        error: () => this.msg.error('Failed to update')
      });
    }
  }
}
