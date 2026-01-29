import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataTableModule } from '@bhplugin/ng-datatable';
import { OrganizationService, Company } from '../services/organization.service';

@Component({
    selector: 'app-company-list',
    templateUrl: './company-list.html',
    imports: [CommonModule, FormsModule, RouterModule, DataTableModule],
})
export class CompanyListComponent implements OnInit {
    loading = false;
    search = '';

    cols = [
        { field: 'code', title: 'Code', isUnique: true },
        { field: 'name', title: 'Company Name' },
        { field: 'contact_person', title: 'Contact' },
        { field: 'phone', title: 'Phone' },
        { field: 'head_offices_count', title: 'HO', headerClass: 'justify-center', cellClass: 'justify-center' },
        { field: 'branches_count', title: 'Branches', headerClass: 'justify-center', cellClass: 'justify-center' },
        { field: 'is_active', title: 'Active', sort: false, headerClass: 'justify-center', cellClass: 'justify-center' },
        { field: 'actions', title: '', sort: false, headerClass: '!text-center', cellClass: '!text-center' },
    ];

    rows: any[] = [];
    filteredRows: any[] = [];

    constructor(private organizationService: OrganizationService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData() {
        this.loading = true;
        this.organizationService.getCompanies({ search: this.search }).subscribe({
            next: (response) => {
                this.rows = response.data.map((c) => ({
                    id: c.id,
                    code: c.code || '-',
                    name: c.name,
                    contact_person: c.contact_person || '-',
                    phone: c.phone || '-',
                    head_offices_count: c.head_offices_count || 0,
                    branches_count: c.branches_count || 0,
                    is_active: c.is_active,
                }));
                this.filteredRows = [...this.rows];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading companies:', err);
                // Fallback to sample data if API fails
                this.rows = [
                    {
                        id: 1,
                        code: 'Smart',
                        name: 'Smart Infinite Prosperity',
                        contact_person: 'Joni Me Ow',
                        phone: '02150877432',
                        head_offices_count: 1,
                        branches_count: 3,
                        is_active: true,
                    },
                ];
                this.filteredRows = [...this.rows];
                this.loading = false;
            },
        });
    }

    onSearch() {
        this.loadData();
    }

    deleteCompany(row: any) {
        if (confirm('Are you sure you want to delete this company?')) {
            this.organizationService.deleteCompany(row.id).subscribe({
                next: () => {
                    this.rows = this.rows.filter((r) => r.id !== row.id);
                    this.filteredRows = this.filteredRows.filter((r) => r.id !== row.id);
                },
                error: (err) => {
                    console.error('Error deleting company:', err);
                    alert('Failed to delete company');
                },
            });
        }
    }
}

