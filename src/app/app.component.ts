import { Component } from '@angular/core';
import { ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SfdcService } from './sfdc.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [SfdcService]
})

export class AppComponent {
 
  tokenVal = window.location.hash;

  constructor(private eltRef: ElementRef, private http: HttpClient, private sfdcService: SfdcService) {
    this.sfdcService.getAccessToken(this.tokenVal);

    if (!this.sfdcService.oauth) {
      this.sfdcService.init({
        appId: "3MVG9rKhT8ocoxGkMw8Px7.4hVo6Av2SxecF2oPfPvw22k5VW7WemsAVW_HXieze95ZjzBxa2zuCIbFdbm9qX"
        //proxyURL: "https://dev-cors-proxy.herokuapp.com/"
      });
      this.sfdcService.login();

    }

  }


}
