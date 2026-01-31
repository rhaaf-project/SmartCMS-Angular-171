import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { toggleAnimation } from '../shared/animations';
import { AppService } from '../service/app.service';
import { IconCaretDownComponent } from '../shared/icon/icon-caret-down';
import { MenuModule } from 'headlessui-angular';
import { NgFor, NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconMailComponent } from '../shared/icon/icon-mail';
import { IconLockDotsComponent } from '../shared/icon/icon-lock-dots';
import { IconInstagramComponent } from '../shared/icon/icon-instagram';
import { IconFacebookCircleComponent } from '../shared/icon/icon-facebook-circle';
import { IconTwitterComponent } from '../shared/icon/icon-twitter';
import { IconGoogleComponent } from '../shared/icon/icon-google';

@Component({
    templateUrl: './boxed-signin.html',
    animations: [toggleAnimation],
    imports: [
        NgFor,
        NgClass,
        CommonModule,
        MenuModule,
        RouterModule,
        FormsModule,
        IconCaretDownComponent,
        IconMailComponent,
        IconLockDotsComponent,
        IconInstagramComponent,
        IconFacebookCircleComponent,
        IconTwitterComponent,
        IconGoogleComponent,
    ],
})
export class BoxedSigninComponent {
    store: any;
    email: string = '';
    password: string = '';
    loading: boolean = false;
    errorMessage: string = '';
    showPassword: boolean = false;

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

    handleLogin(event: any) {
        event.preventDefault();
        this.errorMessage = '';
        this.loading = true;

        // Validate inputs
        if (!this.email || !this.password) {
            this.errorMessage = 'Email and password are required';
            this.loading = false;
            return;
        }

        // Check credentials
        const isValid = this.validCredentials.some(
            (cred) => cred.email === this.email && cred.password === this.password
        );

        if (isValid) {
            localStorage.setItem('auth_token', 'demo_token_' + Date.now());
            localStorage.setItem('userEmail', this.email);
            localStorage.setItem('isLoggedIn', 'true');
            setTimeout(() => {
                this.loading = false;
                this.router.navigate(['/admin']);
            }, 500);
        } else {
            this.errorMessage = 'Invalid email or password';
            this.loading = false;
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
