import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PersonnelArea, PersonnelAreasService } from '../../services/personnel-areas.service';

@Component({
  selector: 'app-view-personnel-area',
  standalone: false,
  templateUrl: './view-personnel-area.html',
  styleUrl: './view-personnel-area.scss'
})
export class ViewPersonnelArea implements OnInit {
  item: WritableSignal<PersonnelArea | null> = signal(null);

  constructor(private service: PersonnelAreasService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.service.getById(id).subscribe(data => this.item.set(data));
  }
}
