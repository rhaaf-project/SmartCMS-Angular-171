import { Injectable } from '@angular/core';

export interface PagePermission {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
    private permissions: { [key: string]: PagePermission } = {};
    private role: string = '';

    /** Call after login to store permissions */
    setPermissions(permissions: { [key: string]: PagePermission }, role: string) {
        this.permissions = permissions;
        this.role = role;
        localStorage.setItem('userRole', role);
        localStorage.setItem('userPermissions', JSON.stringify(permissions));
    }

    /** Load from localStorage (on app refresh) */
    loadFromStorage() {
        this.role = localStorage.getItem('userRole') || '';
        try {
            this.permissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');
        } catch {
            this.permissions = {};
        }
    }

    getRole(): string {
        if (!this.role) this.loadFromStorage();
        return this.role;
    }

    /** Check if user can view a page (for sidebar/guard) */
    canView(pageKey: string): boolean {
        if (!this.role) this.loadFromStorage();
        if (this.role === 'superroot') return true;
        return this.permissions[pageKey]?.view ?? false;
    }

    /** Check if user can create on a page (for Add button) */
    canCreate(pageKey: string): boolean {
        if (!this.role) this.loadFromStorage();
        if (this.role === 'superroot') return true;
        return this.permissions[pageKey]?.create ?? false;
    }

    /** Check if user can edit on a page (for Edit button) */
    canEdit(pageKey: string): boolean {
        if (!this.role) this.loadFromStorage();
        if (this.role === 'superroot') return true;
        return this.permissions[pageKey]?.edit ?? false;
    }

    /** Check if user can delete on a page (for Delete button) */
    canDelete(pageKey: string): boolean {
        if (!this.role) this.loadFromStorage();
        if (this.role === 'superroot') return true;
        return this.permissions[pageKey]?.delete ?? false;
    }

    /** Check if any page in a group is viewable (for sidebar section) */
    canViewAny(pageKeys: string[]): boolean {
        if (!this.role) this.loadFromStorage();
        if (this.role === 'superroot') return true;
        return pageKeys.some(key => this.permissions[key]?.view);
    }

    /** Clear on logout */
    clear() {
        this.permissions = {};
        this.role = '';
        localStorage.removeItem('userRole');
        localStorage.removeItem('userPermissions');
    }
}
