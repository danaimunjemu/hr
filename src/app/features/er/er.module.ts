import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { ErRoutingModule } from './er-routing.module';

import { FormsModule } from '@angular/forms';
import { ErWorkspaceComponent } from './er-workspace/er-workspace.component';
import { DisciplinaryAnalyticsPage } from './pages/disciplinary-analytics/disciplinary-analytics.page';
import { DisciplinaryRecordsPage } from './pages/disciplinary-records/disciplinary-records.page';
import { HearingsCalendarPage } from './pages/hearings-calendar/hearings-calendar.page';
import { WarningStatusBadgeComponent } from './components/warning-status-badge/warning-status-badge.component';
import { HearingCalendarComponent } from './components/hearing-calendar/hearing-calendar.component';
import { DisciplinarySummaryCardsComponent } from './components/disciplinary-summary-cards/disciplinary-summary-cards.component';

@NgModule({
  declarations: [
    ErWorkspaceComponent,
    DisciplinaryAnalyticsPage,
    DisciplinaryRecordsPage,
    HearingsCalendarPage,
    WarningStatusBadgeComponent,
    HearingCalendarComponent,
    DisciplinarySummaryCardsComponent
  ],
  imports: [
    CommonModule,
    ErRoutingModule,
    AntDesignModules,
    FormsModule
  ],
  exports: [
    WarningStatusBadgeComponent,
    HearingCalendarComponent
  ]
})
export class ErModule { }
