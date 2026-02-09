import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkContract, WorkContractsService } from '../../services/work-contracts.service';

@Component({
  selector: 'app-view-work-contract',
  standalone: false,
  templateUrl: './view-work-contract.html',
  styleUrl: './view-work-contract.scss'
})
export class ViewWorkContract implements OnInit {
  item: WritableSignal<WorkContract | null> = signal(null);

  constructor(private service: WorkContractsService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.service.getById(id).subscribe(data => this.item.set(data));
  }
}
