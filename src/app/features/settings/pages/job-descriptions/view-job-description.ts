import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobDescription, JobDescriptionsService } from '../../services/job-descriptions.service';

@Component({
  selector: 'app-view-job-description',
  standalone: false,
  templateUrl: './view-job-description.html',
  styleUrl: './view-job-description.scss'
})
export class ViewJobDescription implements OnInit {
  item: WritableSignal<JobDescription | null> = signal(null);

  constructor(private service: JobDescriptionsService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.service.getById(id).subscribe(data => this.item.set(data));
  }
}
