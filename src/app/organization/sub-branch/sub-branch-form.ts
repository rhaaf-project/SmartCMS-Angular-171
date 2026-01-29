import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
    selector: 'app-sub-branch-form',
    templateUrl: './sub-branch-form.html',
    imports: [CommonModule, FormsModule, RouterModule],
})
export class SubBranchFormComponent implements OnInit {
    isEdit = false;
    subBranchId: number | null = null;
    contactExpanded = false;

    companies = [
        { id: 1, name: 'Smart Infinite Prosperity' },
        { id: 2, name: 'ABC Corporation' },
    ];

    branches = [
        { id: 1, name: 'Branch Bandung', companyId: 1 },
        { id: 2, name: 'Branch Semarang', companyId: 1 },
        { id: 3, name: 'Branch Malang', companyId: 1 },
        { id: 4, name: 'Branch Medan', companyId: 2 },
    ];

    filteredBranches: any[] = [];

    subBranch = {
        companyId: null as number | null,
        parentBranchId: null as number | null,
        name: '',
        code: '',
        active: true,
        country: 'Indonesia',
        province: '',
        city: '',
        district: '',
        address: '',
        contactName: '',
        contactPhone: '',
        description: '',
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEdit = true;
            this.subBranchId = +id;
            this.loadSubBranch(this.subBranchId);
        }
    }

    loadSubBranch(id: number) {
        // TODO: Replace with API call
        if (id === 1) {
            this.subBranch = {
                companyId: 1,
                parentBranchId: 1,
                name: 'Sub Branch Cimahi',
                code: 'SB-001',
                active: true,
                country: 'Indonesia',
                province: 'Jawa Barat',
                city: 'Cimahi',
                district: 'Cimahi Tengah',
                address: 'Jl. Cimahi No. 1',
                contactName: 'Budi',
                contactPhone: '022-654321',
                description: '',
            };
            this.onCompanyChange();
        }
    }

    onCompanyChange() {
        if (this.subBranch.companyId) {
            this.filteredBranches = this.branches.filter(
                (b) => b.companyId === this.subBranch.companyId
            );
        } else {
            this.filteredBranches = [];
        }
        // Reset parent branch if not in filtered list
        if (this.subBranch.parentBranchId && !this.filteredBranches.find((b) => b.id === this.subBranch.parentBranchId)) {
            this.subBranch.parentBranchId = null;
        }
    }

    submit() {
        if (this.isEdit) {
            console.log('Updating sub branch:', this.subBranch);
        } else {
            console.log('Creating sub branch:', this.subBranch);
        }
        this.router.navigate(['/admin/organization/sub-branch']);
    }

    submitAndCreateAnother() {
        console.log('Creating sub branch:', this.subBranch);
        this.resetForm();
    }

    resetForm() {
        this.subBranch = {
            companyId: null,
            parentBranchId: null,
            name: '',
            code: '',
            active: true,
            country: 'Indonesia',
            province: '',
            city: '',
            district: '',
            address: '',
            contactName: '',
            contactPhone: '',
            description: '',
        };
        this.filteredBranches = [];
    }

    cancel() {
        this.router.navigate(['/admin/organization/sub-branch']);
    }

    toggleContact() {
        this.contactExpanded = !this.contactExpanded;
    }
}
