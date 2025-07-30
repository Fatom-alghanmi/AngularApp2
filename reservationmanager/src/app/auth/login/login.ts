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
  errorMessage = '';
  successMessage = '';
  loading = false;

  lockoutRemaining = 0;
  private lockoutTimer: any = null;

  constructor(public http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  startLockoutTimer(seconds: number) {
    this.lockoutRemaining = seconds;
    this.cdr.detectChanges();

    if (this.lockoutTimer) {
      clearInterval(this.lockoutTimer);
    }

    this.lockoutTimer = setInterval(() => {
      this.lockoutRemaining--;
      this.cdr.detectChanges();

      if (this.lockoutRemaining <= 0) {
        clearInterval(this.lockoutTimer);
        this.lockoutTimer = null;
      }
    }, 1000);
  }

  login() {
    if (this.loading) return;
    if (this.lockoutRemaining > 0) {
      this.errorMessage = `Too many failed attempts. Please wait ${this.lockoutRemaining} seconds before retrying.`;
      this.successMessage = '';
      return;
    }

    const username = this.userName.trim();
    const password = this.password.trim();

    if (!username || !password) {
      this.errorMessage = 'Please enter both username and password.';
      this.successMessage = '';
      return;
    }

    this.loading = true;
    this.errorMessage = 'Logging in...';
    this.successMessage = '';
    this.cdr.detectChanges();

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
          this.lockoutRemaining = 0;
          if (this.lockoutTimer) {
            clearInterval(this.lockoutTimer);
            this.lockoutTimer = null;
          }
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/']), 800);
        } else {
          this.errorMessage = res.message || 'Invalid username or password.';
          this.successMessage = '';

          if (res.lockout && res.remainingSeconds) {
            this.startLockoutTimer(res.remainingSeconds);
          }

          this.cdr.detectChanges();
        }
      },
      error: err => {
        this.loading = false;
        this.successMessage = '';

        if (err.status === 429 && err.error?.remainingSeconds) {
          this.errorMessage = err.error.message || 'Too many failed attempts. Please wait.';
          this.startLockoutTimer(err.error.remainingSeconds);
        } else if (err.status === 401) {
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

        this.cdr.detectChanges();
      }
    });
  }
}
