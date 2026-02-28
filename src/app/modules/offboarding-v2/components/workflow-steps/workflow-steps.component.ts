import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WorkflowStatus } from '../../models/workflow-status.model';

@Component({
  selector: 'app-workflow-steps',
  standalone: false,
  templateUrl: './workflow-steps.component.html',
  styleUrl: './workflow-steps.component.scss'
})
export class WorkflowStepsComponent implements OnChanges {
  @Input() workflow: WorkflowStatus | null = null;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workflow']) {
      this.cdr.detectChanges();
    }
  }

  currentIndex(): number {
    const nodes = this.workflow?.nodes ?? [];
    const index = nodes.findIndex((node) => node.status === 'IN_PROGRESS');
    if (index > -1) {
      return index;
    }
    const blocked = nodes.findIndex((node) => node.status === 'BLOCKED');
    if (blocked > -1) {
      return blocked;
    }
    const lastDone = nodes
      .map((node, idx) => ({ node, idx }))
      .filter((entry) => entry.node.status === 'DONE')
      .at(-1);
    return lastDone?.idx ?? 0;
  }

  stepStatus(status: string): 'wait' | 'process' | 'finish' | 'error' {
    if (status === 'DONE') {
      return 'finish';
    }
    if (status === 'BLOCKED') {
      return 'error';
    }
    if (status === 'IN_PROGRESS') {
      return 'process';
    }
    return 'wait';
  }
}
