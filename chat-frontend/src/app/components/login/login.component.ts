import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, MatCardModule, MatInputModule, MatButtonModule, MatFormFieldModule, MatSnackBarModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    username = '';
    password = '';
    email = '';
    isRegister = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    toggleMode() {
        this.isRegister = !this.isRegister;
    }

    submit() {
        const user = { username: this.username, password: this.password, email: this.email };
        if (this.isRegister) {
            this.authService.register(user).subscribe({
                next: () => {
                    this.snackBar.open('Registration successful! Please login.', 'Close', { duration: 3000 });
                    this.isRegister = false;
                },
                error: (err) => {
                    console.error('Registration failed', err);
                    this.snackBar.open('Registration failed: ' + (err.error?.message || err.statusText), 'Close', { duration: 5000 });
                }
            });
        } else {
            this.authService.login(user).subscribe({
                next: () => {
                    this.router.navigate(['/chat']);
                },
                error: (err) => {
                    console.error('Login failed', err);
                    this.snackBar.open('Login failed: ' + (err.error?.message || err.statusText), 'Close', { duration: 5000 });
                }
            });
        }
    }
}
