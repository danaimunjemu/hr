import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { OnboardingRoutingModule } from './onboarding-routing-module';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { SharedModule } from '../../shared/shared-module';
import { OnboardingPageComponent } from './pages/onboarding-page/onboarding-page.component';

// Ng-Zorro Imports
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { BulkOnboarding } from './pages/bulk-onboarding/bulk-onboarding';
import { BatchList } from './pages/bulk-onboarding/batch-list/batch-list';
import { BatchDetail } from './pages/bulk-onboarding/batch-detail/batch-detail';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzCollapseComponent, NzCollapsePanelComponent } from 'ng-zorro-antd/collapse';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { CapitalizePipe } from './capitalize-pipe';


@NgModule({
  declarations: [
    OnboardingPageComponent,
    BulkOnboarding,
    BatchList,
    BatchDetail
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA],
  imports: [
    CommonModule,
    OnboardingRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AntDesignModules,
    SharedModule,
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
    NzResultModule,
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
    CapitalizePipe
  ]
})
export class OnboardingModule { }
