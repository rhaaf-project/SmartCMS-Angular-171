import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataTableModule } from '@bhplugin/ng-datatable';

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

    constructor() { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData() {
        this.loading = true;
        // Sample data - replace with API call
        this.rows = [
            {
                id: 1,
                company: 'Smart Infinite Prosperity',
                name: 'HO Jakarta',
                type: 'ha',
                city: 'Jakarta',
                servers: 3,
                branches: 5,
                active: true,
            },
            {
                id: 2,
                company: 'Smart Infinite Prosperity',
                name: 'HO Surabaya',
                type: 'fo',
                city: 'Surabaya',
                servers: 2,
                branches: 3,
                active: true,
            },
        ];
        this.filteredRows = [...this.rows];
        this.loading = false;
    }

    onSearch() {
        if (!this.search) {
            this.filteredRows = [...this.rows];
            return;
        }
        const searchLower = this.search.toLowerCase();
        this.filteredRows = this.rows.filter(
            (row) =>
                row.company.toLowerCase().includes(searchLower) ||
                row.name.toLowerCase().includes(searchLower) ||
                row.city.toLowerCase().includes(searchLower)
        );
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
            this.rows = this.rows.filter((r) => r.id !== row.id);
            this.filteredRows = this.filteredRows.filter((r) => r.id !== row.id);
        }
    }
}
