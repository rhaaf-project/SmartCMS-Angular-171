import { Routes } from '@angular/router';

export const ORGANIZATION_ROUTES: Routes = [
    // Company routes
    {
        path: 'company',
        loadComponent: () => import('./company/company-list').then((d) => d.CompanyListComponent),
        data: { title: 'Company | SmartUCX' },
    },
    {
        path: 'company/create',
        loadComponent: () => import('./company/company-form').then((d) => d.CompanyFormComponent),
        data: { title: 'Create Company | SmartUCX' },
    },
    {
        path: 'company/edit/:id',
        loadComponent: () => import('./company/company-form').then((d) => d.CompanyFormComponent),
        data: { title: 'Edit Company | SmartUCX' },
    },
    {
        path: 'company/:id',
        loadComponent: () => import('./company/company-form').then((d) => d.CompanyFormComponent),
        data: { title: 'View Company | SmartUCX' },
    },
    // Head Office routes
    {
        path: 'head-office',
        loadComponent: () => import('./head-office/head-office-list').then((d) => d.HeadOfficeListComponent),
        data: { title: 'Head Office | SmartUCX' },
    },
    {
        path: 'head-office/create',
        loadComponent: () => import('./head-office/head-office-form').then((d) => d.HeadOfficeFormComponent),
        data: { title: 'Create Head Office | SmartUCX' },
    },
    {
        path: 'head-office/edit/:id',
        loadComponent: () => import('./head-office/head-office-form').then((d) => d.HeadOfficeFormComponent),
        data: { title: 'Edit Head Office | SmartUCX' },
    },
    {
        path: 'head-office/:id',
        loadComponent: () => import('./head-office/head-office-form').then((d) => d.HeadOfficeFormComponent),
        data: { title: 'View Head Office | SmartUCX' },
    },
    // Branch routes
    {
        path: 'branch',
        loadComponent: () => import('./branch/branch-list').then((d) => d.BranchListComponent),
        data: { title: 'Branch | SmartUCX' },
    },
    {
        path: 'branch/create',
        loadComponent: () => import('./branch/branch-form').then((d) => d.BranchFormComponent),
        data: { title: 'Create Branch | SmartUCX' },
    },
    {
        path: 'branch/edit/:id',
        loadComponent: () => import('./branch/branch-form').then((d) => d.BranchFormComponent),
        data: { title: 'Edit Branch | SmartUCX' },
    },
    {
        path: 'branch/:id',
        loadComponent: () => import('./branch/branch-form').then((d) => d.BranchFormComponent),
        data: { title: 'View Branch | SmartUCX' },
    },
    // Sub Branch routes
    {
        path: 'sub-branch',
        loadComponent: () => import('./sub-branch/sub-branch-list').then((d) => d.SubBranchListComponent),
        data: { title: 'Sub Branch | SmartUCX' },
    },
    {
        path: 'sub-branch/create',
        loadComponent: () => import('./sub-branch/sub-branch-form').then((d) => d.SubBranchFormComponent),
        data: { title: 'Create Sub Branch | SmartUCX' },
    },
    {
        path: 'sub-branch/edit/:id',
        loadComponent: () => import('./sub-branch/sub-branch-form').then((d) => d.SubBranchFormComponent),
        data: { title: 'Edit Sub Branch | SmartUCX' },
    },
    {
        path: 'sub-branch/:id',
        loadComponent: () => import('./sub-branch/sub-branch-form').then((d) => d.SubBranchFormComponent),
        data: { title: 'View Sub Branch | SmartUCX' },
    },
];

