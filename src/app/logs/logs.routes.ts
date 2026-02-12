import { Routes } from '@angular/router';
import { AuthGuard } from '../../auth.guard';

export const logsRoutes: Routes = [
    {
        path: 'system-logs',
        loadComponent: () => import('./system-logs').then((d) => d.SystemLogsComponent),
        data: { title: 'System Logs | SmartUCX', pageKey: 'logs.system_log' },
        canActivate: [AuthGuard],
    },
    {
        path: 'activity-logs',
        loadComponent: () => import('./activity-logs').then((d) => d.ActivityLogsComponent),
        data: { title: 'Activity Logs | SmartUCX', pageKey: 'logs.activity_log' },
        canActivate: [AuthGuard],
    },
    {
        path: 'call-logs',
        loadComponent: () => import('./call-logs').then((d) => d.CallLogsComponent),
        data: { title: 'Call Logs | SmartUCX', pageKey: 'logs.call_log' },
        canActivate: [AuthGuard],
    },
    {
        path: 'alarm-notification',
        loadComponent: () => import('./alarm-notification').then((d) => d.AlarmNotificationComponent),
        data: { title: 'Alarm & Notification | SmartUCX', pageKey: 'logs.alarm_notification' },
        canActivate: [AuthGuard],
    },
    {
        path: 'usage-report',
        loadComponent: () => import('./usage-report').then((d) => d.UsageReportComponent),
        data: { title: 'Usage Report | SmartUCX' },
    },
];
