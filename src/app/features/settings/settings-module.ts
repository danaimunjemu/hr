import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SettingsRoutingModule } from './settings-routing-module';
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
import { SettingsPage } from './pages/settings-page/settings-page';
import { AntDesignModules } from '../../core/modules/antdesign.module';

@NgModule({
  declarations: [
    AllCompanies,
    ViewCompany,
    CreateCompany,
    EditCompany,
    AllCostCenters,
    ViewCostCenter,
    CreateCostCenter,
    EditCostCenter,
    AllEmployeeGroups,
    ViewEmployeeGroup,
    CreateEmployeeGroup,
    EditEmployeeGroup,
    AllEmployeeSubGroups,
    ViewEmployeeSubGroup,
    CreateEmployeeSubGroup,
    EditEmployeeSubGroup,
    AllEthnicGroups,
    ViewEthnicGroup,
    CreateEthnicGroup,
    EditEthnicGroup,
    AllGrades,
    ViewGrade,
    CreateGrade,
    EditGrade,
    AllJobDescriptions,
    ViewJobDescription,
    CreateJobDescription,
    EditJobDescription,
    AllOrganizationalUnits,
    ViewOrganizationalUnit,
    CreateOrganizationalUnit,
    EditOrganizationalUnit,
    AllPersonnelAreas,
    ViewPersonnelArea,
    CreatePersonnelArea,
    EditPersonnelArea,
    AllPersonnelSubAreas,
    ViewPersonnelSubArea,
    CreatePersonnelSubArea,
    EditPersonnelSubArea,
    AllPositions,
    ViewPosition,
    CreatePosition,
    EditPosition,
    AllPsGroups,
    ViewPsGroup,
    CreatePsGroup,
    EditPsGroup,
    AllWorkContracts,
    ViewWorkContract,
    CreateWorkContract,
    EditWorkContract,
    AllWorkScheduleRules,
    ViewWorkScheduleRule,
    CreateWorkScheduleRule,
    EditWorkScheduleRule,
    SettingsPage
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SettingsRoutingModule,
    AntDesignModules
  ]
})
export class SettingsModule { }
