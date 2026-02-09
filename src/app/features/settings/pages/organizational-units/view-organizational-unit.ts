import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrganizationalUnit, OrganizationalUnitsService } from '../../services/organizational-units.service';

@Component({
  selector: 'app-view-organizational-unit',
  standalone: false,
  templateUrl: './view-organizational-unit.html',
  styleUrl: './view-organizational-unit.scss'
})
export class ViewOrganizationalUnit implements OnInit {
  item: WritableSignal<OrganizationalUnit | null> = signal(null);

  constructor(private service: OrganizationalUnitsService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.service.getById(id).subscribe(data => this.item.set(data));
  }
}
