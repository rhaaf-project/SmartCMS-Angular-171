import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toggleAnimation } from '../shared/animations';

// Icons
import { IconPencilComponent } from '../shared/icon/icon-pencil';
import { IconTrashLinesComponent } from '../shared/icon/icon-trash-lines';
import { IconPlusComponent } from '../shared/icon/icon-plus';

@Component({
    templateUrl: './static-route.html',
    imports: [
        CommonModule,
        FormsModule,
        IconPencilComponent,
        IconTrashLinesComponent,
        IconPlusComponent,
    ],
    animations: [toggleAnimation],
})
export class StaticRouteComponent implements OnInit {
    search = '';
    showModal = false;
    modalMode: 'create' | 'edit' = 'create';
    isLoading = false;

    // Mock data for static routes (OS-level networking)
    routes = [
        { id: 1, destination: '192.168.1.0/24', gateway: '10.0.0.1', interface: 'eth0', metric: 100, is_active: true },
        { id: 2, destination: '172.16.0.0/16', gateway: '10.0.0.2', interface: 'eth1', metric: 200, is_active: true },
        { id: 3, destination: '0.0.0.0/0', gateway: '10.0.0.254', interface: 'eth0', metric: 1, is_active: true },
    ];

    formData: any = {
        destination: '',
        gateway: '',
        interface: 'eth0',
        metric: 100,
        is_active: true,
    };

    interfaces = ['eth0', 'eth1', 'eth2', 'bond0', 'lo'];

    constructor() { }

    ngOnInit(): void { }

    get filteredRoutes() {
        if (!this.search) return this.routes;
        const s = this.search.toLowerCase();
        return this.routes.filter(r =>
            r.destination.toLowerCase().includes(s) ||
            r.gateway.toLowerCase().includes(s) ||
            r.interface.toLowerCase().includes(s)
        );
    }

    openCreateModal() {
        this.modalMode = 'create';
        this.formData = { destination: '', gateway: '', interface: 'eth0', metric: 100, is_active: true };
        this.showModal = true;
    }

    openEditModal(route: any) {
        this.modalMode = 'edit';
        this.formData = { ...route };
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    handleSubmit() {
        if (this.modalMode === 'create') {
            this.routes.push({ ...this.formData, id: Date.now() });
        } else {
            const idx = this.routes.findIndex(r => r.id === this.formData.id);
            if (idx !== -1) this.routes[idx] = { ...this.formData };
        }
        this.closeModal();
    }

    deleteRoute(id: number) {
        if (confirm('Are you sure you want to delete this route?')) {
            this.routes = this.routes.filter(r => r.id !== id);
        }
    }
}
