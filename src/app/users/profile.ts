import { Component } from '@angular/core';
import { toggleAnimation } from '../shared/animations';
import { IconPencilPaperComponent } from '../shared/icon/icon-pencil-paper';
import { IconCoffeeComponent } from '../shared/icon/icon-coffee';
import { IconCalendarComponent } from '../shared/icon/icon-calendar';
import { IconMapPinComponent } from '../shared/icon/icon-map-pin';
import { IconMailComponent } from '../shared/icon/icon-mail';
import { IconPhoneComponent } from '../shared/icon/icon-phone';
import { IconTwitterComponent } from '../shared/icon/icon-twitter';
import { IconDribbbleComponent } from '../shared/icon/icon-dribbble';
import { IconGithubComponent } from '../shared/icon/icon-github';
import { IconShoppingBagComponent } from '../shared/icon/icon-shopping-bag';
import { IconTagComponent } from '../shared/icon/icon-tag';
import { IconCreditCardComponent } from '../shared/icon/icon-credit-card';
import { IconClockComponent } from '../shared/icon/icon-clock';
import { IconHorizontalDotsComponent } from '../shared/icon/icon-horizontal-dots';
import { MenuModule } from 'headlessui-angular';
import { RouterModule } from '@angular/router';

@Component({
    templateUrl: './profile.html',
    animations: [toggleAnimation],
    imports: [
        IconPencilPaperComponent,
        RouterModule,
        IconCoffeeComponent,
        IconCalendarComponent,
        IconMapPinComponent,
        IconMailComponent,
        IconPhoneComponent,
        IconTwitterComponent,
        IconDribbbleComponent,
        IconGithubComponent,
        IconShoppingBagComponent,
        IconTagComponent,
        IconCreditCardComponent,
        IconClockComponent,
        IconHorizontalDotsComponent,
        MenuModule,
    ],
})
export class ProfileComponent {
    constructor() {}
}
