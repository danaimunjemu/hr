import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface OrganogramApiEmployee {
  id: number;
  employeeNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  nationalId?: string | null;
  positionId?: number | null;
  positionName?: string | null;
  organizationalUnitId?: number | null;
  organizationalUnitName?: string | null;
  companyName?: string | null;
}

interface OrganogramApiPosition {
  positionId?: number | null;
  positionName?: string | null;
  employees?: OrganogramApiEmployee[] | null;
  subordinates?: Array<OrganogramApiPosition | string | number> | null;
}

export interface OrganogramV2Node {
  id: string;
  parentId?: string;
  employeeId?: number | null;
  employeeNumber?: string;
  imageUrl?: string;
  name: string;
  title: string;
  department: string;
  companyName: string;
  initials: string;
}

@Injectable({ providedIn: 'root' })
export class OrganogramV2Service {
  private readonly baseUrl = `${environment.apiUrl}/organogram`;

  constructor(private readonly http: HttpClient) {}

  getOrganogram(): Observable<OrganogramV2Node[]> {
    return this.http.get<OrganogramApiPosition[]>(this.baseUrl).pipe(
      map((positions) => this.buildNodes(positions)),
    );
  }

  getDepartmentOrganogram(organizationalUnitId: number): Observable<OrganogramV2Node[]> {
    return this.http
      .get<OrganogramApiPosition[]>(`${this.baseUrl}/department/${organizationalUnitId}`)
      .pipe(map((positions) => this.buildNodes(positions)));
  }

  private buildNodes(positions: OrganogramApiPosition[] | null | undefined): OrganogramV2Node[] {
    const items = this.flattenPositionTree(Array.isArray(positions) ? positions : []);
    if (!items.length) {
      return [];
    }

    const indexById = new Map<number, OrganogramApiPosition>();
    const indexByName = new Map<string, OrganogramApiPosition>();
    const childKeys = new Set<string>();

    for (const item of items) {
      const id = Number(item?.positionId || 0);
      if (id) {
        indexById.set(id, item);
      }
      const nameKey = this.normalize(item?.positionName);
      if (nameKey) {
        indexByName.set(nameKey, item);
      }
    }

    for (const item of items) {
      const subordinates = Array.isArray(item?.subordinates) ? item.subordinates : [];
      for (const subordinate of subordinates) {
        const resolved = this.resolveSubordinate(subordinate, indexById, indexByName);
        if (resolved) {
          childKeys.add(this.positionKey(resolved));
        }
      }
    }

    const roots = items.filter((item) => !childKeys.has(this.positionKey(item)));
    const rootItems = roots.length ? roots : items;
    const nodes: OrganogramV2Node[] = [];

    for (const root of rootItems) {
      this.mapPosition(root, undefined, new Set<string>(), indexById, indexByName, nodes);
    }

    return nodes;
  }

  private mapPosition(
    position: OrganogramApiPosition,
    parentId: string | undefined,
    seen: Set<string>,
    indexById: Map<number, OrganogramApiPosition>,
    indexByName: Map<string, OrganogramApiPosition>,
    nodes: OrganogramV2Node[],
  ): void {
    const key = this.positionKey(position);
    if (!key || seen.has(key)) {
      return;
    }

    const nextSeen = new Set(seen);
    nextSeen.add(key);

    const employees = Array.isArray(position?.employees) ? position.employees : [];
    const anchorEmployee = employees[0];
    let anchorNodeId = parentId;

    if (anchorEmployee) {
      const anchor = this.toNode(anchorEmployee, parentId, position);
      nodes.push(anchor);
      anchorNodeId = anchor.id;

      for (const peer of employees.slice(1)) {
        nodes.push(this.toNode(peer, anchorNodeId, position));
      }
    } else {
      const placeholderId = `pos-${key}-placeholder`;
      nodes.push({
        id: placeholderId,
        parentId,
        employeeId: null,
        employeeNumber: 'N/A',
        name: 'Unknown Employee',
        title: this.safeText(position?.positionName, 'N/A'),
        department: 'N/A',
        companyName: 'N/A',
        initials: 'UE',
      });
      anchorNodeId = placeholderId;
    }

    const subordinates = Array.isArray(position?.subordinates) ? position.subordinates : [];
    for (const subordinate of subordinates) {
      const child = this.resolveSubordinate(subordinate, indexById, indexByName);
      if (child) {
        this.mapPosition(child, anchorNodeId, nextSeen, indexById, indexByName, nodes);
      }
    }
  }

  private toNode(
    employee: OrganogramApiEmployee,
    parentId: string | undefined,
    position: OrganogramApiPosition,
  ): OrganogramV2Node {
    const firstName = this.safeText(employee?.firstName, '');
    const lastName = this.safeText(employee?.lastName, '');
    const fullName = this.safeText(`${firstName} ${lastName}`.trim(), 'Unknown Employee');
    const title = this.safeText(employee?.positionName || position?.positionName, 'N/A');
    const department = this.safeText(employee?.organizationalUnitName, 'N/A');
    const companyName = this.safeText(employee?.companyName, 'N/A');

    return {
      id: `emp-${employee.id}`,
      parentId,
      employeeId: Number(employee.id || 0) || null,
      employeeNumber: this.safeText(employee?.employeeNumber, 'N/A'),
      name: fullName,
      title,
      department,
      companyName,
      initials: this.getInitials(firstName, lastName),
    };
  }

  private resolveSubordinate(
    subordinate: OrganogramApiPosition | string | number,
    indexById: Map<number, OrganogramApiPosition>,
    indexByName: Map<string, OrganogramApiPosition>,
  ): OrganogramApiPosition | null {
    if (!subordinate) {
      return null;
    }

    if (typeof subordinate === 'object') {
      const asPosition = subordinate as OrganogramApiPosition;
      return asPosition.positionId || asPosition.positionName ? asPosition : null;
    }

    if (typeof subordinate === 'number') {
      return indexById.get(subordinate) || null;
    }

    return indexByName.get(this.normalize(subordinate)) || null;
  }

  private flattenPositionTree(items: OrganogramApiPosition[]): OrganogramApiPosition[] {
    const result: OrganogramApiPosition[] = [];
    const visited = new Set<string>();

    const walk = (position: OrganogramApiPosition): void => {
      const key = this.positionKey(position);
      if (!key || visited.has(key)) {
        return;
      }
      visited.add(key);
      result.push(position);

      const subordinates = Array.isArray(position?.subordinates) ? position.subordinates : [];
      for (const subordinate of subordinates) {
        if (typeof subordinate === 'object' && subordinate) {
          walk(subordinate as OrganogramApiPosition);
        }
      }
    };

    for (const item of items) {
      walk(item);
    }
    return result;
  }

  private positionKey(position: OrganogramApiPosition | null | undefined): string {
    const id = Number(position?.positionId || 0);
    if (id) {
      return `position-${id}`;
    }
    const name = this.normalize(position?.positionName);
    return name ? `position-${name}` : '';
  }

  private normalize(value: string | null | undefined): string {
    return String(value || '').trim().toLowerCase();
  }

  private safeText(value: string | null | undefined, fallback: string): string {
    const text = String(value || '').trim();
    return text || fallback;
  }

  private getInitials(firstName: string, lastName: string): string {
    const first = String(firstName || '').trim().charAt(0);
    const last = String(lastName || '').trim().charAt(0);
    const initials = `${first}${last}`.toUpperCase().trim();
    return initials || 'NA';
  }
}
