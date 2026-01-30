import { Routes } from '@angular/router';

export const CONNECTIVITY_ROUTES: Routes = [
    {
        path: 'call-servers',
        loadComponent: () => import('./call-servers').then((d) => d.CallServersComponent),
        title: 'Call Servers | SmartUCX',
    },
];
