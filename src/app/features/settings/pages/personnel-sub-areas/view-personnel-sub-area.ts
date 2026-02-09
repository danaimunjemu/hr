import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PersonnelSubArea, PersonnelSubAreasService } from '../../services/personnel-sub-areas.service';

@Component({
  selector: 'app-view-personnel-sub-area',
  standalone: false,
  templateUrl: './view-personnel-sub-area.html',
  styleUrl: './view-personnel-sub-area.scss'
})
export class ViewPersonnelSubArea implements OnInit {
  item: WritableSignal<PersonnelSubArea | null> = signal(null);

  constructor(private service: PersonnelSubAreasService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.service.getById(id).subscribe(data => this.item.set(data));
  }
}
