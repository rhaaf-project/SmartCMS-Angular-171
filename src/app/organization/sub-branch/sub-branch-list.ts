import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataTableModule } from '@bhplugin/ng-datatable';
import { OrganizationService } from '../services/organization.service';

@Component({
    selector: 'app-sub-branch-list',
    templateUrl: './sub-branch-list.html',
    imports: [CommonModule, FormsModule, RouterModule, DataTableModule],
})
export class SubBranchListComponent implements OnInit {
    loading = false;
    search = '';

    cols = [
        { field: 'company', title: 'Company' },
        { field: 'code', title: 'Code' },
        { field: 'name', title: 'Sub Branch Name' },
        { field: 'parentBranch', title: 'Parent Branch' },
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
        this.organizationService.getSubBranches({ search: this.search }).subscribe({
            next: (response) => {
                this.rows = (response.data || []).map((sb: any) => ({
                    id: sb.id,
                    company: sb.customer?.name || '-',
                    code: sb.code || '-',
                    name: sb.name,
                    parentBranch: sb.branch?.name || '-',
                    city: sb.city || '-',
                    district: sb.district || '-',
                    callServer: sb.call_server?.name || '-',
                    active: sb.is_active,
                }));
                this.filteredRows = [...this.rows];
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load sub branches:', err);
                this.rows = [];
                this.filteredRows = [];
                this.loading = false;
            }
        });
    }

    onSearch() {
        this.loadData();
    }

    deleteSubBranch(row: any) {
        if (confirm('Are you sure you want to delete this sub branch?')) {
            this.organizationService.deleteSubBranch(row.id).subscribe({
                next: () => {
                    this.rows = this.rows.filter((r) => r.id !== row.id);
                    this.filteredRows = this.filteredRows.filter((r) => r.id !== row.id);
                },
                error: (err) => {
                    console.error('Failed to delete sub branch:', err);
                    alert('Failed to delete sub branch');
                }
            });
        }
    }
}

