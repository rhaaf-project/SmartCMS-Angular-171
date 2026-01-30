import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { toggleAnimation } from '../shared/animations';
import { environment } from '../../environments/environment';
import { IconPlusComponent } from '../shared/icon/icon-plus';
import { IconPencilComponent } from '../shared/icon/icon-pencil';
import { IconTrashLinesComponent } from '../shared/icon/icon-trash-lines';
import { IconEyeComponent } from '../shared/icon/icon-eye';
import { IconCircleCheckComponent } from '../shared/icon/icon-circle-check';
import Swal from 'sweetalert2';

interface CallServer {
    id?: number;
    head_office_id: number | null;
    head_office?: {
        id: number;
        name: string;
    };
    name: string;
    host: string;
    port: number;
    is_active: boolean;
    description: string | null;
    created_at?: string;
    updated_at?: string;
    // Mock stats
    ext_count?: number;
    lines_count?: number;
    trunks_count?: number;
}

interface HeadOffice {
    id: number;
    name: string;
    customer_id: number;
    type: string;
}

@Component({
    templateUrl: './call-servers.html',
    animations: [toggleAnimation],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        IconPlusComponent,
        IconPencilComponent,
        IconTrashLinesComponent,
        IconEyeComponent,
        IconCircleCheckComponent,
    ],
})
export class CallServersComponent implements OnInit {
    store: any;
    callServers: CallServer[] = [];
    headOffices: HeadOffice[] = [];
    isLoading = false;
    search = '';
    showModal = false;
    modalMode: 'create' | 'edit' | 'view' = 'create';

    formData: CallServer = {
        head_office_id: null,
        name: '',
        host: '',
        port: 5060,
        is_active: true,
        description: null,
    };

    private http = inject(HttpClient);

    constructor(
        public storeData: Store<any>,
        public router: Router
    ) {
        this.initStore();
    }

    async initStore() {
        this.storeData
            .select((d) => d.index)
            .subscribe((d) => {
                this.store = d;
            });
    }

    ngOnInit() {
        this.loadCallServers();
        this.loadHeadOffices();
    }

    loadCallServers() {
        this.isLoading = true;
        const apiUrl = `${environment.apiUrl}/v1/call-servers`;

        this.http.get<any>(apiUrl).subscribe({
            next: (response) => {
                this.callServers = response.data || [];
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Failed to load call servers:', error);
                this.isLoading = false;
                this.showErrorMessage('Failed to load call servers');
            },
        });
    }

    loadHeadOffices() {
        const apiUrl = `${environment.apiUrl}/v1/head-offices`;

        this.http.get<any>(apiUrl).subscribe({
            next: (response) => {
                this.headOffices = response.data || [];
            },
            error: (error) => {
                console.error('Failed to load head offices:', error);
            },
        });
    }

    openCreateModal() {
        this.modalMode = 'create';
        this.resetForm();
        this.showModal = true;
    }

    openEditModal(callServer: CallServer) {
        this.modalMode = 'edit';
        this.formData = { ...callServer };
        this.showModal = true;
    }

    openViewModal(callServer: CallServer) {
        this.modalMode = 'view';
        this.formData = { ...callServer };
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.resetForm();
    }

    resetForm() {
        this.formData = {
            head_office_id: null,
            name: '',
            host: '',
            port: 5060,
            is_active: true,
            description: null,
        };
    }

    handleSubmit() {
        if (this.modalMode === 'create') {
            this.createCallServer();
        } else if (this.modalMode === 'edit') {
            this.updateCallServer();
        }
    }

    createCallServer() {
        const apiUrl = `${environment.apiUrl}/v1/call-servers`;

        this.http.post<any>(apiUrl, this.formData).subscribe({
            next: (response) => {
                this.showSuccessMessage('Call server created successfully');
                this.closeModal();
                this.loadCallServers();
            },
            error: (error) => {
                console.error('Failed to create call server:', error);
                this.showErrorMessage(error.error?.message || 'Failed to create call server');
            },
        });
    }

    updateCallServer() {
        const apiUrl = `${environment.apiUrl}/v1/call-servers/${this.formData.id}`;

        this.http.put<any>(apiUrl, this.formData).subscribe({
            next: (response) => {
                this.showSuccessMessage('Call server updated successfully');
                this.closeModal();
                this.loadCallServers();
            },
            error: (error) => {
                console.error('Failed to update call server:', error);
                this.showErrorMessage(error.error?.message || 'Failed to update call server');
            },
        });
    }

    deleteCallServer(id: number) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this call server!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                const apiUrl = `${environment.apiUrl}/v1/call-servers/${id}`;

                this.http.delete<any>(apiUrl).subscribe({
                    next: (response) => {
                        this.showSuccessMessage('Call server deleted successfully');
                        this.loadCallServers();
                    },
                    error: (error) => {
                        console.error('Failed to delete call server:', error);
                        this.showErrorMessage(error.error?.message || 'Failed to delete call server');
                    },
                });
            }
        });
    }

    showSuccessMessage(message: string) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            timer: 2000,
            showConfirmButton: false,
        });
    }

    showErrorMessage(message: string) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
        });
    }
}
