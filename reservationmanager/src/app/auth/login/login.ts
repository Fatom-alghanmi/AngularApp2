import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  userName = '';
  password = '';
  message = '';
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(public http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  login() {
    if (this.loading) return;
  
    const username = this.userName.trim();
    const password = this.password.trim();
  
    if (!username || !password) {
      this.errorMessage = 'Please enter both username and password.';
      this.successMessage = '';
      return;
    }
  
    this.loading = true;
    this.errorMessage = 'Logging in...';  // Show processing message
    this.successMessage = '';
    this.cdr.detectChanges(); // ensure UI updates immediately
  
    this.http.post<any>('http://localhost/AngularApp2/reservationapi/login.php', {
      userName: username,
      password: password
    }, {
      withCredentials: true
    }).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.successMessage = res.message || 'Login successful.';
          this.errorMessage = '';
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/']), 800);
        } else {
          // Unexpected path if backend uses HTTP errors properly
          this.errorMessage = res.message || 'Invalid username or password.';
          this.successMessage = '';
          this.cdr.detectChanges();
        }
      },
      error: err => {
        console.log('Login error:', err);
        this.loading = false;
  
        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password.';
        } else if (err.status === 404) {
          this.errorMessage = 'User not found.';
        } else if (err.error && typeof err.error === 'object' && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            this.errorMessage = parsed.message || 'Login failed.';
          } catch {
            this.errorMessage = 'Login failed. Please try again.';
          }
        } else {
          this.errorMessage = 'An unexpected error occurred.';
        }
  
        this.successMessage = '';
        this.cdr.detectChanges();  // force UI update after error
      }
    });
  }
  
}
