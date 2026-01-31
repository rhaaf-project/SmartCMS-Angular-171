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
import { IconCircleCheckComponent } from '../shared/icon/icon-circle-check';
import { IconXCircleComponent } from '../shared/icon/icon-x-circle';
import { IconCopyComponent } from '../shared/icon/icon-copy';
import Swal from 'sweetalert2';

interface SBC {
    id?: number;
    call_server_id: number | null;
    call_server?: { id: number; name: string };
    name: string;
    sip_server: string;
    sip_server_port: number;
    outcid: string | null;
    maxchans: number;
    transport: string;
    context: string;
    disabled: boolean;
}

interface CallServer { id: number; name: string; }

@Component({
    templateUrl: './sbc.html',
    animations: [toggleAnimation],
    imports: [CommonModule, FormsModule, RouterModule, IconPlusComponent, IconPencilComponent, IconTrashLinesComponent, IconCircleCheckComponent, IconXCircleComponent, IconCopyComponent],
})
export class SBCComponent implements OnInit {
    store: any;
    sbcs: SBC[] = [];
    callServers: CallServer[] = [];
    isLoading = false;
    search = '';
    showModal = false;
    modalMode: 'create' | 'edit' | 'view' = 'create';

    transportOptions = [{ value: 'udp', label: 'UDP' }, { value: 'tcp', label: 'TCP' }, { value: 'tls', label: 'TLS' }];

    formData: SBC = { call_server_id: null, name: '', sip_server: '', sip_server_port: 5060, outcid: null, maxchans: 2, transport: 'udp', context: 'from-pstn', disabled: false };

    private http = inject(HttpClient);

    constructor(public storeData: Store<any>, public router: Router) {
        this.initStore();
    }

    async initStore() { this.storeData.select((d) => d.index).subscribe((d) => { this.store = d; }); }

    ngOnInit() { this.loadSBCs(); this.loadCallServers(); }

    loadSBCs() {
        this.isLoading = true;
        this.http.get<any>(`${environment.apiUrl}/v1/sbcs`).subscribe({
            next: (response) => { this.sbcs = response.data || []; this.isLoading = false; },
            error: (error) => { console.error('Failed to load SBCs:', error); this.isLoading = false; this.showErrorMessage('Failed to load SBCs'); },
        });
    }

    loadCallServers() {
        this.http.get<any>(`${environment.apiUrl}/v1/call-servers`).subscribe({
            next: (response) => { this.callServers = response.data || []; },
            error: (error) => { console.error('Failed to load call servers:', error); },
        });
    }

    openCreateModal() { this.modalMode = 'create'; this.resetForm(); this.showModal = true; }
    openEditModal(sbc: SBC) { this.modalMode = 'edit'; this.formData = { ...sbc }; this.showModal = true; }
    copyRecord(sbc: SBC) { this.modalMode = 'create'; this.formData = { ...sbc, id: undefined, name: sbc.name + ' - New' }; this.showModal = true; }
    closeModal() { this.showModal = false; this.resetForm(); }
    resetForm() { this.formData = { call_server_id: null, name: '', sip_server: '', sip_server_port: 5060, outcid: null, maxchans: 2, transport: 'udp', context: 'from-pstn', disabled: false }; }

    handleSubmit() {
        if (this.modalMode === 'create') { this.createSBC(); }
        else if (this.modalMode === 'edit') { this.updateSBC(); }
    }

    createSBC() {
        const createData = { call_server_id: this.formData.call_server_id, name: this.formData.name, sip_server: this.formData.sip_server, sip_server_port: this.formData.sip_server_port, outcid: this.formData.outcid, maxchans: this.formData.maxchans, transport: this.formData.transport, context: this.formData.context, disabled: this.formData.disabled };
        this.http.post<any>(`${environment.apiUrl}/v1/sbcs`, createData).subscribe({
            next: () => { this.showSuccessMessage('SBC created successfully'); this.closeModal(); this.loadSBCs(); },
            error: (error) => { this.showErrorMessage(error.error?.error || 'Failed to create SBC'); },
        });
    }

    updateSBC() {
        const updateData = { call_server_id: this.formData.call_server_id, name: this.formData.name, sip_server: this.formData.sip_server, sip_server_port: this.formData.sip_server_port, outcid: this.formData.outcid, maxchans: this.formData.maxchans, transport: this.formData.transport, context: this.formData.context, disabled: this.formData.disabled };
        this.http.put<any>(`${environment.apiUrl}/v1/sbcs/${this.formData.id}`, updateData).subscribe({
            next: () => { this.showSuccessMessage('SBC updated successfully'); this.closeModal(); this.loadSBCs(); },
            error: (error) => { this.showErrorMessage(error.error?.error || 'Failed to update SBC'); },
        });
    }

    deleteSBC(id: number) {
        Swal.fire({ title: 'Are you sure?', text: 'You will not be able to recover this SBC!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' }).then((result) => {
            if (result.isConfirmed) {
                this.http.delete<any>(`${environment.apiUrl}/v1/sbcs/${id}`).subscribe({
                    next: () => { this.showSuccessMessage('SBC deleted successfully'); this.loadSBCs(); },
                    error: (error) => { this.showErrorMessage(error.error?.error || 'Failed to delete SBC'); },
                });
            }
        });
    }

    showSuccessMessage(msg: string) { Swal.fire({ icon: 'success', title: 'Success', text: msg, timer: 2000, showConfirmButton: false }); }
    showErrorMessage(msg: string) { Swal.fire({ icon: 'error', title: 'Error', text: msg }); }
}
