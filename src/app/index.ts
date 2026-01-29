import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { toggleAnimation } from './shared/animations';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
    templateUrl: './index.html',
    animations: [toggleAnimation],
    imports: [CommonModule],
})
export class IndexComponent {
    store: any;
    stats: any = {};
    isLoading = true;
    private http = inject(HttpClient);

    constructor(public storeData: Store<any>) {
        this.initStore();
        this.loadStats();
    }

    async initStore() {
        this.storeData
            .select((d) => d.index)
            .subscribe((d) => {
                this.store = d;
            });
    }

    loadStats() {
        this.isLoading = true;
        const apiUrl = `${environment.apiUrl}/v1/stats`;

        this.http.get<any>(apiUrl).subscribe({
            next: (response) => {
                this.stats = response.data || {};
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Failed to load stats:', error);
                // Set default values
                this.stats = {
                    ho: { active: 0, inactive: 0 },
                    branch: { active: 0, inactive: 0 },
                    callServer: { active: 0, inactive: 0 },
                    users: { active: 0, inactive: 0 },
                    line: { active: 0, inactive: 0 },
                    extension: { active: 0, inactive: 0 },
                    vpw: { active: 0, inactive: 0 },
                    cas: { active: 0, inactive: 0 },
                    trunk: { active: 0, inactive: 0 },
                    sbc: { active: 0, inactive: 0 },
                    privateWire: { active: 0, inactive: 0 },
                    intercom: { active: 0, inactive: 0 },
                    inboundRoute: { active: 0, inactive: 0 },
                    outboundRoute: { active: 0, inactive: 0 },
                    thirdParty: { active: 0, inactive: 0 },
                };
                this.isLoading = false;
            },
        });
    }
}
