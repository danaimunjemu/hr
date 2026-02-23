import { Injectable } from '@angular/core';
import {
  OrganogramEmployee,
  OrganogramNode,
  OrganogramPositionResponse
} from './organogram.models';

@Injectable({
  providedIn: 'root'
})
export class OrganogramMapper {
  mapToChart(positions: OrganogramPositionResponse[] | null | undefined): OrganogramNode | null {
    const items = Array.isArray(positions) ? positions : [];
    if (!items.length) {
      return null;
    }

    const indexById = new Map<number, OrganogramPositionResponse>();
    const indexByName = new Map<string, OrganogramPositionResponse>();
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

    const childKeys = new Set<string>();
    for (const item of items) {
      const subordinates = Array.isArray(item?.subordinates) ? item.subordinates : [];
      for (const subordinate of subordinates) {
        const resolved = this.resolveSubordinate(subordinate, indexById, indexByName);
        if (resolved) {
          childKeys.add(this.positionKey(resolved));
        }
      }
    }

    const rootPositions = items.filter((item) => !childKeys.has(this.positionKey(item)));
    const roots = rootPositions.length ? rootPositions : items;

    const children = roots.flatMap((root) =>
      this.mapPosition(root, 0, new Set<string>(), indexById, indexByName)
    );

    if (!children.length) {
      return null;
    }

    if (children.length === 1) {
      return children[0];
    }

    return {
      id: 'org-root',
      name: 'Organisation',
      title: 'N/A',
      department: 'N/A',
      employeeNumber: 'N/A',
      children,
      collapsed: false
    };
  }

  private mapPosition(
    position: OrganogramPositionResponse,
    depth: number,
    seen: Set<string>,
    indexById: Map<number, OrganogramPositionResponse>,
    indexByName: Map<string, OrganogramPositionResponse>
  ): OrganogramNode[] {
    const key = this.positionKey(position);
    if (!key || seen.has(key)) {
      return [];
    }

    const nextSeen = new Set(seen);
    nextSeen.add(key);

    const subordinates = Array.isArray(position?.subordinates) ? position.subordinates : [];
    const childPositions = subordinates
      .map((subordinate) => this.resolveSubordinate(subordinate, indexById, indexByName))
      .filter((item): item is OrganogramPositionResponse => !!item);

    const childNodes = childPositions.flatMap((child) =>
      this.mapPosition(child, depth + 1, nextSeen, indexById, indexByName)
    );

    const employees = Array.isArray(position?.employees) ? position.employees : [];
    if (!employees.length) {
      return [
        this.buildPlaceholderNode(position, childNodes, depth)
      ];
    }

    return employees.map((employee, index) => {
      const nodeChildren = index === 0 ? childNodes : [];
      return this.buildEmployeeNode(employee, position, nodeChildren, depth);
    });
  }

  private buildEmployeeNode(
    employee: OrganogramEmployee,
    position: OrganogramPositionResponse,
    children: OrganogramNode[],
    depth: number
  ): OrganogramNode {
    const fullName = this.fullName(employee);
    const title = this.safeText(employee?.positionName || position?.positionName, 'N/A');
    const department = this.safeText(employee?.organizationalUnitName, 'N/A');
    const employeeNumber = this.safeText(employee?.employeeNumber, 'N/A');
    const employeeId = Number(employee?.id || 0) || null;
    const departmentId = Number(employee?.organizationalUnitId || 0) || null;

    return {
      id: employeeId ? `emp-${employeeId}` : `pos-${this.positionKey(position)}-${employeeNumber}`,
      name: fullName,
      title,
      department,
      employeeNumber,
      employeeId,
      departmentId,
      children,
      collapsed: depth >= 2
    };
  }

  private buildPlaceholderNode(
    position: OrganogramPositionResponse,
    children: OrganogramNode[],
    depth: number
  ): OrganogramNode {
    return {
      id: `pos-${this.positionKey(position)}-placeholder`,
      name: 'Unknown Employee',
      title: this.safeText(position?.positionName, 'N/A'),
      department: 'N/A',
      employeeNumber: 'N/A',
      employeeId: null,
      departmentId: null,
      children,
      collapsed: depth >= 2
    };
  }

  private resolveSubordinate(
    subordinate: OrganogramPositionResponse | string | number,
    indexById: Map<number, OrganogramPositionResponse>,
    indexByName: Map<string, OrganogramPositionResponse>
  ): OrganogramPositionResponse | null {
    if (!subordinate) {
      return null;
    }

    if (typeof subordinate === 'object') {
      const asPosition = subordinate as OrganogramPositionResponse;
      if (asPosition.positionId || asPosition.positionName) {
        return asPosition;
      }
      return null;
    }

    if (typeof subordinate === 'number') {
      return indexById.get(subordinate) || null;
    }

    const nameKey = this.normalize(subordinate);
    return indexByName.get(nameKey) || null;
  }

  private positionKey(position: OrganogramPositionResponse | null | undefined): string {
    const id = Number(position?.positionId || 0);
    if (id) {
      return `position-${id}`;
    }
    const nameKey = this.normalize(position?.positionName);
    return nameKey ? `position-${nameKey}` : '';
  }

  private normalize(value: string | null | undefined): string {
    return String(value || '').trim().toLowerCase();
  }

  private fullName(employee: OrganogramEmployee | null | undefined): string {
    const first = String(employee?.firstName || '').trim();
    const last = String(employee?.lastName || '').trim();
    const full = `${first} ${last}`.trim();
    return full || 'Unknown Employee';
  }

  private safeText(value: string | null | undefined, fallback: string): string {
    const text = String(value || '').trim();
    return text || fallback;
  }
}
