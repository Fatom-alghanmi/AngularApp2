import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  userName = '';
  emailAddress = '';
  password = '';
  message = '';
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(public http: HttpClient, private router: Router,  private cdr: ChangeDetectorRef) {}

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  register() {
    if (this.loading) return;
  
    // Your validation here...
  
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();  // Update UI immediately for clearing messages
  
    this.http.post<any>('http://localhost/AngularApp2/reservationapi/register.php', {
      userName: this.userName.trim(),
      emailAddress: this.emailAddress.trim(),
      password: this.password.trim()
    }, {
      withCredentials: true
    }).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.successMessage = res.message || 'Registration successful.';
          this.errorMessage = '';
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/login']), 500);
        } else {
          this.errorMessage = res.message || 'Registration failed.';
          this.successMessage = '';
          this.cdr.detectChanges();
        }
      },
      error: err => {
        this.loading = false;
        this.errorMessage = 'A network or server error occurred.';
        this.successMessage = '';
        this.cdr.detectChanges();
      }
    });
  }
  
}
