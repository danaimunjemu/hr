import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Position, PositionsService } from '../../services/positions.service';

@Component({
  selector: 'app-view-position',
  standalone: false,
  templateUrl: './view-position.html',
  styleUrl: './view-position.scss'
})
export class ViewPosition implements OnInit {
  item: WritableSignal<Position | null> = signal(null);

  constructor(private service: PositionsService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.service.getById(id).subscribe(data => this.item.set(data));
  }
}
