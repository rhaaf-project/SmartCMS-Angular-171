import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataTableModule } from '@bhplugin/ng-datatable';

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
        { field: 'parentBranch', title: 'Parent Branch' },
        { field: 'code', title: 'Code' },
        { field: 'name', title: 'Sub Branch Name' },
        { field: 'city', title: 'City' },
        { field: 'district', title: 'District' },
        { field: 'active', title: 'Active', sort: false, headerClass: 'justify-center', cellClass: 'justify-center' },
        { field: 'actions', title: '', sort: false, headerClass: '!text-center', cellClass: '!text-center' },
    ];

    rows: any[] = [];
    filteredRows: any[] = [];

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
                parentBranch: 'Branch Bandung',
                code: 'SB-001',
                name: 'Sub Branch Cimahi',
                city: 'Cimahi',
                district: 'Cimahi Tengah',
                active: true,
            },
            {
                id: 2,
                company: 'Smart Infinite Prosperity',
                parentBranch: 'Branch Bandung',
                code: 'SB-002',
                name: 'Sub Branch Lembang',
                city: 'Lembang',
                district: 'Lembang',
                active: true,
            },
            {
                id: 3,
                company: 'Smart Infinite Prosperity',
                parentBranch: 'Branch Semarang',
                code: 'SB-003',
                name: 'Sub Branch Ungaran',
                city: 'Ungaran',
                district: 'Ungaran Barat',
                active: false,
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
                row.parentBranch.toLowerCase().includes(searchLower) ||
                row.code.toLowerCase().includes(searchLower) ||
                row.name.toLowerCase().includes(searchLower) ||
                row.city.toLowerCase().includes(searchLower)
        );
    }

    deleteSubBranch(row: any) {
        if (confirm('Are you sure you want to delete this sub branch?')) {
            this.rows = this.rows.filter((r) => r.id !== row.id);
            this.filteredRows = this.filteredRows.filter((r) => r.id !== row.id);
        }
    }
}
