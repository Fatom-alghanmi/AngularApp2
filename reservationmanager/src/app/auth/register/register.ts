import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [HttpClientModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  userName = '';
  password = '';
  confirmPassword = '';
  emailAddress = '';
  errorMessage = '';
  successMessage = '';

  constructor(private auth: Auth, private router: Router, private cdr: ChangeDetectorRef) {}

  register() {
    const trimmedUsername = this.userName.trim();
    const trimmedPassword = this.password.trim();
    const trimmedConfirm = this.confirmPassword.trim();
    const trimmedEmail = this.emailAddress.trim();

    if (!trimmedUsername || !trimmedPassword || !trimmedConfirm || !trimmedEmail) {
      this.errorMessage = 'All fields are required.';
      this.successMessage = '';
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      this.errorMessage = 'Passwords do not match.';
      this.successMessage = '';
      return;
    }

    this.auth.register({
      userName: trimmedUsername,
      password: trimmedPassword,
      emailAddress: trimmedEmail
    }).subscribe({
      next: res => {
        if (res.success) {
          this.successMessage = 'Registration successful. Please log in.';
          this.errorMessage = '';
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.errorMessage = res.message;
          this.successMessage = '';
        }
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Server error during registration.';
        this.successMessage = '';
        this.cdr.detectChanges();
      }
    });
   
  }
}

