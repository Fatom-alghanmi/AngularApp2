import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class Auth {
  private baseUrl = 'http://localhost/AngularApp2/reservationapi/';
  isAuthenticated = false;
  public username: string = '';  

  constructor(private http: HttpClient, private router: Router) {}


  login(user: any) {
    return this.http.post<any>(`${this.baseUrl}login.php`, user);
  }

  register(user: any) {
    return this.http.post<any>(`${this.baseUrl}register.php`, user);
  }

  logout() {
    this.http.get(`${this.baseUrl}logout.php`).subscribe(() => {
      this.isAuthenticated = false;
      this.username = '';  // ✅ Clear username on logout
      localStorage.removeItem('auth');
      localStorage.removeItem('username');
      this.router.navigate(['/login']);
    });
  }

  checkAuth() {
    return this.http.get<any>(`${this.baseUrl}checkAuth.php`);
  }

  setAuth(auth: boolean) {
    this.isAuthenticated = auth;
    localStorage.setItem('auth', auth ? 'true' : 'false');
  }

  getAuth(): boolean {
    return localStorage.getItem('auth') === 'true';
  }

  setUsername(username: string) {
    this.username = username;
    localStorage.setItem('username', username);   // Optional: Persist username
  }

  loadUsername() {
    this.username = localStorage.getItem('username') || '';
  }
}
