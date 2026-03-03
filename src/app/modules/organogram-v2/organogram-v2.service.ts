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

interface CompanyAEmployee {
  employeeId: number;
  fullName?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  directManager?: string | null;
  directReports?: CompanyAEmployee[] | null;
}

interface CompanyARole {
  companyRoleId?: number | null;
  roleName?: string | null;
  employees?: CompanyAEmployee[] | null;
}

interface CompanyARoleGroup {
  level?: number | null;
  roles?: CompanyARole[] | null;
}

interface CompanyAOrganogramResponse {
  companyId?: number | null;
  companyName?: string | null;
  rolesGroupedByLevel?: CompanyARoleGroup[] | null;
  employeesTree?: CompanyAEmployee[] | null;
  subsidiaries?: Array<string | { companyId?: number | null; companyName?: string | null }> | null;
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
export interface Company {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string | null;
  name: string;
  workLocation: string;
  country: string;
  code: string;
  parentCompany: string | null;
  subsidiaries: string[];
}

@Injectable({ providedIn: 'root' })
export class OrganogramV2Service {
  private readonly baseUrl = `${environment.apiUrl}/organogram`;
    private readonly companyUrl = `${environment.apiUrl}/company`;

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.companyUrl);
  }
  constructor(private readonly http: HttpClient) {}

  getOrganogram(): Observable<OrganogramV2Node[]> {
    return this.http.get<OrganogramApiPosition[]>(this.baseUrl).pipe(
      map((positions) => this.buildNodes(positions)),
    );
  }

  getCompanyOrganogram(companyId: number): Observable<OrganogramV2Node[]> {
    return this.http
      .get<OrganogramApiPosition[] | CompanyAOrganogramResponse>(`${this.baseUrl}/companyB/${companyId}`)
      .pipe(map((payload) => this.buildCompanyNodes(payload)));
  }

  getDepartmentOrganogram(organizationalUnitId: number): Observable<OrganogramV2Node[]> {
    return this.http
      .get<OrganogramApiPosition[]>(`${this.baseUrl}/department/${organizationalUnitId}`)
      .pipe(map((positions) => this.buildNodes(positions)));
  }

  private buildCompanyNodes(
    payload: OrganogramApiPosition[] | CompanyAOrganogramResponse | null | undefined,
  ): OrganogramV2Node[] {
    if (Array.isArray(payload)) {
      return this.buildNodes(payload);
    }

    if (
      payload &&
      (Array.isArray(payload.rolesGroupedByLevel) || Array.isArray(payload.employeesTree))
    ) {
      return this.buildNodesFromCompanyA(payload);
    }

    return [];
  }

  private buildNodesFromCompanyA(payload: CompanyAOrganogramResponse): OrganogramV2Node[] {
    const companyName = this.safeText(payload.companyName, 'N/A');
    const allEmployees = new Map<number, CompanyAEmployee>();
    const parentByEmployeeId = new Map<number, number | undefined>();

    const upsert = (employee: CompanyAEmployee): void => {
      const id = Number(employee?.employeeId || 0);
      if (!id) {
        return;
      }
      const existing = allEmployees.get(id);
      allEmployees.set(id, {
        employeeId: id,
        fullName: this.safeText(employee.fullName, existing?.fullName || 'Unknown Employee'),
        jobTitle: this.safeText(employee.jobTitle, existing?.jobTitle || 'N/A'),
        department: this.safeText(employee.department, existing?.department || 'N/A'),
        directManager: this.safeText(employee.directManager, existing?.directManager || ''),
        directReports: Array.isArray(employee.directReports) ? employee.directReports : [],
      });
    };

    const walkWithManager = (
      employee: CompanyAEmployee,
      managerId: number | undefined,
      seen: Set<number>,
    ): void => {
      const id = Number(employee?.employeeId || 0);
      if (!id || seen.has(id)) {
        return;
      }

      upsert(employee);
      const existingParent = parentByEmployeeId.get(id);
      if (managerId !== undefined) {
        if (existingParent === undefined) {
          parentByEmployeeId.set(id, managerId);
        }
      } else if (!parentByEmployeeId.has(id)) {
        parentByEmployeeId.set(id, undefined);
      }

      const nextSeen = new Set(seen);
      nextSeen.add(id);
      const reports = Array.isArray(employee.directReports) ? employee.directReports : [];
      for (const report of reports) {
        walkWithManager(report, id, nextSeen);
      }
    };

    if (Array.isArray(payload.employeesTree) && payload.employeesTree.length) {
      for (const employee of payload.employeesTree) {
        walkWithManager(employee, undefined, new Set<number>());
      }
    } else {
      for (const group of payload.rolesGroupedByLevel || []) {
        for (const role of group.roles || []) {
          for (const employee of role.employees || []) {
            walkWithManager(employee, undefined, new Set<number>());
          }
        }
      }
    }

    if (!allEmployees.size) {
      return [];
    }

    const nodes: OrganogramV2Node[] = [];
    const seenNodes = new Set<string>();

    for (const employee of allEmployees.values()) {
      const id = Number(employee.employeeId || 0);
      if (!id) {
        continue;
      }
      const nodeId = `emp-${id}`;
      if (seenNodes.has(nodeId)) {
        continue;
      }

      const managerId = parentByEmployeeId.get(id);
      const fullName = this.safeText(employee.fullName, 'Unknown Employee');
      const [firstName, ...rest] = fullName.split(/\s+/).filter(Boolean);
      const lastName = rest.join(' ');

      nodes.push({
        id: nodeId,
        parentId: managerId ? `emp-${managerId}` : undefined,
        employeeId: id,
        employeeNumber: 'N/A',
        name: fullName,
        title: this.safeText(employee.jobTitle, 'N/A'),
        department: this.safeText(employee.department, 'N/A'),
        companyName,
        initials: this.getInitials(firstName || '', lastName || ''),
      });
      seenNodes.add(nodeId);
    }

    return nodes;
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
