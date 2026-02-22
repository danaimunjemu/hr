import { ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  OrganogramEmployee,
  OrganogramEmployeeProfile,
  OrganogramPositionResponse,
  OrganogramTreeNode
} from './organogram.models';
import { OrganogramService } from './organogram.service';

interface DepartmentOption {
  id: number;
  label: string;
}

@Component({
  selector: 'app-organogram',
  standalone: false,
  templateUrl: './organogram.component.html',
  styleUrl: './organogram.component.scss'
})
export class OrganogramComponent implements OnInit {
  private readonly _loading = signal(false);
  private readonly _profileLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _tree = signal<OrganogramTreeNode[]>([]);
  private readonly _drawerVisible = signal(false);
  private readonly _selectedProfile = signal<OrganogramEmployeeProfile | null>(null);
  private readonly _focusedEmployeeId = signal<number | null>(null);

  searchQuery = '';
  departmentFilter: number | 'ALL' = 'ALL';

  readonly loading = computed(() => this._loading());
  readonly profileLoading = computed(() => this._profileLoading());
  readonly error = computed(() => this._error());
  readonly tree = computed(() => this._tree());
  readonly drawerVisible = computed(() => this._drawerVisible());
  readonly selectedProfile = computed(() => this._selectedProfile());
  readonly focusedEmployeeId = computed(() => this._focusedEmployeeId());
  readonly totalNodes = computed(() => this.flattenTree(this._tree()).length);
  readonly totalEmployees = computed(() =>
    this.flattenTree(this._tree()).reduce((sum, node) => sum + node.employees.length, 0)
  );

