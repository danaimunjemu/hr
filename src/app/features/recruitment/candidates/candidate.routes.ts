import { Routes } from '@angular/router';
import { CandidateListComponent } from './pages/candidate-list/candidate-list.component';
import { CandidateCreateComponent } from './pages/candidate-create/candidate-create.component';
import { CandidateDetailComponent } from './pages/candidate-detail/candidate-detail.component';

export const CANDIDATE_ROUTES: Routes = [
    { path: '', component: CandidateListComponent },
    { path: 'create', component: CandidateCreateComponent },
    { path: ':id', component: CandidateDetailComponent },
    { path: 'edit/:id', component: CandidateCreateComponent }
];
