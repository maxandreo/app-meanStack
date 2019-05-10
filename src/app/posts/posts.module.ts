import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {AngularMaterialModule} from '../angular-material.module';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

import {PostListComponent} from './post-list/post-list.component';
import {PostCreateComponent} from './post-create/post-create.component';

@NgModule({
  declarations: [
    PostCreateComponent,
    PostListComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    RouterModule
  ]
})
export class PostsModule { }
