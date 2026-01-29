import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
    selector: 'app-branch-form',
    templateUrl: './branch-form.html',
    imports: [CommonModule, FormsModule, RouterModule],
})
export class BranchFormComponent implements OnInit {
    isEdit = false;
    branchId: number | null = null;
    contactExpanded = false;

    companies = [
        { id: 1, name: 'Smart Infinite Prosperity' },
        { id: 2, name: 'ABC Corporation' },
    ];

    headOffices = [
        { id: 1, name: 'HO Jakarta', companyId: 1 },
        { id: 2, name: 'HO Surabaya', companyId: 1 },
        { id: 3, name: 'HO Medan', companyId: 2 },
    ];

    callServers = [
        { id: 1, name: 'CS-01' },
        { id: 2, name: 'CS-02' },
        { id: 3, name: 'CS-03' },
    ];

    filteredHeadOffices: any[] = [];

    branch = {
        companyId: null as number | null,
        headOfficeId: null as number | null,
        callServerId: null as number | null,
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
            this.branchId = +id;
            this.loadBranch(this.branchId);
        }
    }

    loadBranch(id: number) {
        // TODO: Replace with API call
        if (id === 1) {
            this.branch = {
                companyId: 1,
                headOfficeId: 1,
                callServerId: 1,
                name: 'Branch Bandung',
                code: 'BR-001',
                active: true,
                country: 'Indonesia',
                province: 'Jawa Barat',
                city: 'Bandung',
                district: 'Cicadas',
                address: 'Jl. Asia Afrika No. 1',
                contactName: 'Jane Doe',
                contactPhone: '022-123456',
                description: '',
            };
            this.onCompanyChange();
        }
    }

    onCompanyChange() {
        if (this.branch.companyId) {
            this.filteredHeadOffices = this.headOffices.filter(
                (ho) => ho.companyId === this.branch.companyId
            );
        } else {
            this.filteredHeadOffices = [];
        }
        // Reset head office if not in filtered list
        if (this.branch.headOfficeId && !this.filteredHeadOffices.find((ho) => ho.id === this.branch.headOfficeId)) {
            this.branch.headOfficeId = null;
        }
    }

    submit() {
        if (this.isEdit) {
            console.log('Updating branch:', this.branch);
        } else {
            console.log('Creating branch:', this.branch);
        }
        this.router.navigate(['/admin/organization/branch']);
    }

    submitAndCreateAnother() {
        console.log('Creating branch:', this.branch);
        this.resetForm();
    }

    resetForm() {
        this.branch = {
            companyId: null,
            headOfficeId: null,
            callServerId: null,
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
        this.filteredHeadOffices = [];
    }

    cancel() {
        this.router.navigate(['/admin/organization/branch']);
    }

    toggleContact() {
        this.contactExpanded = !this.contactExpanded;
    }
}
