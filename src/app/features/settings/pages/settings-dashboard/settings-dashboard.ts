import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-settings-dashboard',
    standalone: false,
    templateUrl: './settings-dashboard.html',
    styleUrl: './settings-dashboard.scss'
})
export class SettingsDashboardComponent {
    constructor(private router: Router) { }

    settingsModules = [
        {
            title: 'General Settings',
            description: 'Configure company structure, organizational units, employee groups, and other master data.',
            icon: 'setting',
            color: '#1890ff',
            route: '/app/settings/master-data'
        },
        {
            title: 'Performance Settings',
            description: 'Manage performance review cycles, goal templates, and competency frameworks.',
            icon: 'line-chart',
            color: '#52c41a',
            route: '/app/performance'
        },
        {
            title: 'Time & Leave Settings',
            description: 'Setup leave types, holiday calendars, work schedules, and attendance policies.',
            icon: 'calendar',
            color: '#722ed1',
            route: '/app/time-and-leave'
        }
    ];

    navigateTo(route: string) {
        this.router.navigate([route]);
    }
}
