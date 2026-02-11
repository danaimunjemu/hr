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
    data: { breadcrumb: 'Employee Master Data' },
    children: [
      { path: '', redirectTo: 'companies', pathMatch: 'full' },

      // ================================
      // Companies
      // ================================
      {
        path: 'companies',
        data: { breadcrumb: 'Companies' },
        children: [
          { path: '', component: AllCompanies, data: { breadcrumb: 'All' } },
          { path: 'new', component: CreateCompany, data: { breadcrumb: 'Create' } },
          { path: 'view/:id', component: ViewCompany, data: { breadcrumb: 'View' } },
          { path: 'edit/:id', component: EditCompany, data: { breadcrumb: 'Edit' } }
        ]
      },

      // ================================
      // Cost Centers
      // ================================
      {
        path: 'cost-centers',
        data: { breadcrumb: 'Cost Centers' },
        children: [
          { path: '', component: AllCostCenters, data: { breadcrumb: 'All' } },
          { path: 'new', component: CreateCostCenter, data: { breadcrumb: 'Create' } },
          { path: 'view/:id', component: ViewCostCenter, data: { breadcrumb: 'View' } },
          { path: 'edit/:id', component: EditCostCenter, data: { breadcrumb: 'Edit' } }
        ]
      },

      // ================================
      // Employee Groups
      // ================================
      {
        path: 'employee-groups',
        data: { breadcrumb: 'Employee Groups' },
        children: [
          { path: '', component: AllEmployeeGroups, data: { breadcrumb: 'All' } },
          { path: 'new', component: CreateEmployeeGroup, data: { breadcrumb: 'Create' } },
          { path: 'view/:id', component: ViewEmployeeGroup, data: { breadcrumb: 'View' } },
          { path: 'edit/:id', component: EditEmployeeGroup, data: { breadcrumb: 'Edit' } }
        ]
      },

      // Employee Sub Groups
      {
        path: 'employee-sub-groups',
        data: { breadcrumb: 'Employee Sub Groups' },
        children: [
          { path: '', component: AllEmployeeSubGroups, data: { breadcrumb: 'All' } },
          { path: 'new', component: CreateEmployeeSubGroup, data: { breadcrumb: 'Create' } },
          { path: 'view/:id', component: ViewEmployeeSubGroup, data: { breadcrumb: 'View' } },
          { path: 'edit/:id', component: EditEmployeeSubGroup, data: { breadcrumb: 'Edit' } }
        ]
      },

      // Ethnic Groups
      {
        path: 'ethnic-groups',
        data: { breadcrumb: 'Ethnic Groups' },
        children: [
          { path: '', component: AllEthnicGroups, data: { breadcrumb: 'All' } },
          { path: 'new', component: CreateEthnicGroup, data: { breadcrumb: 'Create' } },
          { path: 'view/:id', component: ViewEthnicGroup, data: { breadcrumb: 'View' } },
          { path: 'edit/:id', component: EditEthnicGroup, data: { breadcrumb: 'Edit' } }
        ]
      },

      // Grades
      {
        path: 'grades',
        data: { breadcrumb: 'Grades' },
        children: [
          { path: '', component: AllGrades, data: { breadcrumb: 'All' } },
          { path: 'new', component: CreateGrade, data: { breadcrumb: 'Create' } },
          { path: 'view/:id', component: ViewGrade, data: { breadcrumb: 'View' } },
          { path: 'edit/:id', component: EditGrade, data: { breadcrumb: 'Edit' } }
        ]
      },

      // Job Descriptions
      {
        path: 'job-descriptions',
        data: { breadcrumb: 'Job Descriptions' },
        children: [
          { path: '', component: AllJobDescriptions, data: { breadcrumb: 'All' } },
          { path: 'new', component: CreateJobDescription, data: { breadcrumb: 'Create' } },
          { path: 'view/:id', component: ViewJobDescription, data: { breadcrumb: 'View' } },
          { path: 'edit/:id', component: EditJobDescription, data: { breadcrumb: 'Edit' } }
        ]
      },

      // Organizational Units
      {
        path: 'organizational-units',
        data: { breadcrumb: 'Organizational Units' },
        children: [
          { path: '', component: AllOrganizationalUnits, data: { breadcrumb: 'All' } },
          { path: 'new', component: CreateOrganizationalUnit, data: { breadcrumb: 'Create' } },
          { path: 'view/:id', component: ViewOrganizationalUnit, data: { breadcrumb: 'View' } },
          { path: 'edit/:id', component: EditOrganizationalUnit, data: { breadcrumb: 'Edit' } }
        ]
      },

      // Personnel Areas
      {
        path: 'personnel-areas',
        data: { breadcrumb: 'Personnel Areas' },
        children: [
          { path: '', component: AllPersonnelAreas, data: { breadcrumb: 'All' } },
          { path: 'new', component: CreatePersonnelArea, data: { breadcrumb: 'Create' } },
          { path: 'view/:id', component: ViewPersonnelArea, data: { breadcrumb: 'View' } },
          { path: 'edit/:id', component: EditPersonnelArea, data: { breadcrumb: 'Edit' } }
        ]
      },

      // Personnel Sub Areas
      {
        path: 'personnel-sub-areas',
        data: { breadcrumb: 'Personnel Sub Areas' },
        children: [
          { path: '', component: AllPersonnelSubAreas, data: { breadcrumb: 'All' } },
          { path: 'new', component: CreatePersonnelSubArea, data: { breadcrumb: 'Create' } },
          { path: 'view/:id', component: ViewPersonnelSubArea, data: { breadcrumb: 'View' } },
          { path: 'edit/:id', component: EditPersonnelSubArea, data: { breadcrumb: 'Edit' } }
        ]
      },

      // Positions
      {
        path: 'positions',
        data: { breadcrumb: 'Positions' },
        children: [
          { path: '', component: AllPositions, data: { breadcrumb: 'All' } },
          { path: 'new', component: CreatePosition, data: { breadcrumb: 'Create' } },
          { path: 'view/:id', component: ViewPosition, data: { breadcrumb: 'View' } },
          { path: 'edit/:id', component: EditPosition, data: { breadcrumb: 'Edit' } }
        ]
      },

      // Pay Scale Groups
      {
        path: 'ps-groups',
        data: { breadcrumb: 'Pay Scale Groups' },
        children: [
          { path: '', component: AllPsGroups, data: { breadcrumb: 'All' } },
          { path: 'new', component: CreatePsGroup, data: { breadcrumb: 'Create' } },
          { path: 'view/:id', component: ViewPsGroup, data: { breadcrumb: 'View' } },
          { path: 'edit/:id', component: EditPsGroup, data: { breadcrumb: 'Edit' } }
        ]
      },

      // Work Contracts
      {
        path: 'work-contracts',
        data: { breadcrumb: 'Work Contracts' },
        children: [
          { path: '', component: AllWorkContracts, data: { breadcrumb: 'All' } },
          { path: 'new', component: CreateWorkContract, data: { breadcrumb: 'Create' } },
          { path: 'view/:id', component: ViewWorkContract, data: { breadcrumb: 'View' } },
          { path: 'edit/:id', component: EditWorkContract, data: { breadcrumb: 'Edit' } }
        ]
      },

      // Work Schedule Rules
      {
        path: 'work-schedule-rules',
        data: { breadcrumb: 'Work Schedule Rules' },
        children: [
          { path: '', component: AllWorkScheduleRules, data: { breadcrumb: 'All' } },
          { path: 'new', component: CreateWorkScheduleRule, data: { breadcrumb: 'Create' } },
          { path: 'view/:id', component: ViewWorkScheduleRule, data: { breadcrumb: 'View' } },
          { path: 'edit/:id', component: EditWorkScheduleRule, data: { breadcrumb: 'Edit' } }
        ]
      }

    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
