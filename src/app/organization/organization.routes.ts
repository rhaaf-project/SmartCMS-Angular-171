import { Routes } from '@angular/router';
import { AuthGuard } from '../../auth.guard';

export const ORGANIZATION_ROUTES: Routes = [
    // Connectivity Diagram
    {
        path: 'connectivity-diagram',
        loadComponent: () => import('./connectivity-diagram/connectivity-diagram').then((d) => d.ConnectivityDiagramComponent),
        data: { title: 'Connectivity Diagram | SmartUCX', pageKey: 'organization.connectivity_diagram' },
        canActivate: [AuthGuard],
    },
    // Company routes
    {
        path: 'company',
        loadComponent: () => import('./company/company-list').then((d) => d.CompanyListComponent),
        data: { title: 'Company | SmartUCX', pageKey: 'organization.company' },
        canActivate: [AuthGuard],
    },
    // Head Office routes
    {
        path: 'head-office',
        loadComponent: () => import('./head-office/head-office-list').then((d) => d.HeadOfficeListComponent),
        data: { title: 'Head Office | SmartUCX', pageKey: 'organization.head_office' },
        canActivate: [AuthGuard],
    },
    // Branch routes
    {
        path: 'branch',
        loadComponent: () => import('./branch/branch-list').then((d) => d.BranchListComponent),
        data: { title: 'Branch | SmartUCX', pageKey: 'organization.branch' },
        canActivate: [AuthGuard],
    },
    // Sub Branch routes
    {
        path: 'sub-branch',
        loadComponent: () => import('./sub-branch/sub-branch-list').then((d) => d.SubBranchListComponent),
        data: { title: 'Sub Branch | SmartUCX', pageKey: 'organization.sub_branch' },
        canActivate: [AuthGuard],
    },
];
