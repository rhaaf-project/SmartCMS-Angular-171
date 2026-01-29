import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { toggleAnimation } from '../shared/animations';
import { AppService } from '../service/app.service';
import { MenuModule } from 'headlessui-angular';
import { IconCaretDownComponent } from '../shared/icon/icon-caret-down';
import { NgClass, NgFor } from '@angular/common';
import { IconMailComponent } from '../shared/icon/icon-mail';
import { IconLockDotsComponent } from '../shared/icon/icon-lock-dots';
import { IconInstagramComponent } from '../shared/icon/icon-instagram';
import { IconFacebookComponent } from '../shared/icon/icon-facebook';
import { IconTwitterComponent } from '../shared/icon/icon-twitter';
import { IconGoogleComponent } from '../shared/icon/icon-google';
import { FormsModule } from '@angular/forms';

@Component({
    templateUrl: './cover-login.html',
    animations: [toggleAnimation],
    imports: [
        RouterModule,
        NgFor,
        NgClass,
        MenuModule,
        FormsModule,
        IconCaretDownComponent,
        IconMailComponent,
        IconLockDotsComponent,
        IconInstagramComponent,
        IconFacebookComponent,
        IconTwitterComponent,
        IconGoogleComponent,
    ],
})
export class CoverLoginComponent {
    store: any;
    currYear: number = new Date().getFullYear();
    email: string = '';
    password: string = '';
    errorMessage: string = '';
    isLoading: boolean = false;

    // Valid credentials
    private validCredentials = [
        { email: 'root@smartcms.local', password: 'Maja1234' },
        { email: 'admin@smartx.local', password: 'admin123' },
        { email: 'cmsadmin@smartx.local', password: 'Admin@123' },
    ];

    constructor(
        public translate: TranslateService,
        public storeData: Store<any>,
        public router: Router,
        private appSetting: AppService,
    ) {
        this.initStore();
    }
    async initStore() {
        this.storeData
            .select((d) => d.index)
            .subscribe((d) => {
                this.store = d;
            });
    }

    login() {
        this.errorMessage = '';
        this.isLoading = true;

        // Validate inputs
        if (!this.email || !this.password) {
            this.errorMessage = 'Email and password are required';
            this.isLoading = false;
            return;
        }

        // Check credentials
        const isValidCredential = this.validCredentials.some(
            (cred) => cred.email === this.email && cred.password === this.password
        );

        if (isValidCredential) {
            // Store user info in localStorage
            localStorage.setItem('userEmail', this.email);
            localStorage.setItem('isLoggedIn', 'true');
            
            setTimeout(() => {
                this.isLoading = false;
                this.router.navigate(['/']);
            }, 500);
        } else {
            this.errorMessage = 'Invalid email or password';
            this.isLoading = false;
        }
    }

    changeLanguage(item: any) {
        this.translate.use(item.code);
        this.appSetting.toggleLanguage(item);
        if (this.store.locale?.toLowerCase() === 'ae') {
            this.storeData.dispatch({ type: 'toggleRTL', payload: 'rtl' });
        } else {
            this.storeData.dispatch({ type: 'toggleRTL', payload: 'ltr' });
        }
        window.location.reload();
    }
}
