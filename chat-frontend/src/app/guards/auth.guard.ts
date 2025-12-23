import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const isAuth = authService.isAuthenticated();
    console.log('AuthGuard Check. Is Authenticated?', isAuth);

    if (isAuth) {
        return true;
    }

    console.log('AuthGuard: Access denied, redirecting to login...');
    // Redirect to login if not authenticated
    return router.createUrlTree(['/login']);
};
