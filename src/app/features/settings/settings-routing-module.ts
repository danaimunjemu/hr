import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsPage } from './pages/settings-page/settings-page';
import { AllCompanies } from './pages/all-companies/all-companies';
import { ViewCompany } from './pages/view-company/view-company';
import { CreateCompany } from './pages/create-company/create-company';
import { EditCompany } from './pages/edit-company/edit-company';
import { AllCostCenters } from './pages/all-cost-centers/all-cost-centers';
import { ViewCostCenter } from './pages/view-cost-center/view-cost-center';
import { CreateCostCenter } from './pages/create-cost-center/create-cost-center';
import { EditCostCenter } from './pages/edit-cost-center/edit-cost-center';
import { AllEmployeeGroups } from './pages/all-employee-groups/all-employee-groups';
import { ViewEmployeeGroup } from './pages/view-employee-group/view-employee-group';
import { CreateEmployeeGroup } from './pages/create-employee-group/create-employee-group';
import { EditEmployeeGroup } from './pages/edit-employee-group/edit-employee-group';
import { AllEmployeeSubGroups } from './pages/all-employee-sub-groups/all-employee-sub-groups';
import { ViewEmployeeSubGroup } from './pages/view-employee-sub-group/view-employee-sub-group';
import { CreateEmployeeSubGroup } from './pages/create-employee-sub-group/create-employee-sub-group';
import { EditEmployeeSubGroup } from './pages/edit-employee-sub-group/edit-employee-sub-group';
import { AllEthnicGroups } from './pages/ethnic-groups/all-ethnic-groups';
import { ViewEthnicGroup } from './pages/ethnic-groups/view-ethnic-group';
import { CreateEthnicGroup } from './pages/ethnic-groups/create-ethnic-group';
import { EditEthnicGroup } from './pages/ethnic-groups/edit-ethnic-group';
import { AllGrades } from './pages/grades/all-grades';
import { ViewGrade } from './pages/grades/view-grade';
import { CreateGrade } from './pages/grades/create-grade';
import { EditGrade } from './pages/grades/edit-grade';
import { AllJobDescriptions } from './pages/job-descriptions/all-job-descriptions';
import { ViewJobDescription } from './pages/job-descriptions/view-job-description';
import { CreateJobDescription } from './pages/job-descriptions/create-job-description';
import { EditJobDescription } from './pages/job-descriptions/edit-job-description';
import { AllOrganizationalUnits } from './pages/organizational-units/all-organizational-units';
import { ViewOrganizationalUnit } from './pages/organizational-units/view-organizational-unit';
import { CreateOrganizationalUnit } from './pages/organizational-units/create-organizational-unit';
import { EditOrganizationalUnit } from './pages/organizational-units/edit-organizational-unit';
import { AllPersonnelAreas } from './pages/personnel-areas/all-personnel-areas';
import { ViewPersonnelArea } from './pages/personnel-areas/view-personnel-area';
import { CreatePersonnelArea } from './pages/personnel-areas/create-personnel-area';
import { EditPersonnelArea } from './pages/personnel-areas/edit-personnel-area';
import { AllPersonnelSubAreas } from './pages/personnel-sub-areas/all-personnel-sub-areas';
import { ViewPersonnelSubArea } from './pages/personnel-sub-areas/view-personnel-sub-area';
import { CreatePersonnelSubArea } from './pages/personnel-sub-areas/create-personnel-sub-area';
import { EditPersonnelSubArea } from './pages/personnel-sub-areas/edit-personnel-sub-area';
import { AllPositions } from './pages/positions/all-positions';
import { ViewPosition } from './pages/positions/view-position';
import { CreatePosition } from './pages/positions/create-position';
import { EditPosition } from './pages/positions/edit-position';
import { AllPsGroups } from './pages/ps-groups/all-ps-groups';
import { ViewPsGroup } from './pages/ps-groups/view-ps-group';
import { CreatePsGroup } from './pages/ps-groups/create-ps-group';
import { EditPsGroup } from './pages/ps-groups/edit-ps-group';
import { AllWorkContracts } from './pages/work-contracts/all-work-contracts';
import { ViewWorkContract } from './pages/work-contracts/view-work-contract';
import { CreateWorkContract } from './pages/work-contracts/create-work-contract';
import { EditWorkContract } from './pages/work-contracts/edit-work-contract';
import { AllWorkScheduleRules } from './pages/work-schedule-rules/all-work-schedule-rules';
import { ViewWorkScheduleRule } from './pages/work-schedule-rules/view-work-schedule-rule';
import { CreateWorkScheduleRule } from './pages/work-schedule-rules/create-work-schedule-rule';
import { EditWorkScheduleRule } from './pages/work-schedule-rules/edit-work-schedule-rule';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage,
    children: [
      { path: '', redirectTo: 'companies', pathMatch: 'full' },
      { path: 'companies', component: AllCompanies },
      { path: 'companies/new', component: CreateCompany },
      { path: 'companies/view/:id', component: ViewCompany },
      { path: 'companies/edit/:id', component: EditCompany },
      { path: 'cost-centers', component: AllCostCenters },
      { path: 'cost-centers/new', component: CreateCostCenter },
      { path: 'cost-centers/view/:id', component: ViewCostCenter },
      { path: 'cost-centers/edit/:id', component: EditCostCenter },
      { path: 'employee-groups', component: AllEmployeeGroups },
      { path: 'employee-groups/new', component: CreateEmployeeGroup },
      { path: 'employee-groups/view/:id', component: ViewEmployeeGroup },
      { path: 'employee-groups/edit/:id', component: EditEmployeeGroup },
      { path: 'employee-sub-groups', component: AllEmployeeSubGroups },
      { path: 'employee-sub-groups/new', component: CreateEmployeeSubGroup },
      { path: 'employee-sub-groups/view/:id', component: ViewEmployeeSubGroup },
      { path: 'employee-sub-groups/edit/:id', component: EditEmployeeSubGroup },
      { path: 'ethnic-groups', component: AllEthnicGroups },
      { path: 'ethnic-groups/new', component: CreateEthnicGroup },
      { path: 'ethnic-groups/view/:id', component: ViewEthnicGroup },
      { path: 'ethnic-groups/edit/:id', component: EditEthnicGroup },
      { path: 'grades', component: AllGrades },
      { path: 'grades/new', component: CreateGrade },
      { path: 'grades/view/:id', component: ViewGrade },
      { path: 'grades/edit/:id', component: EditGrade },
      { path: 'job-descriptions', component: AllJobDescriptions },
      { path: 'job-descriptions/new', component: CreateJobDescription },
      { path: 'job-descriptions/view/:id', component: ViewJobDescription },
      { path: 'job-descriptions/edit/:id', component: EditJobDescription },
      { path: 'organizational-units', component: AllOrganizationalUnits },
      { path: 'organizational-units/new', component: CreateOrganizationalUnit },
      { path: 'organizational-units/view/:id', component: ViewOrganizationalUnit },
      { path: 'organizational-units/edit/:id', component: EditOrganizationalUnit },
      { path: 'personnel-areas', component: AllPersonnelAreas },
      { path: 'personnel-areas/new', component: CreatePersonnelArea },
      { path: 'personnel-areas/view/:id', component: ViewPersonnelArea },
      { path: 'personnel-areas/edit/:id', component: EditPersonnelArea },
      { path: 'personnel-sub-areas', component: AllPersonnelSubAreas },
      { path: 'personnel-sub-areas/new', component: CreatePersonnelSubArea },
      { path: 'personnel-sub-areas/view/:id', component: ViewPersonnelSubArea },
      { path: 'personnel-sub-areas/edit/:id', component: EditPersonnelSubArea },
      { path: 'positions', component: AllPositions },
      { path: 'positions/new', component: CreatePosition },
      { path: 'positions/view/:id', component: ViewPosition },
      { path: 'positions/edit/:id', component: EditPosition },
      { path: 'ps-groups', component: AllPsGroups },
      { path: 'ps-groups/new', component: CreatePsGroup },
      { path: 'ps-groups/view/:id', component: ViewPsGroup },
      { path: 'ps-groups/edit/:id', component: EditPsGroup },
      { path: 'work-contracts', component: AllWorkContracts },
      { path: 'work-contracts/new', component: CreateWorkContract },
      { path: 'work-contracts/view/:id', component: ViewWorkContract },
      { path: 'work-contracts/edit/:id', component: EditWorkContract },
      { path: 'work-schedule-rules', component: AllWorkScheduleRules },
      { path: 'work-schedule-rules/new', component: CreateWorkScheduleRule },
      { path: 'work-schedule-rules/view/:id', component: ViewWorkScheduleRule },
      { path: 'work-schedule-rules/edit/:id', component: EditWorkScheduleRule },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
