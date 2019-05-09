import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {AuthData} from './auth-data.model';
import {Subject} from 'rxjs';
import {Router} from '@angular/router';

@Injectable({providedIn: 'root'})
export class AuthService {
  private isAuthenticated = false;
  private tokenTimer: any;
  private token: string;
  private userId: string;
  // Subject pour push authentication info to components interested
  private authStatusListener = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
  }

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    // Communiquer info  d'Authenticaiton aux autres componenets
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = {email: email, password: password};
    this.http.post('http://localhost:3000/api/user/signup', authData)
        .subscribe(response => {
          // console.log(response);
        });
  }

  login(email: string, password: string) {
    const authData: AuthData = {email: email, password: password};
    this.http
        .post<{ token: string, expiresIn: number, userId: string }>(
          'http://localhost:3000/api/user/login',
          authData
        )
        .subscribe(response => {
          // console.log(response);
          const token = response.token;
          this.token = token;
          if (token) {
            const expiresInDuration = response.expiresIn;
            // console.log(expiresInDuration);
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.authStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
            this.saveAuthData(token, expirationDate, this.userId);
            // console.log(expirationDate);
            this.router.navigate(['/']);
          }
        });
  }

  // Authentifier automatiquement Users
  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    // console.log(authInformation, expiresIn);
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    console.log('Setting time: ' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  // Store data in LocalStorage
  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  // clear data in LocalStorage
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  // Obtenir AuthData
  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    };
  }
}
