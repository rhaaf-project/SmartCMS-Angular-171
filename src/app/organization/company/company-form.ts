import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
    selector: 'app-company-form',
    templateUrl: './company-form.html',
    imports: [CommonModule, FormsModule, RouterModule],
})
export class CompanyFormComponent implements OnInit {
    isEdit = false;
    companyId: number | null = null;
    additionalInfoExpanded = false;

    company = {
        name: '',
        code: '',
        active: true,
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEdit = true;
            this.companyId = +id;
            this.loadCompany(this.companyId);
        }
    }

    loadCompany(id: number) {
        // TODO: Replace with API call
        if (id === 1) {
            this.company = {
                name: 'Smart Infinite Prosperity',
                code: 'Smart',
                active: true,
                contactPerson: 'Joni Me Ow',
                email: 'joni@smart.com',
                phone: '02150877432',
                address: 'Jakarta, Indonesia',
            };
        }
    }

    submit() {
        if (this.isEdit) {
            console.log('Updating company:', this.company);
        } else {
            console.log('Creating company:', this.company);
        }
        this.router.navigate(['/admin/organization/company']);
    }

    submitAndCreateAnother() {
        if (this.isEdit) {
            this.submit();
        } else {
            console.log('Creating company:', this.company);
            this.company = {
                name: '',
                code: '',
                active: true,
                contactPerson: '',
                email: '',
                phone: '',
                address: '',
            };
        }
    }

    cancel() {
        this.router.navigate(['/admin/organization/company']);
    }

    toggleAdditionalInfo() {
        this.additionalInfoExpanded = !this.additionalInfoExpanded;
    }
}
