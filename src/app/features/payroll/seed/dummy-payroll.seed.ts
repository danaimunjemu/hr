import { PayrollRecord } from '../models/payroll-record.model';

export const DUMMY_PAYROLL_DATA: PayrollRecord[] = [
    {
        id: '1',
        employeeId: 101,
        employeeName: 'John Doe',
        company: 'Nerdma Tech',
        department: 'Engineering',
        role: 'Senior Developer',
        grossBasic: 55000,
        overtimeHours: 10,
        grossOvertime: 2500,
        paye: 8250,
        leaveDaysTaken: 2,
        leavePayableAmount: 1200,
        period: '2026-02'
    },
    {
        id: '2',
        employeeId: 102,
        employeeName: 'Jane Smith',
        company: 'Nerdma Tech',
        department: 'Sales',
        role: 'Sales Manager',
        grossBasic: 45000,
        overtimeHours: 5,
        grossOvertime: 1250,
        paye: 6750,
        leaveDaysTaken: 0,
        leavePayableAmount: 0,
        period: '2026-02'
    },
    // ... Generating more records to reach 50+
    ...Array.from({ length: 48 }).map((_, i) => ({
        id: (i + 3).toString(),
        employeeId: 103 + i,
        employeeName: `Employee ${103 + i}`,
        company: i % 2 === 0 ? 'Nerdma Tech' : 'Global HR Solutions',
        department: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'][i % 5],
        role: ['Developer', 'Manager', 'Analyst', 'Specialist', 'Admin', 'Consultant'][i % 6],
        grossBasic: 30000 + Math.random() * 40000,
        overtimeHours: Math.floor(Math.random() * 20),
        grossOvertime: Math.floor(Math.random() * 5000),
        paye: 5000 + Math.random() * 10000,
        leaveDaysTaken: Math.floor(Math.random() * 5),
        leavePayableAmount: Math.floor(Math.random() * 2000),
        period: i < 20 ? '2026-01' : '2026-02'
    }))
];
