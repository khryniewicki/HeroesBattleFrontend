import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Cookie} from 'ng2-cookies';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public clientId = 'login-app';
  public localhost = 'http://localhost:4200/';

  constructor(
    // tslint:disable-next-line:variable-name
    private _http: HttpClient, private router: Router) {
  }

  // tslint:disable-next-line:typedef
  retrieveToken(code) {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', this.clientId);
    params.append('client_secret', '2dd65c43-50f0-4c64-a9e9-f087eead02c3');
    params.append('code', code);

    const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
    this._http.post('http://localhost:8085/auth/realms/heroes_battle/protocol/openid-connect/token', params.toString(), {headers})
      .subscribe(
        data => {
          this.saveToken(data);
        },
        err => alert('Invalid Credentials' + err)
      );
  }

  // tslint:disable-next-line:typedef
  saveToken(token) {
    const expireDate = new Date().getTime() + (1000 * token.expires_in);
    console.log(token);
    Cookie.set('access_token', token.access_token, expireDate);
    Cookie.set('refresh_token', token.refresh_token, expireDate);
    const redirect = Cookie.get('redirect');
    console.log('Obtained Access token' + token.refresh_token + '  ' + expireDate);
    window.location.href = redirect;
    Cookie.delete('redirect');
  }

  getResource(resourceUrl): Observable<any> {
    const headers = new HttpHeaders({
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      Authorization: 'Bearer ' + Cookie.get('access_token')
    });
    return this._http.get(resourceUrl, {headers})
      .pipe((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  // tslint:disable-next-line:typedef
  checkCredentials() {
    const credentials = Cookie.check('access_token');
    console.log('CREDENTIALS:' + credentials);
    return (credentials);
  }

  // tslint:disable-next-line:typedef
  logout() {
    const token = Cookie.get('refresh_token');
    Cookie.delete('access_token');
    Cookie.delete('refresh_token');
    window.location.href = 'http://localhost:8085/auth/realms/heroes_battle/protocol/openid-connect/logout?' +
      'client_id=' + this.clientId + '&refresh_token=' + +token + '&post_logout_redirect_uri=' + this.localhost;
  }

// tslint:disable-next-line:typedef
  login2() {
    const path = 'http://localhost:8085/auth/realms/heroes_battle/protocol/openid-connect/auth?response_type=code&client_id='
      + this.clientId;
    const time = 2000;
    this.router.navigate(['redirect']);
    setTimeout(() => window.location.href = path, time);
  }

// tslint:disable-next-line:typedef
  login() {
    Cookie.set('redirect', this.localhost);
    this.login2();
  }

  // tslint:disable-next-line:typedef
  setCookie(path1: string) {
    Cookie.set('redirect', path1);
  }
}