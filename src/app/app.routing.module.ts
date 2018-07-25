import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInOidcComponent } from './sigin-oidc.component';


const appRoutes: Routes = [
  { path: 'oauthcallback', component: SignInOidcComponent }
 
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
