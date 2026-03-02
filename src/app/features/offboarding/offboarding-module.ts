import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { SharedModule } from '../../shared/shared-module';
import { OffboardingRoutingModule } from './offboarding-routing-module';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { OffboardingFormComponent } from './components/offboarding-form/offboarding-form.component';
import { OffboardingCreatePageComponent } from './pages/offboarding-create-page/offboarding-create-page.component';
import { OffboardingDetailsPageComponent } from './pages/offboarding-details-page/offboarding-details-page.component';
import { OffboardingEditPageComponent } from './pages/offboarding-edit-page/offboarding-edit-page.component';
import { OffboardingListPageComponent } from './pages/offboarding-list-page/offboarding-list-page.component';
import { Organo } from './pages/organo/organo';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CapitalizePipe } from '../onboarding/capitalize-pipe';

@NgModule({
  declarations: [
    OffboardingListPageComponent,
    OffboardingCreatePageComponent,
    OffboardingEditPageComponent,
    OffboardingDetailsPageComponent,
    OffboardingFormComponent,
    Organo
  ],
  imports: [
    CommonModule,
    FormsModule,
    // BrowserAnimationsModule,
    ReactiveFormsModule,
    OffboardingRoutingModule,
    AntDesignModules,
    NzStepsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzCardModule,
    NzAlertModule,
    NzResultModule,
    NzIconModule,
    NzGridModule,
    NzSpinModule,
        NzSkeletonModule,
    NzStepsModule,
    NzResultModule,
    NzSegmentedModule,
    NzFloatButtonModule,
    NzListModule,
    ReactiveFormsModule,
    NzSpinModule,
    FormsModule,
    SharedModule,
    NzButtonModule,
    NzAlertModule,
    NzSkeletonModule,
    NzDescriptionsModule,
    NzPageHeaderModule,
    NzProgressModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzStatisticModule,
    NzPaginationModule,
    NzRadioModule,
    NzTabsModule,
    NzDividerModule,
    NzGridModule,
    NzSliderModule,
    NzTabsModule,
    NzEmptyModule,
    NzInputModule,
    NzCommentModule,
    NzIconModule,
    NzTableModule,
    NzCommentModule,
    NzIconModule,
    NzCardModule,
    NzTagModule,
    NzModalModule,
    NzDrawerModule,
    NzPageHeaderModule,
    NzTagModule,
    NzSpaceModule,
    NzGridModule,
    NzDropDownModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzCascaderModule,
    NzAvatarModule,
    NzIconModule,
    NzButtonModule,
    NzTooltipModule,
    NzGridModule,
    NzTreeSelectModule,
    NzInputNumberModule,
    NzModalModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzDividerModule,
    NzDatePickerModule,
    NzDividerModule,
    NzTabsModule,
    SharedModule,
    CapitalizePipe
  ],schemas:[CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA]
})
export class OffboardingModule {}
