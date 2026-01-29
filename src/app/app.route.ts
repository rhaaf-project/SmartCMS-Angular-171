import { Routes } from '@angular/router';

// layouts
import { AppLayout } from './layouts/app-layout';
import { AuthLayout } from './layouts/auth-layout';

import { NotFoundComponent } from './not-found';
import { AuthGuard } from '../auth.guard';

export const routes: Routes = [
    // Default route - redirect to admin
    {
        path: '',
        redirectTo: '/admin',
        pathMatch: 'full',
    },

    // Admin protected route
    {
        path: 'admin',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            // dashboard
            { path: '', loadComponent: () => import('./index').then((d) => d.IndexComponent), data: { title: 'Dashboard | SmartUCX' } },
            { path: 'analytics', loadComponent: () => import('./analytics').then((d) => d.AnalyticsComponent), data: { title: 'Analytics | SmartUCX' } },
            { path: 'finance', loadComponent: () => import('./finance').then((d) => d.FinanceComponent), data: { title: 'Finance | SmartUCX' } },
            { path: 'crypto', loadComponent: () => import('./crypto').then((d) => d.CryptoComponent), data: { title: 'Crypto | SmartUCX' } },

            // widgets
            { path: 'widgets', loadComponent: () => import('./widgets').then((d) => d.WidgetsComponent), data: { title: 'Widgets | SmartUCX' } },

            // font-icons
            { path: 'font-icons', loadComponent: () => import('./font-icons').then((d) => d.FontIconsComponent), data: { title: 'Font Icons | SmartUCX' } },

            // charts
            { path: 'charts', loadComponent: () => import('./charts').then((d) => d.ChartsComponent), data: { title: 'Charts | SmartUCX' } },

            // dragndrop
            { path: 'dragndrop', loadComponent: () => import('./dragndrop').then((d) => d.DragndropComponent), data: { title: 'Drag & Drop | SmartUCX' } },

            // pages
            {
                path: 'pages/knowledge-base',
                loadComponent: () => import('./pages/knowledge-base').then((d) => d.KnowledgeBaseComponent),
                data: { title: 'Knowledge Base | SmartUCX' },
            },
            { path: 'pages/faq', loadComponent: () => import('./pages/faq').then((d) => d.FaqComponent), data: { title: 'FAQ | SmartUCX' } },

            //apps
            { path: 'apps', loadChildren: () => import('./apps/apps.routes').then((d) => d.APPS_ROUTES) },

            // components
            { path: 'components', loadChildren: () => import('./components/components.routes').then((d) => d.COMPONENTS_ROUTES) },

            // elements
            { path: 'elements', loadChildren: () => import('./elements/elements.routes').then((d) => d.ELEMENTS_ROUTES) },

            // forms
            { path: 'forms', loadChildren: () => import('./forms/form.routes').then((d) => d.FORMS_ROUTES) },

            // users
            { path: 'users', loadChildren: () => import('./users/user.routes').then((d) => d.USERS_ROUTES) },

            // tables
            { path: 'tables', loadComponent: () => import('./tables').then((d) => d.TablesComponent), data: { title: 'Tables | SmartUCX' } },
            { path: 'datatables', loadChildren: () => import('./datatables/datatables.routes').then((d) => d.DATATABLES_ROUTES) },
        ],
    },

    {
        path: '',
        component: AuthLayout,
        children: [
            // direct login page
            { path: 'login', loadComponent: () => import('./auth/boxed-signin').then((d) => d.BoxedSigninComponent), data: { title: 'Login | SmartUCX' } },

            // pages
            { path: 'pages', loadChildren: () => import('./pages/pages.routes').then((d) => d.PAGES_ROUTES) },

            // auth
            { path: 'auth', loadChildren: () => import('./auth/auth.routes').then((d) => d.AUTH_ROUTES) },
        ],
    },

    // Catch-all - 404
    { path: '**', loadComponent: () => import('./not-found').then((d) => d.NotFoundComponent) },
];
