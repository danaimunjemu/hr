import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PsGroup, PsGroupsService } from '../../services/ps-groups.service';

@Component({
  selector: 'app-view-ps-group',
  standalone: false,
  templateUrl: './view-ps-group.html',
  styleUrl: './view-ps-group.scss'
})
export class ViewPsGroup implements OnInit {
  item: WritableSignal<PsGroup | null> = signal(null);

  constructor(private service: PsGroupsService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.service.getById(id).subscribe(data => this.item.set(data));
  }
}
