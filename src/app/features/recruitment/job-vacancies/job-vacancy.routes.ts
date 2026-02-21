import { Routes } from '@angular/router';

export const JOB_VACANCY_ROUTES: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/job-vacancy-list/job-vacancy-list.component').then(m => m.JobVacancyListComponent),
                data: { breadcrumb: 'List' }
            },
            {
                path: 'create',
                loadComponent: () => import('./pages/job-vacancy-create/job-vacancy-create.component').then(m => m.JobVacancyCreateComponent),
                data: { breadcrumb: 'Create' }
            },
            {
                path: 'requests',
                loadComponent: () => import('./pages/job-vacancy-requests/job-vacancy-requests.component').then(m => m.JobVacancyRequestsComponent),
                data: { breadcrumb: 'Requests' }
            },
            {
                path: 'approvals',
                loadComponent: () => import('./pages/job-vacancy-approvals/job-vacancy-approvals.component').then(m => m.JobVacancyApprovalsComponent),
                data: { breadcrumb: 'Approvals' }
            },
            {
                path: ':id',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/job-vacancy-detail/job-vacancy-detail.component').then(m => m.JobVacancyDetailComponent),
                        data: { breadcrumb: 'Details' }
                    },
                    {
                        path: 'edit',
                        loadComponent: () => import('./pages/job-vacancy-edit/job-vacancy-edit.component').then(m => m.JobVacancyEditComponent),
                        data: { breadcrumb: 'Edit' }
                    }
                ]
            }
        ]
    }
];
