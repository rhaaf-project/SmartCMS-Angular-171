import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataTableModule } from '@bhplugin/ng-datatable';
import { OrganizationService, HeadOffice } from '../services/organization.service';

@Component({
    selector: 'app-head-office-list',
    templateUrl: './head-office-list.html',
    imports: [CommonModule, FormsModule, RouterModule, DataTableModule],
})
export class HeadOfficeListComponent implements OnInit {
    loading = false;
    search = '';

    cols = [
        { field: 'company', title: 'Company' },
        { field: 'name', title: 'Name' },
        { field: 'type', title: 'Type', headerClass: 'justify-center', cellClass: 'justify-center' },
        { field: 'city', title: 'City' },
        { field: 'servers', title: 'Servers', headerClass: 'justify-center', cellClass: 'justify-center' },
        { field: 'branches', title: 'Branches', headerClass: 'justify-center', cellClass: 'justify-center' },
        { field: 'active', title: 'Active', sort: false, headerClass: 'justify-center', cellClass: 'justify-center' },
        { field: 'actions', title: '', sort: false, headerClass: '!text-center', cellClass: '!text-center' },
    ];

    rows: any[] = [];
    filteredRows: any[] = [];

    typeLabels: { [key: string]: string } = {
        basic: 'Basic',
        ha: 'HA',
        fo: 'FO',
    };

    constructor(private organizationService: OrganizationService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData() {
        this.loading = true;
        this.organizationService.getHeadOffices({ search: this.search }).subscribe({
            next: (response) => {
                this.rows = (response.data || []).map((ho: any) => ({
                    id: ho.id,
                    company: ho.customer?.name || '-',
                    name: ho.name,
                    type: ho.type || 'basic',
                    city: ho.city || '-',
                    servers: ho.call_servers_count || 0,
                    branches: ho.branches_count || 0,
                    active: ho.is_active,
                }));
                this.filteredRows = [...this.rows];
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load head offices:', err);
                this.rows = [];
                this.filteredRows = [];
                this.loading = false;
            }
        });
    }

    onSearch() {
        this.loadData();
    }

    getTypeLabel(type: string): string {
        return this.typeLabels[type] || type;
    }

    getTypeClass(type: string): string {
        switch (type) {
            case 'ha':
                return 'badge bg-success';
            case 'fo':
                return 'badge bg-warning';
            default:
                return 'badge bg-dark';
        }
    }

    deleteHeadOffice(row: any) {
        if (confirm('Are you sure you want to delete this head office?')) {
            this.organizationService.deleteHeadOffice(row.id).subscribe({
                next: () => {
                    this.rows = this.rows.filter((r) => r.id !== row.id);
                    this.filteredRows = this.filteredRows.filter((r) => r.id !== row.id);
                },
                error: (err) => {
                    console.error('Failed to delete head office:', err);
                    alert('Failed to delete head office');
                }
            });
        }
    }
}

