import { Routes } from '@angular/router';
import { AuthGuard } from '../../auth.guard';

export const routes: Routes = [
    {
        path: 'static-route',
        loadComponent: () => import('./static-route').then((c) => c.StaticRouteComponent),
        data: { pageKey: 'network.static_route' },
        canActivate: [AuthGuard],
    },
    {
        path: 'firewall',
        loadComponent: () => import('./firewall').then((c) => c.FirewallComponent),
        data: { pageKey: 'network.firewall' },
        canActivate: [AuthGuard],
    },
];
