import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Grade, GradesService } from '../../services/grades.service';

@Component({
  selector: 'app-view-grade',
  standalone: false,
  templateUrl: './view-grade.html',
  styleUrl: './view-grade.scss'
})
export class ViewGrade implements OnInit {
  item: WritableSignal<Grade | null> = signal(null);

  constructor(private service: GradesService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.service.getById(id).subscribe(data => this.item.set(data));
  }
}
