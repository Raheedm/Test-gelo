import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  isLoginMode = true;
  loading = false;
  error = '';

  loginData = {
    username: '',
    password: ''
  };

  registerData = {
    username: '',
    password: '',
    name: '',
    contact: '',
    bio: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    if (this.isLoginMode) {
      this.authService.login(this.loginData.username, this.loginData.password)
        .subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.error = err.error?.message || 'Login failed';
            this.loading = false;
          }
        });
    } else {
      this.authService.register(this.registerData)
        .subscribe({
          next: (response) => {
            this.loading = false;
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.error = err.error?.message || 'Registration failed';
            this.loading = false;
          }
        });
    }
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
    
    // Clear form data when switching modes
    if (this.isLoginMode) {
      this.registerData = {
        username: '',
        password: '',
        name: '',
        contact: '',
        bio: ''
      };
    } else {
      this.loginData = {
        username: '',
        password: ''
      };
    }
  }
}