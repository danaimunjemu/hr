import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveManagementRoutingModule } from './leave-management-routing.module';

@NgModule({
    declarations: [
        // All components in this feature are now standalone
    ],
    imports: [
        CommonModule,
        LeaveManagementRoutingModule
    ]
})
export class LeaveManagementModule { }
