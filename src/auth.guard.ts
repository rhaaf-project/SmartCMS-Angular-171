import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { PermissionService } from './app/service/permission.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
    constructor(
        private router: Router,
        private permissionService: PermissionService,
    ) { }

    canActivate(route?: ActivatedRouteSnapshot) {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

        if (!token) {
            this.router.navigate(['/login']);
            return false;
        }

        // Page-level permission check
        const pageKey = route?.data?.['pageKey'];
        if (pageKey && !this.permissionService.canView(pageKey)) {
            console.warn(`[GUARD] Access denied for page: ${pageKey}`);
            this.router.navigate(['/admin']);
            return false;
        }

        return true;
    }
}
