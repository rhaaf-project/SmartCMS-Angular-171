import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
    selector: 'app-head-office-form',
    templateUrl: './head-office-form.html',
    imports: [CommonModule, FormsModule, RouterModule],
})
export class HeadOfficeFormComponent implements OnInit {
    isEdit = false;
    headOfficeId: number | null = null;
    contactExpanded = false;

    companies = [
        { id: 1, name: 'Smart Infinite Prosperity' },
        { id: 2, name: 'ABC Corporation' },
    ];

    siteTypes = [
        { value: 'basic', label: 'Basic (Single Site)' },
        { value: 'ha', label: 'HA (High Availability)' },
        { value: 'fo', label: 'FO (Failover/Redundancy)' },
    ];

    headOffice = {
        companyId: null as number | null,
        name: '',
        code: '',
        active: true,
        type: 'ha',
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
            this.headOfficeId = +id;
            this.loadHeadOffice(this.headOfficeId);
        }
    }

    loadHeadOffice(id: number) {
        // TODO: Replace with API call
        if (id === 1) {
            this.headOffice = {
                companyId: 1,
                name: 'HO Jakarta',
                code: 'HO-JKT',
                active: true,
                type: 'ha',
                country: 'Indonesia',
                province: 'DKI Jakarta',
                city: 'Jakarta',
                district: 'Menteng',
                address: 'Jl. Sudirman No. 1',
                contactName: 'John Doe',
                contactPhone: '021-123456',
                description: 'Main head office',
            };
        }
    }

    submit() {
        if (this.isEdit) {
            console.log('Updating head office:', this.headOffice);
        } else {
            console.log('Creating head office:', this.headOffice);
        }
        this.router.navigate(['/admin/organization/head-office']);
    }

    submitAndCreateAnother() {
        console.log('Creating head office:', this.headOffice);
        this.resetForm();
    }

    resetForm() {
        this.headOffice = {
            companyId: null,
            name: '',
            code: '',
            active: true,
            type: 'ha',
            country: 'Indonesia',
            province: '',
            city: '',
            district: '',
            address: '',
            contactName: '',
            contactPhone: '',
            description: '',
        };
    }

    cancel() {
        this.router.navigate(['/admin/organization/head-office']);
    }

    toggleContact() {
        this.contactExpanded = !this.contactExpanded;
    }
}