  readonly departmentOptions = computed<DepartmentOption[]>(() => {
    const map = new Map<number, string>();
    const nodes = this.flattenTree(this._tree());
    for (const node of nodes) {
      for (const employee of node.employees) {
        const id = Number(employee.organizationalUnitId || 0);
        if (!id) continue;
        const name = String(employee.organizationalUnitName || `Department ${id}`);
        if (!map.has(id)) {
          map.set(id, name);
        }
      }
    }
    return [...map.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id, label]) => ({ id, label }));
  });

  private nodeIndex = new Map<string, OrganogramTreeNode>();
  private employeePathIndex = new Map<number, string[]>();

  constructor(
    private organogramService: OrganogramService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrganogram();
  }

  loadOrganogram(): void {
    this._loading.set(true);
    this._error.set(null);

    // MOCK DATA
   const mock: OrganogramPositionResponse[] = [
  // EXECUTIVE
  {
    positionId: 1,
    positionName: 'Chief Executive Officer',
    employees: [
      {
        id: 101,
        employeeNumber: 'EMP-001',
        firstName: 'Tendai',
        lastName: 'Moyo',
        positionName: 'Chief Executive Officer',
        organizationalUnitName: 'Executive Office',
        organizationalUnitId: 10
      }
    ],
    subordinates: [
      'Chief Operating Officer',
      'Chief Financial Officer',
      'Chief Technology Officer',
      'Chief Human Resources Officer'
    ]
  },

  {
    positionId: 2,
    positionName: 'Chief Operating Officer',
    employees: [
      {
        id: 102,
        employeeNumber: 'EMP-002',
        firstName: 'Alex',
        lastName: 'Mutsvairo',
        positionName: 'Chief Operating Officer',
        organizationalUnitName: 'Operations',
        organizationalUnitId: 11
      }
    ],
    subordinates: ['Head of Retail Banking', 'Head of Corporate Banking', 'Head of Operations Support']
  },

  {
    positionId: 3,
    positionName: 'Chief Financial Officer',
    employees: [
      {
        id: 103,
        employeeNumber: 'EMP-003',
        firstName: 'Rudo',
        lastName: 'Chikafu',
        positionName: 'Chief Financial Officer',
        organizationalUnitName: 'Finance',
        organizationalUnitId: 20
      }
    ],
    subordinates: ['Head of Finance', 'Head of Treasury']
  },

  {
    positionId: 4,
    positionName: 'Chief Technology Officer',
    employees: [
      {
        id: 104,
        employeeNumber: 'EMP-004',
        firstName: 'Kudzai',
        lastName: 'Gwandira',
        positionName: 'Chief Technology Officer',
        organizationalUnitName: 'Technology',
        organizationalUnitId: 30
      }
    ],
    subordinates: ['Head of Software Engineering', 'Head of Infrastructure', 'Head of IT Governance']
  },

  {
    positionId: 5,
    positionName: 'Chief Human Resources Officer',
    employees: [
      {
        id: 105,
        employeeNumber: 'EMP-005',
        firstName: 'Memory',
        lastName: 'Mhlanga',
        positionName: 'Chief Human Resources Officer',
        organizationalUnitName: 'Human Resources',
        organizationalUnitId: 40
      }
    ],
    subordinates: ['Head of HR Operations', 'Head of Talent & Culture']
  },

  // COO BRANCH
  {
    positionId: 10,
    positionName: 'Head of Retail Banking',
    employees: [
      {
        id: 201,
        employeeNumber: 'EMP-010',
        firstName: 'Tafadzwa',
        lastName: 'Sibanda',
        positionName: 'Head of Retail Banking',
        organizationalUnitName: 'Retail Banking',
        organizationalUnitId: 110
      }
    ],
    subordinates: ['Branch Manager - Harare', 'Branch Manager - Bulawayo']
  },

  {
    positionId: 11,
    positionName: 'Branch Manager - Harare',
    employees: [
      {
        id: 202,
        employeeNumber: 'EMP-011',
        firstName: 'Nyasha',
        lastName: 'Moyo',
        positionName: 'Branch Manager - Harare',
        organizationalUnitName: 'Harare Branch',
        organizationalUnitId: 111
      }
    ],
    subordinates: ['Customer Service Supervisor - Harare', 'Teller Supervisor - Harare']
  },

  {
    positionId: 12,
    positionName: 'Customer Service Supervisor - Harare',
    employees: [
      {
        id: 203,
        employeeNumber: 'EMP-012',
        firstName: 'Michelle',
        lastName: 'Gondo',
        positionName: 'Customer Service Supervisor',
        organizationalUnitName: 'Harare Branch',
        organizationalUnitId: 111
      }
    ],
    subordinates: []
  },

  {
    positionId: 13,
    positionName: 'Teller Supervisor - Harare',
    employees: [
      {
        id: 204,
        employeeNumber: 'EMP-013',
        firstName: 'Raymond',
        lastName: 'Chari',
        positionName: 'Teller Supervisor',
        organizationalUnitName: 'Harare Branch',
        organizationalUnitId: 111
      }
    ],
    subordinates: []
  },

  {
    positionId: 14,
    positionName: 'Branch Manager - Bulawayo',
    employees: [
      {
        id: 205,
        employeeNumber: 'EMP-014',
        firstName: 'Lerato',
        lastName: 'Ncube',
        positionName: 'Branch Manager - Bulawayo',
        organizationalUnitName: 'Bulawayo Branch',
        organizationalUnitId: 112
      }
    ],
    subordinates: ['Customer Service Supervisor - Bulawayo', 'Teller Supervisor - Bulawayo']
  },

  {
    positionId: 15,
    positionName: 'Customer Service Supervisor - Bulawayo',
    employees: [
      {
        id: 206,
        employeeNumber: 'EMP-015',
        firstName: 'Innocent',
        lastName: 'Mashingaidze',
        positionName: 'Customer Service Supervisor',
        organizationalUnitName: 'Bulawayo Branch',
        organizationalUnitId: 112
      }
    ],
    subordinates: []
  },

  {
    positionId: 16,
    positionName: 'Teller Supervisor - Bulawayo',
    employees: [
      {
        id: 207,
        employeeNumber: 'EMP-016',
        firstName: 'Rutendo',
        lastName: 'Gavi',
        positionName: 'Teller Supervisor',
        organizationalUnitName: 'Bulawayo Branch',
        organizationalUnitId: 112
      }
    ],
    subordinates: []
  },

  {
    positionId: 17,
    positionName: 'Head of Corporate Banking',
    employees: [
      {
        id: 208,
        employeeNumber: 'EMP-017',
        firstName: 'Trevor',
        lastName: 'Mawere',
        positionName: 'Head of Corporate Banking',
        organizationalUnitName: 'Corporate Banking',
        organizationalUnitId: 120
      }
    ],
    subordinates: ['Corporate Relationship Manager - Mining', 'Corporate Relationship Manager - Agriculture']
  },

  {
    positionId: 18,
    positionName: 'Corporate Relationship Manager - Mining',
    employees: [
      {
        id: 209,
        employeeNumber: 'EMP-018',
        firstName: 'Tatenda',
        lastName: 'Makoni',
        positionName: 'Corporate Relationship Manager - Mining',
        organizationalUnitName: 'Corporate Banking',
        organizationalUnitId: 120
      }
    ],
    subordinates: []
  },

  {
    positionId: 19,
    positionName: 'Corporate Relationship Manager - Agriculture',
    employees: [
      {
        id: 210,
        employeeNumber: 'EMP-019',
        firstName: 'Samantha',
        lastName: 'Mutasa',
        positionName: 'Corporate Relationship Manager - Agriculture',
        organizationalUnitName: 'Corporate Banking',
        organizationalUnitId: 120
      }
    ],
    subordinates: []
  },

  {
    positionId: 20,
    positionName: 'Head of Operations Support',
    employees: [
      {
        id: 211,
        employeeNumber: 'EMP-020',
        firstName: 'Blessing',
        lastName: 'Madziva',
        positionName: 'Head of Operations Support',
        organizationalUnitName: 'Operations Support',
        organizationalUnitId: 130
      }
    ],
    subordinates: ['Back Office Manager', 'Reconciliations Manager']
  },

  {
    positionId: 21,
    positionName: 'Back Office Manager',
    employees: [
      {
        id: 212,
        employeeNumber: 'EMP-021',
        firstName: 'Vimbai',
        lastName: 'Chirwa',
        positionName: 'Back Office Manager',
        organizationalUnitName: 'Operations Support',
        organizationalUnitId: 130
      }
    ],
    subordinates: []
  },

  {
    positionId: 22,
    positionName: 'Reconciliations Manager',
    employees: [
      {
        id: 213,
        employeeNumber: 'EMP-022',
        firstName: 'Nigel',
        lastName: 'Mhaka',
        positionName: 'Reconciliations Manager',
        organizationalUnitName: 'Operations Support',
        organizationalUnitId: 130
      }
    ],
    subordinates: []
  },

  // CFO BRANCH
  {
    positionId: 30,
    positionName: 'Head of Finance',
    employees: [
      {
        id: 301,
        employeeNumber: 'EMP-030',
        firstName: 'Rudo',
        lastName: 'Chikafu',
        positionName: 'Head of Finance',
        organizationalUnitName: 'Finance',
        organizationalUnitId: 20
      }
    ],
    subordinates: ['Senior Accountant', 'Management Accountant']
  },

  {
    positionId: 31,
    positionName: 'Senior Accountant',
    employees: [
      {
        id: 302,
        employeeNumber: 'EMP-031',
        firstName: 'Brian',
        lastName: 'Ncube',
        positionName: 'Senior Accountant',
        organizationalUnitName: 'Finance',
        organizationalUnitId: 20
      }
    ],
    subordinates: []
  },

  {
    positionId: 32,
    positionName: 'Management Accountant',
    employees: [
      {
        id: 303,
        employeeNumber: 'EMP-032',
        firstName: 'Nyasha',
        lastName: 'Moyo',
        positionName: 'Management Accountant',
        organizationalUnitName: 'Finance',
        organizationalUnitId: 20
      }
    ],
    subordinates: []
  },

  {
    positionId: 33,
    positionName: 'Head of Treasury',
    employees: [
      {
        id: 304,
        employeeNumber: 'EMP-033',
        firstName: 'Arthur',
        lastName: 'Madondo',
        positionName: 'Head of Treasury',
        organizationalUnitName: 'Treasury',
        organizationalUnitId: 21
      }
    ],
    subordinates: ['Treasury Dealer', 'Liquidity Risk Manager']
  },

  {
    positionId: 34,
    positionName: 'Treasury Dealer',
    employees: [
      {
        id: 305,
        employeeNumber: 'EMP-034',
        firstName: 'Chiedza',
        lastName: 'Munyoro',
        positionName: 'Treasury Dealer',
        organizationalUnitName: 'Treasury',
        organizationalUnitId: 21
      }
    ],
    subordinates: []
  },

  {
    positionId: 35,
    positionName: 'Liquidity Risk Manager',
    employees: [
      {
        id: 306,
        employeeNumber: 'EMP-035',
        firstName: 'Gift',
        lastName: 'Chikumba',
        positionName: 'Liquidity Risk Manager',
        organizationalUnitName: 'Treasury',
        organizationalUnitId: 21
      }
    ],
    subordinates: []
  },

  // CTO BRANCH
  {
    positionId: 40,
    positionName: 'Head of Software Engineering',
    employees: [
      {
        id: 401,
        employeeNumber: 'EMP-040',
        firstName: 'Chipo',
        lastName: 'Dube',
        positionName: 'Head of Software Engineering',
        organizationalUnitName: 'Technology',
        organizationalUnitId: 30
      }
    ],
    subordinates: ['Senior Software Engineer', 'QA Lead']
  },

  {
    positionId: 41,
    positionName: 'Senior Software Engineer',
    employees: [
      {
        id: 402,
        employeeNumber: 'EMP-041',
        firstName: 'Tariro',
        lastName: 'Matiza',
        positionName: 'Senior Software Engineer',
        organizationalUnitName: 'Technology',
        organizationalUnitId: 30
      }
    ],
    subordinates: []
  },

  {
    positionId: 42,
    positionName: 'QA Lead',
    employees: [
      {
        id: 403,
        employeeNumber: 'EMP-042',
        firstName: 'Praise',
        lastName: 'Hove',
        positionName: 'QA Lead',
        organizationalUnitName: 'Technology',
        organizationalUnitId: 30
      }
    ],
    subordinates: []
  },

  {
    positionId: 43,
    positionName: 'Head of Infrastructure',
    employees: [
      {
        id: 404,
        employeeNumber: 'EMP-043',
        firstName: 'Tafadzwa',
        lastName: 'Sibanda',
        positionName: 'Head of Infrastructure',
        organizationalUnitName: 'Technology',
        organizationalUnitId: 31
      }
    ],
    subordinates: ['Network Engineer', 'Systems Administrator']
  },

  {
    positionId: 44,
    positionName: 'Network Engineer',
    employees: [
      {
        id: 405,
        employeeNumber: 'EMP-044',
        firstName: 'Nigel',
        lastName: 'Gumbo',
        positionName: 'Network Engineer',
        organizationalUnitName: 'Technology',
        organizationalUnitId: 31
      }
    ],
    subordinates: []
  },

  {
    positionId: 45,
    positionName: 'Systems Administrator',
    employees: [
      {
        id: 406,
        employeeNumber: 'EMP-045',
        firstName: 'Lisa',
        lastName: 'Mutizwa',
        positionName: 'Systems Administrator',
        organizationalUnitName: 'Technology',
        organizationalUnitId: 31
      }
    ],
    subordinates: []
  },

  {
    positionId: 46,
    positionName: 'Head of IT Governance',
    employees: [
      {
        id: 407,
        employeeNumber: 'EMP-046',
        firstName: 'Farai',
        lastName: 'Marecha',
        positionName: 'Head of IT Governance',
        organizationalUnitName: 'Technology',
        organizationalUnitId: 32
      }
    ],
    subordinates: ['IT Risk Officer', 'IT Compliance Officer']
  },

  {
    positionId: 47,
    positionName: 'IT Risk Officer',
    employees: [
      {
        id: 408,
        employeeNumber: 'EMP-047',
        firstName: 'Takudzwa',
        lastName: 'Mudzengi',
        positionName: 'IT Risk Officer',
        organizationalUnitName: 'Technology',
        organizationalUnitId: 32
      }
    ],
    subordinates: []
  },

  {
    positionId: 48,
    positionName: 'IT Compliance Officer',
    employees: [
      {
        id: 409,
        employeeNumber: 'EMP-048',
        firstName: 'Ropafadzo',
        lastName: 'Nhari',
        positionName: 'IT Compliance Officer',
        organizationalUnitName: 'Technology',
        organizationalUnitId: 32
      }
    ],
    subordinates: []
  },

  // CHRO BRANCH
  {
    positionId: 50,
    positionName: 'Head of HR Operations',
    employees: [
      {
        id: 501,
        employeeNumber: 'EMP-050',
        firstName: 'Sandra',
        lastName: 'Mutasa',
        positionName: 'Head of HR Operations',
        organizationalUnitName: 'Human Resources',
        organizationalUnitId: 40
      }
    ],
    subordinates: ['HR Business Partner', 'Payroll Manager']
  },

  {
    positionId: 51,
    positionName: 'HR Business Partner',
    employees: [
      {
        id: 502,
        employeeNumber: 'EMP-051',
        firstName: 'Farai',
        lastName: 'Marecha',
        positionName: 'HR Business Partner',
        organizationalUnitName: 'Human Resources',
        organizationalUnitId: 40
      }
    ],
    subordinates: []
  },

  {
    positionId: 52,
    positionName: 'Payroll Manager',
    employees: [
      {
        id: 503,
        employeeNumber: 'EMP-052',
        firstName: 'Kudzai',
        lastName: 'Marechera',
        positionName: 'Payroll Manager',
        organizationalUnitName: 'Human Resources',
        organizationalUnitId: 40
      }
    ],
    subordinates: []
  },

  {
    positionId: 53,
    positionName: 'Head of Talent & Culture',
    employees: [
      {
        id: 504,
        employeeNumber: 'EMP-053',
        firstName: 'Sibongile',
        lastName: 'Ncube',
        positionName: 'Head of Talent & Culture',
        organizationalUnitName: 'Human Resources',
        organizationalUnitId: 41
      }
    ],
    subordinates: ['Talent Acquisition Lead', 'Learning & Development Lead']
  },

  {
    positionId: 54,
    positionName: 'Talent Acquisition Lead',
    employees: [
      {
        id: 505,
        employeeNumber: 'EMP-054',
        firstName: 'Patience',
        lastName: 'Moyo',
        positionName: 'Talent Acquisition Lead',
        organizationalUnitName: 'Human Resources',
        organizationalUnitId: 41
      }
    ],
    subordinates: []
  },

  {
    positionId: 55,
    positionName: 'Learning & Development Lead',
    employees: [
      {
        id: 506,
        employeeNumber: 'EMP-055',
        firstName: 'Simba',
        lastName: 'Chigova',
        positionName: 'Learning & Development Lead',
        organizationalUnitName: 'Human Resources',
        organizationalUnitId: 41
      }
    ],
    subordinates: []
  }
];


    this.applyTreeData(mock);
    this._loading.set(false);
    this.cdr.detectChanges();

    // REAL API (keep for later)
    // this.organogramService.getOrganogram().subscribe({
    //   next: (response) => {
    //     this.applyTreeData(response);
    //     this._loading.set(false);
    //     this.cdr.detectChanges();
    //   },
    //   error: (err) => {
    //     this._tree.set([]);
    //     this._loading.set(false);
    //     this._error.set(err?.error?.message || 'Failed to load organogram.');
    //     this.cdr.detectChanges();
    //   }
    // });
  }

  onDepartmentChange(value: number | 'ALL'): void {
    this.departmentFilter = value;
    // with mock data we just reload the full tree
    if (value === 'ALL') {
      this.loadOrganogram();
      return;
    }

    // simple client-side filter on department for mock
    const allNodes = this.flattenTree(this._tree());
    const deptNodes = allNodes.filter((n) =>
      n.employees.some((e) => Number(e.organizationalUnitId) === Number(value))
    );
    // rebuild a minimal tree with those nodes as roots (demo only)
    this._tree.set(deptNodes);
    this.rebuildIndexes(deptNodes);
    this._focusedEmployeeId.set(null);
  }

  onSearch(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this._focusedEmployeeId.set(null);
      return;
    }

    const nodes = this.flattenTree(this._tree());
    for (const node of nodes) {
      for (const emp of node.employees) {
        const name = this.employeeFullName(emp).toLowerCase();
        const empNo = String(emp.employeeNumber || '').toLowerCase();
        if (name.includes(query) || empNo.includes(query)) {
          this._focusedEmployeeId.set(emp.id);
          const path = this.employeePathIndex.get(emp.id) || [];
          this.expandPath(path);
          this.cdr.detectChanges();
          return;
        }
      }
    }

    this.message.warning('No employee found for that search.');
  }

  toggleNode(node: OrganogramTreeNode): void {
    node.collapsed = !node.collapsed;
  }

  openProfile(employee: OrganogramEmployee): void {
    if (!employee?.id) return;
    this._profileLoading.set(true);
    this._drawerVisible.set(true);

    // For mock, just build a profile locally
    const profile: OrganogramEmployeeProfile = {
      id: employee.id,
      employeeNumber: employee.employeeNumber,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: null,
      organizationalUnitName: employee.organizationalUnitName,
      positionName: employee.positionName,
      employmentStatus: 'Active'
    };
    this._selectedProfile.set(profile);
    this._profileLoading.set(false);
    this.cdr.detectChanges();

    // REAL API (later)
    // this.organogramService.getEmployeeProfile(employee.id).subscribe({ ... });
  }

  closeProfile(): void {
    this._drawerVisible.set(false);
  }

  trackNode(_: number, node: OrganogramTreeNode): string {
    return node.key;
  }

  trackEmployee(_: number, employee: OrganogramEmployee): number {
    return employee.id;
  }

  employeeFullName(employee: OrganogramEmployee | OrganogramEmployeeProfile | null): string {
    const first = String(employee?.firstName || '').trim();
    const last = String(employee?.lastName || '').trim();
    const full = `${first} ${last}`.trim();
    return full || 'Unknown Employee';
  }

  private applyTreeData(response: OrganogramPositionResponse[]): void {
    const tree = this.buildTree(response || []);
    this._tree.set(tree);
    this.rebuildIndexes(tree);
    this._focusedEmployeeId.set(null);
  }

  private buildTree(data: OrganogramPositionResponse[]): OrganogramTreeNode[] {
    this.nodeIndex.clear();

    const byName = new Map<string, OrganogramTreeNode>();
    const nodes: OrganogramTreeNode[] = data.map((item) => {
      const key = this.nodeKey(item);
      const node: OrganogramTreeNode = {
        key,
        positionId: Number(item.positionId || 0),
        positionName: String(item.positionName || 'N/A'),
        employees: Array.isArray(item.employees) ? item.employees : [],
        children: [],
        collapsed: false,
        parentKey: null,
        depth: 0
      };
      this.nodeIndex.set(key, node);
      byName.set(this.normalize(item.positionName), node);
      return node;
    });

    for (const item of data) {
      const parent = this.nodeIndex.get(this.nodeKey(item));
      if (!parent) continue;

      const childSet = new Set<string>();
      for (const subordinate of item.subordinates || []) {
        const child =
          byName.get(this.normalize(subordinate)) ||
          this.nodeIndex.get(`position-${Number(subordinate)}`) ||
          null;

        if (!child || child.key === parent.key || childSet.has(child.key)) {
          continue;
        }
        child.parentKey = parent.key;
        parent.children.push(child);
        childSet.add(child.key);
      }
    }

    const roots = nodes.filter((node) => !node.parentKey);
    const treeRoots = roots.length ? roots : nodes;
    for (const root of treeRoots) {
      this.applyDepth(root, 0, new Set<string>());
    }
    return treeRoots;
  }

  private rebuildIndexes(tree: OrganogramTreeNode[]): void {
    this.employeePathIndex.clear();
    for (const root of tree) {
      this.indexEmployees(root, [], new Set<string>());
    }
  }

  private indexEmployees(node: OrganogramTreeNode, path: string[], seen: Set<string>): void {
    if (seen.has(node.key)) return;
    seen.add(node.key);

    const nextPath = [...path, node.key];
    for (const employee of node.employees) {
      if (employee?.id) {
        this.employeePathIndex.set(employee.id, nextPath);
      }
    }
    for (const child of node.children) {
      this.indexEmployees(child, nextPath, new Set<string>(seen));
    }
  }

  private expandPath(path: string[]): void {
    for (const key of path) {
      const node = this.nodeIndex.get(key);
      if (node) {
        node.collapsed = false;
      }
    }
  }

  private applyDepth(node: OrganogramTreeNode, depth: number, seen: Set<string>): void {
    if (seen.has(node.key)) return;
    seen.add(node.key);
    node.depth = depth;
    node.collapsed = depth > 0;
    for (const child of node.children) {
      this.applyDepth(child, depth + 1, new Set<string>(seen));
    }
  }

  private nodeKey(node: OrganogramPositionResponse): string {
    if (node.positionId) {
      return `position-${node.positionId}`;
    }
    return `position-${this.normalize(node.positionName)}`;
  }

  private normalize(value: string): string {
    return String(value || '').trim().toLowerCase();
  }

  private flattenTree(tree: OrganogramTreeNode[]): OrganogramTreeNode[] {
    const output: OrganogramTreeNode[] = [];
    const walk = (node: OrganogramTreeNode, seen: Set<string>) => {
      if (seen.has(node.key)) return;
      seen.add(node.key);
      output.push(node);
      for (const child of node.children) {
        walk(child, new Set<string>(seen));
      }
    };
    for (const root of tree) {
      walk(root, new Set<string>());
    }
    return output;
  }

  private extractEmployeeId(result: unknown): number | null {
    const fromItem = (item: any): number | null => {
      const direct = Number(item?.id || 0);
      if (direct) return direct;
      const nested = Number(item?.employee?.id || 0);
      if (nested) return nested;
      const nestedArray = Number(item?.employees?.[0]?.id || 0);
      if (nestedArray) return nestedArray;
      return null;
    };

    if (Array.isArray(result)) {
      for (const item of result) {
        const found = fromItem(item);
        if (found) return found;
      }
      return null;
    }

    return fromItem(result);
  }
}
