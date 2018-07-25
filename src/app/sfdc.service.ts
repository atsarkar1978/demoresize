import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class SfdcService {

  constructor(private http: HttpClient) { console.log("servicefile"); }

  oauth: any;
  loginURL: string = 'https://login.salesforce.com';
  appId: string = '3MVG9rKhT8ocoxGkMw8Px7.4hVo6Av2SxecF2oPfPvw22k5VW7WemsAVW_HXieze95ZjzBxa2zuCIbFdbm9qX';
  apiVersion: string = 'v35.0';

  context = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));
  serverURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
  baseURL = this.serverURL + this.context;
  proxyURL = this.baseURL
  //proxyURL = 'https://dev-cors-proxy.herokuapp.com/';
  oauthCallbackURL: string = this.baseURL + '/oauthcallback';
  useProxy = false;
  userData: any;

  getRequestBaseURL(){
    let url;
    if (this.useProxy) {
      url = this.proxyURL;
    } else if (this.oauth.instance_url) {
      url = this.oauth.instance_url;
    } else {
      url = this.serverURL;
    }

    // dev friendly API: Remove trailing '/' if any so url + path concat always works
    if (url.slice(-1) === '/') {
      url = url.slice(0, -1);
    }

    return url;
  };

  parseQueryString(queryString): any {
    let qs = decodeURIComponent(queryString),
      obj = {},
      params = qs.split('&');
    params.forEach(param => {
      let splitter = param.split('=');
      obj[splitter[0]] = splitter[1];
    });
    return obj;
  };


  toQueryString(obj):any{
    let parts = [],
      i;
    for (i in obj) {
      if (obj.hasOwnProperty(i)) {
        parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
      }
    }
    return parts.join("&");
  };

  refreshToken(): any{

    if (!this.oauth.refresh_token) {
      console.log('ERROR: refresh token does not exist');
      return;
    }
  
    let urltoken;
    let params = {
      'grant_type': 'refresh_token',
      'refresh_token': this.oauth.refresh_token,
      'client_id': '3MVG9rKhT8ocoxGkMw8Px7.4hVo6Av2SxecF2oPfPvw22k5VW7WemsAVW_HXieze95ZjzBxa2zuCIbFdbm9qX',
      'client_secret': '9018671361967970020'

    };
    urltoken = this.useProxy ? this.proxyURL : this.loginURL;
    urltoken = urltoken + '/services/oauth2/token?' + this.toQueryString(params);   
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        "Target-URL": this.loginURL
      })
    };
    this.http.post(urltoken, httpOptions).subscribe(
      data => {
        console.log(data);
        console.log('Token refreshed');
        let dataRes: any = data;
        this.oauth.access_token = dataRes.access_token;       
      },
      error => {
        console.log(error);
        console.log('Error while trying to refresh token: ' + error);
        console.log('ERROR: refresh token does not exist');
      });
  }

  init(params):any {

    if (params) {
      this.appId = params.appId || this.appId;
      this.apiVersion = params.apiVersion || this.apiVersion;
      this.loginURL = params.loginURL || this.loginURL;
      this.oauthCallbackURL = params.oauthCallbackURL || this.oauthCallbackURL;
      this.proxyURL = params.proxyURL || this.proxyURL;

      this.useProxy = params.useProxy === undefined ? this.useProxy : params.useProxy;

      if (params.accessToken) {
        if (!this.oauth) this.oauth = {};
        this.oauth.access_token = params.accessToken;
      }

      if (params.instanceURL) {
        if (!this.oauth) this.oauth = {};
        this.oauth.instance_url = params.instanceURL;
      }

      if (params.refreshToken) {
        if (!this.oauth) this.oauth = {};
        this.oauth.refresh_token = params.refreshToken;
      }
    }

    console.log("useProxy: " + this.useProxy);

  };

  login() {
    let loginWindowURL = this.loginURL + '/services/oauth2/authorize?client_id=' + this.appId + '&redirect_uri=' + this.oauthCallbackURL + '&response_type=token';
    window.open(loginWindowURL, '_self', 'location=no');
  };

  //request(obj) {
  request() {
    if (!this.oauth || (!this.oauth.access_token && !this.oauth.refresh_token)) {
      //reject('No access token. Please login and try again.');
      return;
    };

    /*let url = this.getRequestBaseURL();
    if (obj.path.charAt(0) !== '/') {
      obj.path = '/' + obj.path;
    }

   // url = url + obj.path;

   /* if (obj.params) {
      url += '?' + this.toQueryString(obj.params);
      //url += '?q=' + obj.params.q;
    }
    */
   // let req = obj.data ? JSON.stringify(obj.data) : undefined;
    const httpOptions = {
      headers: new HttpHeaders({
        "Authorization": "Bearer " + this.oauth.access_token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Methods": "GET,POST",
        'X-PrettyPrint': '1',
        'version': this.apiVersion

      })
    };

    let urltoken = this.useProxy ? this.proxyURL : this.loginURL;

    let url = urltoken+'/services/oauth2/userinfo';
  
    this.http.get(url,httpOptions).subscribe(
      data => {
        console.log(data);
        let userData = data;
        this.userData = JSON.stringify(userData);
      },
      error => {
        console.log(error);
        this.refreshToken();
        return error;
      });
  }

  /*query(soql) {
   this.request(
      {
        path: '/services/data/' + this.apiVersion + '/query',
        params: { q: soql }

      }
    );
  }*/

  getAccessToken(tokenVal) {
    if (tokenVal.indexOf("access_token=") > 0) {
      let queryString = tokenVal.substr(tokenVal.indexOf('#') + 1);
      let obj = this.parseQueryString(queryString);
      this.oauth = obj;
      let userData;
      this.request();
     // this.query("SELECT Id,FirstName, LastName FROM User");


    } else if (tokenVal.indexOf("error=") > 0) {
      var queryString = decodeURIComponent(tokenVal.substring(tokenVal.indexOf('?') + 1));
      let obj = this.parseQueryString(queryString);
      console.log('error', obj);
    } else {
      console.log('access_denied');

    }
  }
   

  
}
