import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkScheduleRule, WorkScheduleRulesService } from '../../services/work-schedule-rules.service';

@Component({
  selector: 'app-view-work-schedule-rule',
  standalone: false,
  templateUrl: './view-work-schedule-rule.html',
  styleUrl: './view-work-schedule-rule.scss'
})
export class ViewWorkScheduleRule implements OnInit {
  item: WritableSignal<WorkScheduleRule | null> = signal(null);

  constructor(private service: WorkScheduleRulesService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.service.getById(id).subscribe(data => this.item.set(data));
  }
}
