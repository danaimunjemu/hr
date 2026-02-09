import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { EthnicGroupsService } from '../../services/ethnic-groups.service';

@Component({
  selector: 'app-edit-ethnic-group',
  standalone: false,
  templateUrl: './edit-ethnic-group.html',
  styleUrl: './edit-ethnic-group.scss'
})
export class EditEthnicGroup implements OnInit {
  form: FormGroup;
  id!: number;
  loading: WritableSignal<boolean> = signal(false);

  constructor(fb: FormBuilder, private service: EthnicGroupsService, private route: ActivatedRoute, private router: Router, private msg: NzMessageService) {
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
        next: () => { this.msg.success('Updated successfully'); this.router.navigate(['/settings/ethnic-groups']); },
        error: () => this.msg.error('Failed to update')
      });
    }
  }
}
