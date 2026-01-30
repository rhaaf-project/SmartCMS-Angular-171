import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { OrganizationService, Company, HeadOffice } from '../services/organization.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-head-office-form',
    templateUrl: './head-office-form.html',
    imports: [CommonModule, FormsModule, RouterModule],
})
export class HeadOfficeFormComponent implements OnInit {
    isEdit = false;
    headOfficeId: number | null = null;
    contactExpanded = false;
    isLoading = false;

    companies: Company[] = [];

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
        private route: ActivatedRoute,
        private organizationService: OrganizationService
    ) { }

    ngOnInit(): void {
        this.loadCompanies();

        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEdit = true;
            this.headOfficeId = +id;
            this.loadHeadOffice(this.headOfficeId);
        }
    }

    loadCompanies() {
        this.organizationService.getCompanies().subscribe({
            next: (response) => {
                this.companies = response.data || [];
            },
            error: (err) => {
                console.error('Failed to load companies:', err);
            }
        });
    }

    loadHeadOffice(id: number) {
        this.organizationService.getHeadOffice(id).subscribe({
            next: (response: any) => {
                const data = response.data || response;
                this.headOffice = {
                    companyId: data.customer_id,
                    name: data.name || '',
                    code: data.code || '',
                    active: data.is_active ?? true,
                    type: data.type || 'ha',
                    country: data.country || 'Indonesia',
                    province: data.province || '',
                    city: data.city || '',
                    district: data.district || '',
                    address: data.address || '',
                    contactName: data.contact_name || '',
                    contactPhone: data.contact_phone || '',
                    description: data.description || '',
                };
            },
            error: (err) => {
                console.error('Failed to load head office:', err);
                Swal.fire('Error', 'Failed to load head office data', 'error');
            }
        });
    }

    submit() {
        this.isLoading = true;
        const payload: HeadOffice = {
            customer_id: this.headOffice.companyId!,
            name: this.headOffice.name,
            code: this.headOffice.code,
            is_active: this.headOffice.active,
            type: this.headOffice.type as 'basic' | 'ha' | 'fo',
            country: this.headOffice.country,
            province: this.headOffice.province,
            city: this.headOffice.city,
            district: this.headOffice.district,
            address: this.headOffice.address,
            contact_name: this.headOffice.contactName,
            contact_phone: this.headOffice.contactPhone,
            description: this.headOffice.description,
        };

        if (this.isEdit && this.headOfficeId) {
            this.organizationService.updateHeadOffice(this.headOfficeId, payload).subscribe({
                next: () => {
                    this.isLoading = false;
                    Swal.fire('Success', 'Head Office updated successfully', 'success');
                    this.router.navigate(['/admin/organization/head-office']);
                },
                error: (err) => {
                    this.isLoading = false;
                    console.error('Failed to update head office:', err);
                    Swal.fire('Error', 'Failed to update head office', 'error');
                }
            });
        } else {
            this.organizationService.createHeadOffice(payload).subscribe({
                next: () => {
                    this.isLoading = false;
                    Swal.fire('Success', 'Head Office created successfully', 'success');
                    this.router.navigate(['/admin/organization/head-office']);
                },
                error: (err) => {
                    this.isLoading = false;
                    console.error('Failed to create head office:', err);
                    Swal.fire('Error', 'Failed to create head office', 'error');
                }
            });
        }
    }

    submitAndCreateAnother() {
        this.isLoading = true;
        const payload: HeadOffice = {
            customer_id: this.headOffice.companyId!,
            name: this.headOffice.name,
            code: this.headOffice.code,
            is_active: this.headOffice.active,
            type: this.headOffice.type as 'basic' | 'ha' | 'fo',
            country: this.headOffice.country,
            province: this.headOffice.province,
            city: this.headOffice.city,
            district: this.headOffice.district,
            address: this.headOffice.address,
            contact_name: this.headOffice.contactName,
            contact_phone: this.headOffice.contactPhone,
            description: this.headOffice.description,
        };

        this.organizationService.createHeadOffice(payload).subscribe({
            next: () => {
                this.isLoading = false;
                Swal.fire('Success', 'Head Office created successfully', 'success');
                this.resetForm();
            },
            error: (err) => {
                this.isLoading = false;
                console.error('Failed to create head office:', err);
                Swal.fire('Error', 'Failed to create head office', 'error');
            }
        });
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

