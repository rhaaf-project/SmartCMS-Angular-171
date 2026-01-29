import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { toggleAnimation } from '../shared/animations';
import { AppService } from '../service/app.service';
import { IconCaretDownComponent } from '../shared/icon/icon-caret-down';
import { MenuModule } from 'headlessui-angular';
import { NgFor, NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IconMailComponent } from '../shared/icon/icon-mail';
import { IconLockDotsComponent } from '../shared/icon/icon-lock-dots';
import { IconInstagramComponent } from '../shared/icon/icon-instagram';
import { IconFacebookCircleComponent } from '../shared/icon/icon-facebook-circle';
import { IconTwitterComponent } from '../shared/icon/icon-twitter';
import { IconGoogleComponent } from '../shared/icon/icon-google';
import { environment } from '../../environments/environment';

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
    
    private http = inject(HttpClient);

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

        const apiUrl = `${environment.apiUrl}/login`;
        
        this.http.post<any>(apiUrl, {
            email: this.email,
            password: this.password,
        }).subscribe({
            next: (response) => {
                this.loading = false;
                if (response.token) {
                    // Store token
                    localStorage.setItem('auth_token', response.token);
                    // Navigate to admin
                    this.router.navigate(['/admin']);
                } else {
                    this.errorMessage = response.message || 'Login failed';
                }
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Invalid email or password';
            },
        });
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
