import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EthnicGroup, EthnicGroupsService } from '../../services/ethnic-groups.service';

@Component({
  selector: 'app-view-ethnic-group',
  standalone: false,
  templateUrl: './view-ethnic-group.html',
  styleUrl: './view-ethnic-group.scss'
})
export class ViewEthnicGroup implements OnInit {
  item: WritableSignal<EthnicGroup | null> = signal(null);

  constructor(private service: EthnicGroupsService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.service.getById(id).subscribe(data => this.item.set(data));
  }
}
