import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { toggleAnimation } from '../shared/animations';
import { environment } from '../../environments/environment';
import { IconPencilComponent } from '../shared/icon/icon-pencil';
import { IconTrashLinesComponent } from '../shared/icon/icon-trash-lines';
import { IconCopyComponent } from '../shared/icon/icon-copy';
import { IconCircleCheckComponent } from '../shared/icon/icon-circle-check';
import Swal from 'sweetalert2';

interface TurretUser {
    id?: number;
    name: string;
    password?: string;
    use_ext: string;
    is_active: boolean;
    last_login?: string;
    created_at?: string;
    extension_data?: { id: number; extension: string; name: string };
}

interface Extension {
    id: number;
    name: string;
}

@Component({
    selector: 'app-turret-users',
    standalone: true,
    templateUrl: './turret-users.html',
    animations: [toggleAnimation],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        IconPencilComponent,
        IconTrashLinesComponent,
        IconCopyComponent,
        IconCircleCheckComponent,
    ],
})
export class TurretUsersComponent implements OnInit {
    items: TurretUser[] = [];
    extensions: Extension[] = [];
    isLoading = false;
    showModal = false;
    modalMode: 'create' | 'edit' = 'create';
    formData: TurretUser = { name: '', password: '', use_ext: '', is_active: true };
    search = '';

    private http = inject(HttpClient);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    ngOnInit() {
        this.loadItems();
        this.loadExtensions();
    }

    get filteredItems(): TurretUser[] {
        if (!this.search) return this.items;
        const s = this.search.toLowerCase();
        return this.items.filter(item =>
            item.name.toLowerCase().includes(s) ||
            item.use_ext?.toLowerCase().includes(s)
        );
    }

    loadExtensions() {
        this.http.get<any>(`${environment.apiUrl}/v1/dropdowns?type=extensions`).subscribe({
            next: (res) => {
                this.extensions = res.data || [];
            },
            error: () => {
                console.error('Failed to load extensions');
            }
        });
    }

    loadItems() {
        this.isLoading = true;
        this.http.get<any>(`${environment.apiUrl}/v1/turret-users`).subscribe({
            next: (res) => {
                this.items = res.data || [];
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    openCreateModal() {
        this.modalMode = 'create';
        this.formData = { name: '', password: '', use_ext: '', is_active: true };
        this.showModal = true;
    }

    openEditModal(item: TurretUser) {
        this.modalMode = 'edit';
        this.formData = { ...item, password: '' };
        this.showModal = true;
    }

    copyRecord(item: TurretUser) {
        this.modalMode = 'create';
        this.formData = { ...item, id: undefined, name: item.name + '_copy', password: '' };
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    saveRecord() {
        if (!this.formData.name) {
            Swal.fire('Error', 'Username is required', 'error');
            return;
        }

        if (this.modalMode === 'create') {
            if (!this.formData.password) {
                Swal.fire('Error', 'Password is required for new user', 'error');
                return;
            }
            this.http.post<any>(`${environment.apiUrl}/v1/turret-users`, this.formData).subscribe({
                next: () => {
                    Swal.fire('Success', 'Turret user created successfully', 'success');
                    this.closeModal();
                    this.loadItems();
                },
                error: (err) => {
                    Swal.fire('Error', err.error?.error || 'Failed to create turret user', 'error');
                }
            });
        } else {
            const payload = { ...this.formData };
            if (!payload.password) delete payload.password;
            this.http.put<any>(`${environment.apiUrl}/v1/turret-users/${this.formData.id}`, payload).subscribe({
                next: () => {
                    Swal.fire('Success', 'Turret user updated successfully', 'success');
                    this.closeModal();
                    this.loadItems();
                },
                error: (err) => {
                    Swal.fire('Error', err.error?.error || 'Failed to update turret user', 'error');
                }
            });
        }
    }

    deleteRecord(item: TurretUser) {
        Swal.fire({
            title: 'Delete Turret User?',
            text: `Are you sure you want to delete "${item.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                this.http.delete<any>(`${environment.apiUrl}/v1/turret-users/${item.id}`).subscribe({
                    next: () => {
                        Swal.fire('Deleted!', 'Turret user has been deleted.', 'success');
                        this.loadItems();
                    },
                    error: () => {
                        Swal.fire('Error', 'Failed to delete turret user', 'error');
                    }
                });
            }
        });
    }
}
