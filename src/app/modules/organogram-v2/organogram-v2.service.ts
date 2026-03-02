import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface OrganogramV2Node {
  id: string;
  parentId?: string;
  name: string;
  title: string;
  imageUrl?: string;
  department?: string;
  _expanded?: boolean;
  _highlighted?: boolean;
  _upToTheRootHighlighted?: boolean;
}

@Injectable({ providedIn: 'root' })
export class OrganogramV2Service {
  private readonly dataSubject = new BehaviorSubject<OrganogramV2Node[]>([]);
  readonly data$ = this.dataSubject.asObservable();

  loadMockData(totalNodes = 10): Observable<OrganogramV2Node[]> {
    const data = this.generateMockData(totalNodes);
    return of(data).pipe(delay(250));
  }

  setData(data: OrganogramV2Node[]): void {
    this.dataSubject.next(data);
  }

  updateData(updater: (data: OrganogramV2Node[]) => OrganogramV2Node[]): void {
    const current = this.dataSubject.getValue();
    this.dataSubject.next(updater([...current]));
  }

  addNode(parentId: string, node: Omit<OrganogramV2Node, 'parentId'>): void {
    this.updateData((data) => [...data, { ...node, parentId }]);
  }

  updateNode(id: string, patch: Partial<OrganogramV2Node>): void {
    this.updateData((data) =>
      data.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  removeNode(id: string): void {
    this.updateData((data) => data.filter((item) => item.id !== id));
  }

  loadAsync(totalNodes = 10): Observable<OrganogramV2Node[]> {
    return this.loadMockData(totalNodes).pipe(
      map((data) => data.map((item) => ({ ...item }))),
    );
  }

  private generateMockData(totalNodes: number): OrganogramV2Node[] {
    const departments = ['Engineering', 'HR', 'Finance', 'Operations', 'Sales', 'Support'];
    const titles = [
      'Chief Executive Officer',
      'Director',
      'Manager',
      'Lead',
      'Specialist',
      'Associate',
    ];
    const nodes: OrganogramV2Node[] = [];
    const rootId = '1';

    nodes.push({
      id: rootId,
      name: 'Alex Morgan',
      title: 'Chief Executive Officer',
      department: 'Executive',
      _expanded: true,
    });

    let idCounter = 1;
    const queue: string[] = [rootId];
    const maxChildrenForRoot = 20;

    while (nodes.length < totalNodes && queue.length > 0) {
      const parentId = queue.shift()!;
      const parentDepth = this.getDepth(nodes, parentId);
      const maxChildren =
        parentId === rootId
          ? maxChildrenForRoot
          : Math.max(2, 6 - Math.min(parentDepth, 4));
      const childrenCount = Math.min(maxChildren, totalNodes - nodes.length);

      for (let i = 0; i < childrenCount; i += 1) {
        if (nodes.length >= totalNodes) break;

        idCounter += 1;
        const department = departments[idCounter % departments.length];

        nodes.push({
          id: `${idCounter}`,
          parentId,
          name: `Employee ${idCounter}`,
          title: titles[idCounter % titles.length],
          department,
          _expanded: parentDepth < 2,
        });

        queue.push(`${idCounter}`);
      }
    }

    return nodes;
  }

  private getDepth(nodes: OrganogramV2Node[], id: string): number {
    const lookup = new Map(nodes.map((item) => [item.id, item]));
    let depth = 0;
    let current = lookup.get(id);

    while (current?.parentId) {
      depth += 1;
      current = lookup.get(current.parentId);
    }

    return depth;
  }
}
