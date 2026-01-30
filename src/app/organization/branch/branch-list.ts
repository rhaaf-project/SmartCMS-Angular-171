import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataTableModule } from '@bhplugin/ng-datatable';
import { OrganizationService } from '../services/organization.service';

@Component({
    selector: 'app-branch-list',
    templateUrl: './branch-list.html',
    imports: [CommonModule, FormsModule, RouterModule, DataTableModule],
})
export class BranchListComponent implements OnInit {
    loading = false;
    search = '';

    cols = [
        { field: 'company', title: 'Company' },
        { field: 'code', title: 'Code' },
        { field: 'name', title: 'Branch Name' },
        { field: 'headOffice', title: 'HO' },
        { field: 'city', title: 'City' },
        { field: 'district', title: 'District' },
        { field: 'callServer', title: 'Call Server' },
        { field: 'active', title: 'Active', sort: false, headerClass: 'justify-center', cellClass: 'justify-center' },
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
        this.organizationService.getBranches({ search: this.search }).subscribe({
            next: (response) => {
                this.rows = (response.data || []).map((b: any) => ({
                    id: b.id,
                    company: b.customer?.name || '-',
                    code: b.code || '-',
                    name: b.name,
                    headOffice: b.head_office?.name || '-',
                    city: b.city || '-',
                    district: b.district || '-',
                    callServer: b.call_server?.name || '-',
                    active: b.is_active,
                }));
                this.filteredRows = [...this.rows];
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load branches:', err);
                this.rows = [];
                this.filteredRows = [];
                this.loading = false;
            }
        });
    }

    onSearch() {
        this.loadData();
    }

    deleteBranch(row: any) {
        if (confirm('Are you sure you want to delete this branch?')) {
            this.organizationService.deleteBranch(row.id).subscribe({
                next: () => {
                    this.rows = this.rows.filter((r) => r.id !== row.id);
                    this.filteredRows = this.filteredRows.filter((r) => r.id !== row.id);
                },
                error: (err) => {
                    console.error('Failed to delete branch:', err);
                    alert('Failed to delete branch');
                }
            });
        }
    }
}

