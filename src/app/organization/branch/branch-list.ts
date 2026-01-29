import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataTableModule } from '@bhplugin/ng-datatable';

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
                code: 'BR-001',
                name: 'Branch Bandung',
                headOffice: 'HO Jakarta',
                city: 'Bandung',
                district: 'Cicadas',
                callServer: 'CS-01',
                active: true,
            },
            {
                id: 2,
                company: 'Smart Infinite Prosperity',
                code: 'BR-002',
                name: 'Branch Semarang',
                headOffice: 'HO Jakarta',
                city: 'Semarang',
                district: 'Simpang Lima',
                callServer: 'CS-02',
                active: true,
            },
            {
                id: 3,
                company: 'Smart Infinite Prosperity',
                code: 'BR-003',
                name: 'Branch Malang',
                headOffice: 'HO Surabaya',
                city: 'Malang',
                district: 'Klojen',
                callServer: '-',
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
                row.code.toLowerCase().includes(searchLower) ||
                row.name.toLowerCase().includes(searchLower) ||
                row.city.toLowerCase().includes(searchLower)
        );
    }

    deleteBranch(row: any) {
        if (confirm('Are you sure you want to delete this branch?')) {
            this.rows = this.rows.filter((r) => r.id !== row.id);
            this.filteredRows = this.filteredRows.filter((r) => r.id !== row.id);
        }
    }
}
