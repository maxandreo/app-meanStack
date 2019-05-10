import {NgModule} from '@angular/core';
import {AngularMaterialModule} from '../angular-material.module';
import {FormsModule} from '@angular/forms';
import {AuthRoutingModule} from './auth-routing.module';

import {LoginComponent} from './login/login.component';
import {SignupComponent} from './signup/signup.component';
import {CommonModule} from '@angular/common';




@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent
  ],
  imports: [
    CommonModule,
    AngularMaterialModule,
    FormsModule,
    AuthRoutingModule
  ]
})
export class AuthModule {}
