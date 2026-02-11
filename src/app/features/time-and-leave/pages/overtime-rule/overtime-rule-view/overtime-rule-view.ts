import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OvertimeRuleService } from '../../../services/overtime-rule.service';
import { OvertimeRule } from '../../../models/overtime-rule.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-overtime-rule-view',
  standalone: false,
  templateUrl: './overtime-rule-view.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class OvertimeRuleViewComponent implements OnInit {
  rule: WritableSignal<OvertimeRule | null> = signal(null);
  loading: WritableSignal<boolean> = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ruleService: OvertimeRuleService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadRule(id);
      } else {
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  loadRule(id: number): void {
    this.loading.set(true);
    this.ruleService.getById(id).subscribe({
      next: (data) => {
        this.rule.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.message.error('Failed to load rule details');
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}