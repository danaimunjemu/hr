import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing-module';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { ProfileUserComponent } from './pages/profile-user/profile-user.component';

@NgModule({
  declarations: [ProfileUserComponent],
  imports: [CommonModule, ProfileRoutingModule, AntDesignModules]
})
export class ProfileModule {}

